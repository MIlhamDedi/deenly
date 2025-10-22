import { useEffect, useState } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Journey, JourneyMember } from '@/types';
import { Button } from '@/components/ui/Button';

export function JoinJourney() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('journey');
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function checkAndJoin() {
      if (!id) {
        setError('Invalid journey link');
        setLoading(false);
        return;
      }

      if (!currentUser || !userProfile) {
        // Not logged in - will show login prompt
        setLoading(false);
        return;
      }

      try {
        // Fetch journey
        const journeyRef = doc(db, 'journeys', id);
        const journeySnap = await getDoc(journeyRef);

        if (!journeySnap.exists()) {
          setError('Journey not found');
          setLoading(false);
          return;
        }

        const journeyData = { id: journeySnap.id, ...journeySnap.data() } as Journey;
        setJourney(journeyData);

        // Check if already a member
        if (journeyData.memberIds.includes(currentUser.uid)) {
          setAlreadyMember(true);
          setLoading(false);
          return;
        }

        // Join the journey
        await updateDoc(journeyRef, {
          memberIds: arrayUnion(currentUser.uid),
        });

        // Create member record
        const memberData: JourneyMember = {
          userId: currentUser.uid,
          displayName: userProfile.displayName,
          email: userProfile.email,
          role: 'member',
          joinedAt: serverTimestamp() as any,
          stats: {
            versesRead: 0,
            lastReadAt: null,
            totalReadings: 0,
          },
        };

        await setDoc(
          doc(db, 'journeys', id, 'members', currentUser.uid),
          memberData
        );

        setJoined(true);
        setLoading(false);
      } catch (err: any) {
        console.error('Error joining journey:', err);
        setError(err.message || 'Failed to join journey');
        setLoading(false);
      }
    }

    checkAndJoin();
  }, [id, currentUser, userProfile]);

  // Redirect if already a member
  if (alreadyMember && id) {
    return <Navigate to={`/journey/${id}`} replace />;
  }

  // Redirect if successfully joined
  if (joined && id) {
    return <Navigate to={`/journey/${id}`} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 dark:border-teal-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Joining journey...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-teal-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You've been invited!
          </h2>
          {journey && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join <span className="font-semibold text-teal-700 dark:text-teal-400">{journey.name}</span> and start tracking your Quran reading journey together.
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Sign in or create an account to join this journey
          </p>
          <div className="space-y-3">
            <Link to={`/login?redirect=${encodeURIComponent(`/join?journey=${id}`)}`} className="block">
              <Button variant="primary" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to={`/signup?redirect=${encodeURIComponent(`/join?journey=${id}`)}`} className="block">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to Join</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/app">
            <Button variant="primary">Go to App</Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
