import { useState, FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { VerseRangePicker } from './VerseRangePicker';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JourneyMember, ReadingLog } from '@/types';
import { calculateVerseCount, expandVerseRange } from '@/lib/verseUtils';

interface LogReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
  members: JourneyMember[];
  onSuccess?: () => void;
}

export function LogReadingModal({
  isOpen,
  onClose,
  journeyId,
  members,
  onSuccess,
}: LogReadingModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [startRef, setStartRef] = useState('1:1');
  const [endRef, setEndRef] = useState('1:1');
  const [isValidRange, setIsValidRange] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    currentUser ? [currentUser.uid] : []
  );
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleRangeChange(start: string, end: string, valid: boolean) {
    setStartRef(start);
    setEndRef(end);
    setIsValidRange(valid);
  }

  function toggleUser(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    if (!isValidRange) {
      setError('Please select a valid verse range');
      return;
    }

    if (selectedUserIds.length === 0) {
      setError('Please select at least one person who read');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const verseCount = calculateVerseCount(startRef, endRef);
      const readByNames = selectedUserIds.map((userId) => {
        const member = members.find((m) => m.userId === userId);
        return member?.displayName || 'Unknown';
      });

      const logData: Omit<ReadingLog, 'id'> = {
        journeyId,
        loggedBy: currentUser.uid,
        loggedByName: userProfile.displayName,
        readBy: selectedUserIds,
        readByNames,
        startRef,
        endRef,
        timestamp: serverTimestamp() as any,
        verseCount,
        ...(note.trim() && { note: note.trim() }), // Only include note if it has a value
      };

      await addDoc(collection(db, 'journeys', journeyId, 'readingLogs'), logData);

      // Track unique verses and update journey stats
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

      // Only proceed if there are new verses to track
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

        // Update journey stats with only new verse count
        const journeyRef = doc(db, 'journeys', journeyId);
        batch.update(journeyRef, {
          'stats.versesCompleted': increment(newVerses.length),
          'stats.completionPercentage': increment((newVerses.length / 6236) * 100),
          'stats.lastActivityAt': serverTimestamp(),
        });

        await batch.commit();
      } else {
        // Still update lastActivityAt even if no new verses
        const journeyRef = doc(db, 'journeys', journeyId);
        await updateDoc(journeyRef, {
          'stats.lastActivityAt': serverTimestamp(),
        });
      }

      // Update personal stats for users who participated in this reading
      for (const userId of selectedUserIds) {
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
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let newStreak = 1;
          if (currentStats.lastReadDate) {
            const lastRead = currentStats.lastReadDate.toDate();
            lastRead.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - lastRead.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 0) {
              // Same day - keep current streak
              newStreak = currentStats.currentStreak;
            } else if (diffDays === 1) {
              // Yesterday - increment streak
              newStreak = currentStats.currentStreak + 1;
            }
            // else: more than 1 day gap - streak resets to 1
          }

          const newLongestStreak = Math.max(newStreak, currentStats.longestStreak);

          // Calculate today's verses
          let todayVerses = verseCount;
          if (currentStats.todayDate) {
            const todayDate = currentStats.todayDate.toDate();
            todayDate.setHours(0, 0, 0, 0);

            const isSameDay = today.getTime() === todayDate.getTime();
            if (isSameDay) {
              // Same day - add to today's count
              todayVerses = (currentStats.todayVersesRead || 0) + verseCount;
            }
            // else: different day - reset to current verse count
          }

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

      // Show feedback about duplicates
      const duplicateCount = allVerses.length - newVerses.length;
      if (duplicateCount > 0) {
        console.log(`Note: ${duplicateCount} ${duplicateCount === 1 ? 'verse was' : 'verses were'} already completed and not counted again.`);
      }

      // Reset form
      setStartRef('1:1');
      setEndRef('1:1');
      setSelectedUserIds(currentUser ? [currentUser.uid] : []);
      setNote('');
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error logging reading:', err);
      setError(err.message || 'Failed to log reading');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      setStartRef('1:1');
      setEndRef('1:1');
      setSelectedUserIds(currentUser ? [currentUser.uid] : []);
      setNote('');
      setError('');
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Log Reading"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Verse Range Picker */}
        <div>
          <VerseRangePicker
            onRangeChange={handleRangeChange}
            disabled={loading}
          />
        </div>

        {/* Who Read */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Who read these verses?
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {members.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No members available
              </p>
            ) : (
              members.map((member) => (
                <label
                  key={member.userId}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(member.userId)}
                    onChange={() => toggleUser(member.userId)}
                    disabled={loading}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-gold-500 flex items-center justify-center text-white text-sm font-bold">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.displayName}
                        {member.userId === currentUser?.uid && (
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(You)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Select everyone who read this range together
          </p>
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Note (Optional)
          </label>
          <textarea
            placeholder="Add any reflections or notes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-teal-800 dark:text-teal-200">
              <p className="font-semibold mb-1">What happens after logging?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Journey progress will be updated automatically</li>
                <li>All members can see this activity in the feed</li>
                <li>Individual member stats will be updated</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            disabled={!isValidRange || selectedUserIds.length === 0}
            className="flex-1"
          >
            Log Reading
          </Button>
        </div>
      </form>
    </Modal>
  );
}
