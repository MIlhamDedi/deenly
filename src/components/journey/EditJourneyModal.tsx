import { useState, FormEvent, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Journey } from '@/types';

interface EditJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  journey: Journey;
}

export function EditJourneyModal({ isOpen, onClose, onSuccess, journey }: EditJourneyModalProps) {
  const [name, setName] = useState(journey.name);
  const [description, setDescription] = useState(journey.description || '');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with journey data
  useEffect(() => {
    setName(journey.name);
    setDescription(journey.description || '');
    if (journey.targetEndDate) {
      const date = journey.targetEndDate.toDate();
      setTargetEndDate(date.toISOString().split('T')[0]);
    } else {
      setTargetEndDate('');
    }
  }, [journey]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const journeyRef = doc(db, 'journeys', journey.id);

      const updateData: Partial<Journey> = {
        name: name.trim(),
        description: description.trim() || undefined,
        targetEndDate: targetEndDate
          ? Timestamp.fromDate(new Date(targetEndDate))
          : undefined,
      };

      await updateDoc(journeyRef, updateData);

      // Reset and close
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error updating journey:', err);
      setError(err.message || 'Failed to update journey');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      // Reset to journey values
      setName(journey.name);
      setDescription(journey.description || '');
      if (journey.targetEndDate) {
        const date = journey.targetEndDate.toDate();
        setTargetEndDate(date.toISOString().split('T')[0]);
      } else {
        setTargetEndDate('');
      }
      setError('');
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Journey">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Journey Name"
          placeholder="e.g., Family Ramadan 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          helperText="Update your journey name"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            placeholder="What's the goal of this journey?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors resize-none"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Optional: Add details about this reading journey
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target End Date (Optional)
          </label>
          <input
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
            disabled={loading}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
          />
          {targetEndDate ? (() => {
            const selectedDate = new Date(targetEndDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            const daysRemaining = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const versesRemaining = 6236 - journey.stats.versesCompleted;
            const dailyVersesNeeded = daysRemaining > 0 ? Math.ceil(versesRemaining / daysRemaining) : versesRemaining;

            const isCompleted = journey.stats.versesCompleted >= 6236;

            if (isCompleted) {
              return (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Journey already completed! Alhamdulillah!
                </p>
              );
            }

            if (daysRemaining < 0) {
              return (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  This date is in the past. Please select a future date.
                </p>
              );
            }

            if (daysRemaining === 0) {
              return (
                <p className="mt-2 text-sm text-orange-600 dark:text-orange-400 font-medium">
                  📅 Target is today! You'll need to read all {versesRemaining.toLocaleString()} remaining verses today.
                </p>
              );
            }

            return (
              <p className={`mt-2 text-sm font-medium ${
                dailyVersesNeeded > 100
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-teal-600 dark:text-teal-400'
              }`}>
                📅 {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} until target — read {dailyVersesNeeded} {dailyVersesNeeded === 1 ? 'verse' : 'verses'} per day to complete on time
              </p>
            );
          })() : (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Set a target date to calculate daily verse goals
            </p>
          )}
        </div>

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
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
