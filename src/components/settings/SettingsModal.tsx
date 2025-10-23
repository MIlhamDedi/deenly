import { useState, FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'goal' | 'notifications';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('goal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Goal settings
  const [dailyGoal, setDailyGoal] = useState(
    userProfile?.settings.dailyGoal || 50
  );

  // Notification settings
  const [dailyReminder, setDailyReminder] = useState(
    userProfile?.settings.dailyReminder || false
  );
  const [reminderTime, setReminderTime] = useState(
    userProfile?.settings.reminderTime || '19:00'
  );

  const notificationPermission = getNotificationPermission();
  const notificationSupported = isNotificationSupported();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // If enabling daily reminders, request permission first
      if (dailyReminder && !notificationPermission.granted) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          setError('Notification permission is required for daily reminders');
          setDailyReminder(false);
          setLoading(false);
          return;
        }
      }

      // Update settings in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        'settings.dailyGoal': dailyGoal,
        'settings.dailyReminder': dailyReminder,
        'settings.reminderTime': reminderTime,
      });

      setSuccess('Settings saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      setError('');
      setSuccess('');
      setDailyGoal(userProfile?.settings.dailyGoal || 50);
      setDailyReminder(userProfile?.settings.dailyReminder || false);
      setReminderTime(userProfile?.settings.reminderTime || '19:00');
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Settings" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab('goal')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'goal'
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Goal
            {activeTab === 'goal' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'notifications'
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Notifications
            {activeTab === 'notifications' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400" />
            )}
          </button>
        </div>

        {/* Goal Tab */}
        {activeTab === 'goal' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Reading Goal
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Verses Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6236"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Set your daily reading target (1-6,236 verses)
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-teal-800 dark:text-teal-200">
                  <p className="font-semibold mb-1">About Daily Goals</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Your goal will be displayed in your personal stats banner</li>
                    <li>Journey cards will show your progress towards this daily target</li>
                    <li>This is a personal setting and won't affect other journey members</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {!notificationSupported && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm">
                Notifications are not supported in your browser
              </div>
            )}

            {notificationPermission.denied && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-orange-700 dark:text-orange-400 text-sm">
                Notification permission was denied. Please enable notifications in your browser settings
                to use daily reminders.
              </div>
            )}

            {/* Daily Reminder Toggle */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
                disabled={loading || !notificationSupported || notificationPermission.denied}
                className="w-5 h-5 mt-0.5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Daily Reading Reminder
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Get a notification each day at your chosen time to continue your reading journey
                </p>
              </div>
            </label>

            {/* Reminder Time Picker */}
            {dailyReminder && (
              <div className="ml-8 pl-4 border-l-2 border-teal-200 dark:border-teal-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  You'll receive a notification at this time each day (if you haven't read yet)
                </p>
              </div>
            )}
          </div>
            </div>

            {/* Info Box */}
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-teal-800 dark:text-teal-200">
                  <p className="font-semibold mb-1">About Daily Reminders</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Notifications work best when the app is open or in the background</li>
                    <li>You won't receive a notification if you've already logged reading for the day</li>
                    <li>Make sure notifications are enabled in your browser settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

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
            disabled={!notificationSupported && dailyReminder}
            className="flex-1"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
}
