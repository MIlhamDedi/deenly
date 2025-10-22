import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Journey } from '@/types';
import { useAuth } from './useAuth';

export function useJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setJourneys([]);
      setLoading(false);
      return;
    }

    try {
      // Query journeys where current user is a member
      const q = query(
        collection(db, 'journeys'),
        where('memberIds', 'array-contains', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const journeysData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Journey[];

          // Sort by most recent activity
          journeysData.sort((a, b) => {
            const aTime = a.stats.lastActivityAt?.seconds || 0;
            const bTime = b.stats.lastActivityAt?.seconds || 0;
            return bTime - aTime;
          });

          setJourneys(journeysData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching journeys:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error setting up journeys listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [currentUser]);

  return { journeys, loading, error };
}
