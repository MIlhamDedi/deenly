import { useState, FormEvent, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { VerseRangePicker } from './VerseRangePicker';
import { useAuth } from '@/hooks/useAuth';
import { Journey, JourneyMember } from '@/types';
import { logReadingToMultipleJourneys } from '@/services/journeyService';

interface MultiJourneyLogReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeys: Journey[];
  journeyMembers: Map<string, JourneyMember[]>; // journeyId -> members
  onSuccess?: () => void;
}

export function MultiJourneyLogReadingModal({
  isOpen,
  onClose,
  journeys,
  journeyMembers,
  onSuccess,
}: MultiJourneyLogReadingModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [startRef, setStartRef] = useState('1:1');
  const [endRef, setEndRef] = useState('1:1');
  const [isValidRange, setIsValidRange] = useState(true);
  const [selectedJourneyIds, setSelectedJourneyIds] = useState<string[]>(
    journeys.length > 0 ? [journeys[0].id] : []
  );
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    currentUser ? [currentUser.uid] : []
  );
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Compute union of all members from selected journeys
  const availableMembers = useMemo(() => {
    const memberMap = new Map<string, JourneyMember>();

    selectedJourneyIds.forEach((journeyId) => {
      const members = journeyMembers.get(journeyId) || [];
      members.forEach((member) => {
        if (!memberMap.has(member.userId)) {
          memberMap.set(member.userId, member);
        }
      });
    });

    return Array.from(memberMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
  }, [selectedJourneyIds, journeyMembers]);

  function handleRangeChange(start: string, end: string, valid: boolean) {
    setStartRef(start);
    setEndRef(end);
    setIsValidRange(valid);
  }

  function toggleJourney(journeyId: string) {
    setSelectedJourneyIds((prev) => {
      const newSelection = prev.includes(journeyId)
        ? prev.filter((id) => id !== journeyId)
        : [...prev, journeyId];

      // If no journeys selected, clear user selection
      if (newSelection.length === 0) {
        setSelectedUserIds([]);
      }

      return newSelection;
    });
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

    if (selectedJourneyIds.length === 0) {
      setError('Please select at least one journey');
      return;
    }

    if (selectedUserIds.length === 0) {
      setError('Please select at least one person who read');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Get members for each selected journey
      const journeyMembersMap = new Map<string, JourneyMember[]>();
      selectedJourneyIds.forEach((journeyId) => {
        journeyMembersMap.set(journeyId, journeyMembers.get(journeyId) || []);
      });

      await logReadingToMultipleJourneys({
        journeyIds: selectedJourneyIds,
        currentUserId: currentUser.uid,
        currentUserName: userProfile.displayName,
        selectedUserIds,
        journeyMembersMap,
        startRef,
        endRef,
        note,
      });

      // Reset form
      setStartRef('1:1');
      setEndRef('1:1');
      setSelectedJourneyIds(journeys.length > 0 ? [journeys[0].id] : []);
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
      setSelectedJourneyIds(journeys.length > 0 ? [journeys[0].id] : []);
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
      title="Log Reading to Journeys"
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

        {/* Journey Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select journeys to log to
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {journeys.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No journeys available
              </p>
            ) : (
              journeys.map((journey) => (
                <label
                  key={journey.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedJourneyIds.includes(journey.id)}
                    onChange={() => toggleJourney(journey.id)}
                    disabled={loading}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {journey.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {journey.stats.completionPercentage.toFixed(1)}% complete
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Select one or more journeys to track this reading
          </p>
        </div>

        {/* Who Read */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Who read these verses?
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {availableMembers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {selectedJourneyIds.length === 0
                  ? 'Please select at least one journey first'
                  : 'No members available'}
              </p>
            ) : (
              availableMembers.map((member) => (
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
              <p className="font-semibold mb-1">Multi-journey logging</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your personal stats will count these verses only once</li>
                <li>Each selected journey will be updated separately</li>
                <li>All members from selected journeys can see this activity</li>
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
            disabled={!isValidRange || selectedJourneyIds.length === 0 || selectedUserIds.length === 0}
            className="flex-1"
          >
            Log Reading
          </Button>
        </div>
      </form>
    </Modal>
  );
}
