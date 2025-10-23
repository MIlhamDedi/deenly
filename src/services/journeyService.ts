import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  writeBatch,
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

  const verseCount = calculateVerseCount(startRef, endRef);
  const readByNames = selectedUserIds.map((userId) => {
    const member = members.find((m) => m.userId === userId);
    return member?.displayName || 'Unknown';
  });

  // 1. Create the reading log entry
  const logData: Omit<ReadingLog, 'id'> = {
    journeyId,
    loggedBy: currentUserId,
    loggedByName: currentUserName,
    readBy: selectedUserIds,
    readByNames,
    startRef,
    endRef,
    timestamp: serverTimestamp() as any,
    verseCount,
    ...(note?.trim() && { note: note.trim() }),
  };

  await addDoc(collection(db, 'journeys', journeyId, 'readingLogs'), logData);

  // 2. Track unique verses and update journey stats
  const allVerses = expandVerseRange(startRef, endRef);

  // Check which verses are already completed
  const newVerses: string[] = [];
  for (const verseRef of allVerses) {
    const verseDocRef = doc(db, 'journeys', journeyId, 'verseCompletions', verseRef);
    const verseDoc = await getDoc(verseDocRef);

    if (!verseDoc.exists()) {
      newVerses.push(verseRef);
    }
  }

  // 3. Calculate today's total verses for this journey
  const todayVerses = await calculateTodayVerses(journeyId);

  const journeyRef = doc(db, 'journeys', journeyId);

  // 4. Update journey stats
  if (newVerses.length > 0) {
    const batch = writeBatch(db);

    // Add verseCompletion documents for new verses
    newVerses.forEach((verseRef) => {
      const verseDocRef = doc(db, 'journeys', journeyId, 'verseCompletions', verseRef);
      batch.set(verseDocRef, {
        verseRef,
        completedAt: serverTimestamp(),
        completedBy: readByNames,
      });
    });

    // Update journey stats with new verse count and today's total
    batch.update(journeyRef, {
      'stats.versesCompleted': increment(newVerses.length),
      'stats.completionPercentage': increment((newVerses.length / 6236) * 100),
      'stats.lastActivityAt': serverTimestamp(),
      'stats.versesReadToday': todayVerses,
      'stats.todayDate': serverTimestamp(),
    });

    await batch.commit();
  } else {
    // Still update lastActivityAt and today's verses even if no new verses
    await updateDoc(journeyRef, {
      'stats.lastActivityAt': serverTimestamp(),
      'stats.versesReadToday': todayVerses,
      'stats.todayDate': serverTimestamp(),
    });
  }

  // 5. Update personal stats for users who participated in this reading
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

      // Calculate streak
      const { newStreak } = calculateStreak(
        currentStats.currentStreak,
        currentStats.lastReadDate || null
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
      });
    }
  }
}
