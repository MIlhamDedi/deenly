import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StreakPause } from '@/types';

/**
 * Calculate total verses read today for a journey by querying reading logs
 */
export async function calculateTodayVerses(journeyId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Query all reading logs for this journey from today
  const readingLogsRef = collection(db, 'journeys', journeyId, 'readingLogs');
  const todayLogsQuery = query(
    readingLogsRef,
    where('timestamp', '>=', today),
    where('timestamp', '<', tomorrow)
  );
  const todayLogsSnapshot = await getDocs(todayLogsQuery);

  // Sum up all verse counts from today's logs
  let todayVerses = 0;
  todayLogsSnapshot.forEach((doc) => {
    const log = doc.data();
    todayVerses += log.verseCount || 0;
  });

  return todayVerses;
}

/**
 * Calculate streak information for a user (pause-aware)
 */
export function calculateStreak(
  currentStreak: number,
  lastReadDate: Timestamp | null,
  pauses?: StreakPause[]
): { newStreak: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = 1;

  if (lastReadDate) {
    const lastRead = lastReadDate.toDate();
    lastRead.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastRead.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day - keep current streak
      newStreak = currentStreak;
    } else {
      // Check if the gap is covered by pauses
      const uncoveredDays = countUncoveredDays(lastRead, today, pauses || []);

      if (uncoveredDays === 0) {
        // All days covered by pauses - increment streak
        newStreak = currentStreak + 1;
      } else if (uncoveredDays === 1) {
        // Yesterday not covered, but we're reading today - increment streak
        newStreak = currentStreak + 1;
      } else {
        // 2+ uncovered days - streak resets to 1
        newStreak = 1;
      }
    }
  }

  return { newStreak };
}

/**
 * Calculate today's verses for a user (across all their activity)
 */
export function calculateUserTodayVerses(
  currentTodayVerses: number,
  todayDate: Timestamp | null,
  verseCount: number
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let todayVerses = verseCount;

  if (todayDate) {
    const storedDate = todayDate.toDate();
    storedDate.setHours(0, 0, 0, 0);

    const isSameDay = today.getTime() === storedDate.getTime();
    if (isSameDay) {
      // Same day - add to today's count
      todayVerses = currentTodayVerses + verseCount;
    }
    // else: different day - reset to current verse count
  }

  return todayVerses;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | Timestamp): boolean {
  const checkDate = date instanceof Date ? date : date.toDate();
  checkDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return checkDate.getTime() === today.getTime();
}

/**
 * Check if a specific date is covered by any streak pause
 */
export function isDateCoveredByPause(date: Date, pauses: StreakPause[]): boolean {
  if (!pauses || pauses.length === 0) return false;

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return pauses.some(pause => {
    const start = pause.startDate.toDate();
    start.setHours(0, 0, 0, 0);

    const end = pause.endDate ? pause.endDate.toDate() : new Date();
    end.setHours(0, 0, 0, 0);

    return checkDate >= start && checkDate <= end;
  });
}

/**
 * Count uncovered days between two dates (excluding pauses)
 */
export function countUncoveredDays(
  startDate: Date,
  endDate: Date,
  pauses: StreakPause[]
): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) return 0;

  let uncoveredDays = 0;
  for (let i = 1; i <= totalDays; i++) {
    const checkDate = new Date(start);
    checkDate.setDate(checkDate.getDate() + i);

    if (!isDateCoveredByPause(checkDate, pauses)) {
      uncoveredDays++;
    }
  }

  return uncoveredDays;
}

/**
 * Get the actual current streak status based on lastReadDate
 * Returns the streak value and its status (pause-aware)
 */
export function getStreakStatus(
  currentStreak: number,
  lastReadDate: Timestamp | null,
  pauses?: StreakPause[]
): {
  actualStreak: number;
  status: 'active' | 'at-risk' | 'broken' | 'paused';
  isPaused: boolean;
} {
  // Check if currently paused
  const isPaused = pauses?.some(p => p.endDate === null) || false;

  if (!lastReadDate || currentStreak === 0) {
    return {
      actualStreak: 0,
      status: isPaused ? 'paused' : 'broken',
      isPaused
    };
  }

  const lastRead = lastReadDate.toDate();
  lastRead.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastRead.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If currently paused, streak is preserved
  if (isPaused) {
    return { actualStreak: currentStreak, status: 'paused', isPaused: true };
  }

  if (diffDays === 0) {
    // Read today - streak is active and safe
    return { actualStreak: currentStreak, status: 'active', isPaused: false };
  }

  // For gaps > 0 days, check if days are covered by pauses
  const uncoveredDays = countUncoveredDays(lastRead, today, pauses || []);

  if (uncoveredDays === 0) {
    // All days covered by pauses - streak is active
    return { actualStreak: currentStreak, status: 'active', isPaused: false };
  } else if (uncoveredDays === 1) {
    // Yesterday not covered - at risk (need to read today)
    return { actualStreak: currentStreak, status: 'at-risk', isPaused: false };
  } else {
    // 2+ uncovered days - streak is broken
    return { actualStreak: 0, status: 'broken', isPaused: false };
  }
}
