import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { format, subDays, startOfDay } from 'date-fns';
import { ReadingLog } from '@/types';

export function useDailyReadingStats() {
  const { currentUser } = useAuth();
  const [dailyData, setDailyData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function fetchDailyStats() {
      try {
        // Get date range (last 12 weeks)
        const today = startOfDay(new Date());
        const startDate = subDays(today, 12 * 7);

        // Query all journeys to get reading logs where user participated
        const journeysRef = collection(db, 'journeys');
        const journeysQuery = query(
          journeysRef,
          where('memberIds', 'array-contains', currentUser!.uid)
        );
        const journeysSnapshot = await getDocs(journeysQuery);

        // Aggregate verses by date
        const dailyVerseCount: Record<string, number> = {};

        // Fetch reading logs from all user's journeys
        for (const journeyDoc of journeysSnapshot.docs) {
          const journeyId = journeyDoc.id;
          const logsRef = collection(db, 'journeys', journeyId, 'readingLogs');
          const logsQuery = query(
            logsRef,
            where('readBy', 'array-contains', currentUser!.uid)
          );
          const logsSnapshot = await getDocs(logsQuery);

          logsSnapshot.forEach((logDoc) => {
            const log = logDoc.data() as ReadingLog;
            const logDate = log.timestamp.toDate();

            if (logDate >= startDate) {
              const dateKey = format(logDate, 'yyyy-MM-dd');
              dailyVerseCount[dateKey] = (dailyVerseCount[dateKey] || 0) + log.verseCount;
            }
          });
        }

        setDailyData(dailyVerseCount);
      } catch (error) {
        console.error('Failed to fetch daily reading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDailyStats();
  }, [currentUser]);

  return { dailyData, loading };
}
