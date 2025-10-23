import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';

export function NotificationBanner() {
  const { currentUser, userProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!userProfile || !currentUser) return;

    // Only show if:
    // 1. Notifications are supported
    // 2. User hasn't enabled daily reminders
    // 3. Permission is not denied
    const { denied, granted } = getNotificationPermission();
    const shouldShow =
      isNotificationSupported() &&
      !userProfile.settings.dailyReminder &&
      !denied;

    setVisible(shouldShow);
  }, [userProfile, currentUser]);

  async function handleEnable() {
    if (!currentUser || !userProfile) return;

    setRequesting(true);
    try {
      const granted = await requestNotificationPermission();

      if (granted) {
        // Update user settings in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'settings.dailyReminder': true,
          'settings.reminderTime': '19:00', // default to 7pm
        });

        setVisible(false);
      } else {
        // Permission denied or dismissed
        console.log('Notification permission not granted');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setRequesting(false);
    }
  }

  function handleDismiss() {
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-800 dark:to-purple-900 rounded-2xl p-4 shadow-lg border border-purple-500 dark:border-purple-700">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">
              Enable Daily Reading Reminders
            </h3>
            <p className="text-sm text-purple-100 dark:text-purple-200">
              Get a gentle reminder at 7pm each day to continue your Quran reading journey
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="border-white/30 text-white hover:bg-white/10"
          >
            Not Now
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleEnable}
            disabled={requesting}
            isLoading={requesting}
            className="bg-white text-purple-700 hover:bg-purple-50"
          >
            Enable
          </Button>
        </div>
      </div>
    </div>
  );
}
