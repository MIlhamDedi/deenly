import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  writeBatch,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReadingLog, JourneyMember } from '@/types';
import { calculateVerseCount, expandVerseRange } from '@/lib/verseUtils';
import { calculateTodayVerses, calculateStreak, calculateUserTodayVerses } from './statsService';

export interface LogReadingInput {
  journeyId: string;
  currentUserId: string;
  currentUserName: string;
  selectedUserIds: string[];
  members: JourneyMember[];
  startRef: string;
  endRef: string;
  note?: string;
}

export interface LogReadingMultipleInput {
  journeyIds: string[];
  currentUserId: string;
  currentUserName: string;
  selectedUserIds: string[];
  journeyMembersMap: Map<string, JourneyMember[]>;
  startRef: string;
  endRef: string;
  note?: string;
}

/**
 * Create a default personal journey for a user
 * Called automatically when user logs reading for the first time with no journeys
 */
export async function createDefaultJourney(
  userId: string,
  displayName: string
): Promise<string> {
  const journeysRef = collection(db, 'journeys');

  const newJourney = {
    name: `${displayName}'s Personal Reading`,
    description: 'My personal Quran reading journey',
    createdBy: userId,
    createdAt: serverTimestamp(),
    memberIds: [userId],
    stats: {
      versesCompleted: 0,
      completionPercentage: 0,
      versesReadToday: 0,
      lastActivityAt: serverTimestamp(),
    },
    targetEndDate: null,
  };

  const journeyDoc = await addDoc(journeysRef, newJourney);

  // Add creator as owner member
  const memberRef = doc(db, `journeys/${journeyDoc.id}/members`, userId);
  await updateDoc(doc(db, 'journeys', journeyDoc.id), {});

  // Create member document
  const batch = writeBatch(db);
  batch.set(memberRef, {
    userId,
    displayName,
    email: '', // Will be filled later if needed
    role: 'owner',
    joinedAt: serverTimestamp(),
    stats: {
      versesRead: 0,
      lastReadAt: null,
      totalReadings: 0,
    },
  });

  await batch.commit();

  return journeyDoc.id;
}

/**
 * Log a reading for a journey and update all related stats
 */
export async function logReading(input: LogReadingInput): Promise<void> {
  const {
    journeyId,
    currentUserId,
    currentUserName,
    selectedUserIds,
    members,
    startRef,
    endRef,
    note,
  } = input;

  const readingSessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  await logReadingForJourney({
    journeyId,
    readingSessionId,
    currentUserId,
    currentUserName,
    selectedUserIds,
    members,
    startRef,
    endRef,
    note,
    updatePersonal: true,
  });
}

// Internal: create the log and update journey stats. Optionally update personal stats.
async function logReadingForJourney(params: {
  journeyId: string;
  readingSessionId: string;
  currentUserId: string;
  currentUserName: string;
  selectedUserIds: string[];
  members: JourneyMember[];
  startRef: string;
  endRef: string;
  note?: string;
  updatePersonal: boolean;
}): Promise<void> {
  const {
    journeyId,
    readingSessionId,
    currentUserId,
    currentUserName,
    selectedUserIds,
    members,
    startRef,
    endRef,
    note,
    updatePersonal,
  } = params;

  const verseCount = calculateVerseCount(startRef, endRef);

  // Only include users that are members of this journey
  const memberIds = new Set((members || []).map((m) => m.userId));
  const userIdsForJourney = selectedUserIds.filter((id) => memberIds.has(id));

  const readByNames = userIdsForJourney.map((userId) => {
    const member = (members || []).find((m) => m.userId === userId);
    return member?.displayName || 'Unknown';
  });

  const logData: Omit<ReadingLog, 'id'> = {
    journeyId,
    readingSessionId,
    loggedBy: currentUserId,
    loggedByName: currentUserName,
    readBy: userIdsForJourney,
    readByNames,
    startRef,
    endRef,
    timestamp: serverTimestamp() as any,
    verseCount,
    ...(note?.trim() && { note: note.trim() }),
  };

  await addDoc(collection(db, 'journeys', journeyId, 'readingLogs'), logData);

  const allVerses = expandVerseRange(startRef, endRef);

  const newVerses: string[] = [];
  for (const verseRef of allVerses) {
    const verseDocRef = doc(db, 'journeys', journeyId, 'verseCompletions', verseRef);
    const verseDoc = await getDoc(verseDocRef);
    if (!verseDoc.exists()) {
      newVerses.push(verseRef);
    }
  }

  const todayVerses = await calculateTodayVerses(journeyId);
  const journeyRef = doc(db, 'journeys', journeyId);

  if (newVerses.length > 0) {
    const batch = writeBatch(db);
    newVerses.forEach((verseRef) => {
      const verseDocRef = doc(db, 'journeys', journeyId, 'verseCompletions', verseRef);
      batch.set(verseDocRef, {
        verseRef,
        completedAt: serverTimestamp(),
        completedBy: readByNames,
      });
    });

    batch.update(journeyRef, {
      'stats.versesCompleted': increment(newVerses.length),
      'stats.completionPercentage': increment((newVerses.length / 6236) * 100),
      'stats.lastActivityAt': serverTimestamp(),
      'stats.versesReadToday': todayVerses,
      'stats.todayDate': serverTimestamp(),
    });

    await batch.commit();
  } else {
    await updateDoc(journeyRef, {
      'stats.lastActivityAt': serverTimestamp(),
      'stats.versesReadToday': todayVerses,
      'stats.todayDate': serverTimestamp(),
    });
  }

  if (updatePersonal) {
    await updatePersonalStats(userIdsForJourney, verseCount);
  }

  await updateJourneyMemberStats(journeyId, userIdsForJourney);
}

// Public: log a single reading to multiple journeys with deduplicated personal stats.
export async function logReadingToMultipleJourneys(
  input: LogReadingMultipleInput
): Promise<void> {
  const {
    journeyIds,
    currentUserId,
    currentUserName,
    selectedUserIds,
    journeyMembersMap,
    startRef,
    endRef,
    note,
  } = input;

  if (!journeyIds || journeyIds.length === 0) return;

  const readingSessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const verseCount = calculateVerseCount(startRef, endRef);

  for (const journeyId of journeyIds) {
    const members = journeyMembersMap.get(journeyId) || [];
    await logReadingForJourney({
      journeyId,
      readingSessionId,
      currentUserId,
      currentUserName,
      selectedUserIds,
      members,
      startRef,
      endRef,
      note,
      updatePersonal: false,
    });
  }

  // Update personal stats once for the session (not multiplied by journeys)
  await updatePersonalStats(selectedUserIds, verseCount);
}

/**
 * Update personal stats for multiple users
 */
async function updatePersonalStats(userIds: string[], verseCount: number): Promise<void> {
  for (const userId of userIds) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentStats = userData.stats || {
        currentStreak: 0,
        longestStreak: 0,
        totalVersesRead: 0,
        totalReadings: 0,
      };

      const pauses = currentStats.streakPauses || [];
      const activePauseId = currentStats.activePauseId;

      // Auto-resume if there's an active pause
      let updatedPauses = pauses;
      let updatedActivePauseId = activePauseId;

      if (activePauseId) {
        // End the active pause
        updatedPauses = pauses.map((p: any) =>
          p.id === activePauseId ? { ...p, endDate: Timestamp.fromDate(new Date()) } : p
        );
        updatedActivePauseId = null;
      }

      // Calculate streak (with pauses considered)
      const { newStreak } = calculateStreak(
        currentStats.currentStreak,
        currentStats.lastReadDate || null,
        pauses
      );

      const newLongestStreak = Math.max(newStreak, currentStats.longestStreak || 0);

      // Calculate today's verses
      const todayVerses = calculateUserTodayVerses(
        currentStats.todayVersesRead || 0,
        currentStats.todayDate || null,
        verseCount
      );

      await updateDoc(userRef, {
        'stats.currentStreak': newStreak,
        'stats.longestStreak': newLongestStreak,
        'stats.totalVersesRead': increment(verseCount),
        'stats.totalReadings': increment(1),
        'stats.lastReadDate': serverTimestamp(),
        'stats.todayVersesRead': todayVerses,
        'stats.todayDate': serverTimestamp(),
        'stats.streakPauses': updatedPauses,
        'stats.activePauseId': updatedActivePauseId,
      });
    }
  }
}

/**
 * Update journey member stats by calculating unique verses from all their reading logs
 */
async function updateJourneyMemberStats(
  journeyId: string,
  userIds: string[]
): Promise<void> {
  for (const userId of userIds) {
    // Get all reading logs for this user in this journey
    const logsQuery = query(
      collection(db, 'journeys', journeyId, 'readingLogs'),
      where('readBy', 'array-contains', userId)
    );
    const logsSnapshot = await getDocs(logsQuery);

    // Collect all unique verses from all logs
    const allUniqueVerses = new Set<string>();
    for (const logDoc of logsSnapshot.docs) {
      const log = logDoc.data() as ReadingLog;
      const verses = expandVerseRange(log.startRef, log.endRef);
      verses.forEach((verse) => allUniqueVerses.add(verse));
    }

    // Update member stats with the calculated unique verse count
    const memberRef = doc(db, 'journeys', journeyId, 'members', userId);
    const memberDoc = await getDoc(memberRef);

    if (memberDoc.exists()) {
      await updateDoc(memberRef, {
        'stats.versesRead': allUniqueVerses.size,
        'stats.lastReadAt': serverTimestamp(),
        'stats.totalReadings': logsSnapshot.size,
      });
    }
  }
}
