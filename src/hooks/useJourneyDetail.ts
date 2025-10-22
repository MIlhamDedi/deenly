import { useEffect, useState } from 'react';
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Journey, JourneyMember, ReadingLog } from '@/types';

interface UseJourneyDetailResult {
  journey: Journey | null;
  members: JourneyMember[];
  readingLogs: ReadingLog[];
  loading: boolean;
  error: string | null;
}

export function useJourneyDetail(journeyId: string): UseJourneyDetailResult {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [members, setMembers] = useState<JourneyMember[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!journeyId) {
      setLoading(false);
      return;
    }

    // Subscribe to journey document
    const journeyRef = doc(db, 'journeys', journeyId);
    const unsubscribeJourney = onSnapshot(
      journeyRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setJourney({
            id: snapshot.id,
            ...snapshot.data(),
          } as Journey);
          setError(null);
        } else {
          setJourney(null);
          setError('Journey not found');
        }
      },
      (err) => {
        console.error('Error fetching journey:', err);
        setError('Failed to load journey');
        setJourney(null);
      }
    );

    // Subscribe to members subcollection
    const membersQuery = query(
      collection(db, 'journeys', journeyId, 'members'),
      orderBy('joinedAt', 'asc')
    );
    const unsubscribeMembers = onSnapshot(
      membersQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const membersData = snapshot.docs.map((doc) => doc.data()) as JourneyMember[];
        setMembers(membersData);
      },
      (err) => {
        console.error('Error fetching members:', err);
      }
    );

    // Subscribe to reading logs subcollection
    const logsQuery = query(
      collection(db, 'journeys', journeyId, 'readingLogs'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribeLogs = onSnapshot(
      logsQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const logsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ReadingLog[];
        setReadingLogs(logsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching reading logs:', err);
        setLoading(false);
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeJourney();
      unsubscribeMembers();
      unsubscribeLogs();
    };
  }, [journeyId]);

  return { journey, members, readingLogs, loading, error };
}
