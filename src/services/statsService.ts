import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
 * Calculate streak information for a user
 */
export function calculateStreak(
  currentStreak: number,
  lastReadDate: Timestamp | null
): { newStreak: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = 1;

  if (lastReadDate) {
    const lastRead = lastReadDate.toDate();
    lastRead.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastRead.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
      // Same day - keep current streak
      newStreak = currentStreak;
    } else if (diffDays === 1) {
      // Yesterday - increment streak
      newStreak = currentStreak + 1;
    }
    // else: more than 1 day gap - streak resets to 1
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
