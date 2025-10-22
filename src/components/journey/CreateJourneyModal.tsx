import { useState, FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Journey, JourneyMember } from '@/types';

interface CreateJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateJourneyModal({ isOpen, onClose, onSuccess }: CreateJourneyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, userProfile } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    setError('');
    setLoading(true);

    try {
      // Create the journey
      const journeyData: Omit<Journey, 'id'> = {
        name: name.trim(),
        description: description.trim() || undefined,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        memberIds: [currentUser.uid],
        stats: {
          totalVerses: 6236,
          versesCompleted: 0,
          completionPercentage: 0,
          lastActivityAt: serverTimestamp() as any,
        },
        settings: {
          isPrivate: false,
          requireApproval: false,
        },
      };

      const journeyRef = await addDoc(collection(db, 'journeys'), journeyData);

      // Create the member record for the creator
      const memberData: JourneyMember = {
        userId: currentUser.uid,
        displayName: userProfile.displayName,
        email: userProfile.email,
        role: 'owner',
        joinedAt: serverTimestamp() as any,
        stats: {
          versesRead: 0,
          lastReadAt: null,
          totalReadings: 0,
        },
      };

      await setDoc(
        doc(db, 'journeys', journeyRef.id, 'members', currentUser.uid),
        memberData
      );

      // Reset form and close
      setName('');
      setDescription('');
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating journey:', err);
      setError(err.message || 'Failed to create journey');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      setName('');
      setDescription('');
      setError('');
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Journey">
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
          helperText="Give your journey a memorable name"
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

        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-teal-800 dark:text-teal-200">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You'll be able to invite others to join</li>
                <li>Members can log readings for themselves or others</li>
                <li>Track progress together toward completing all 6,236 verses</li>
              </ul>
            </div>
          </div>
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
            Create Journey
          </Button>
        </div>
      </form>
    </Modal>
  );
}
