import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import {
  scheduleDailyNotification,
  showNotification,
  hasReadToday,
  getNotificationPermission,
} from '@/lib/notifications';

/**
 * Hook to manage daily reading reminder notifications
 * Automatically schedules notifications based on user settings
 */
export function useNotifications() {
  const { userProfile } = useAuth();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up any existing scheduled notifications
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Check if user has enabled daily reminders
    if (!userProfile?.settings.dailyReminder) {
      return;
    }

    // Check if we have permission
    const { granted } = getNotificationPermission();
    if (!granted) {
      return;
    }

    const reminderTime = userProfile.settings.reminderTime || '19:00';

    // Schedule daily notification
    const cleanup = scheduleDailyNotification(reminderTime, () => {
      // Check if user has already read today
      const lastReadDate = userProfile.stats?.lastReadDate?.toDate() || null;
      const alreadyRead = hasReadToday(lastReadDate);

      if (!alreadyRead) {
        // Show notification
        showNotification(
          'Time to Read the Quran',
          "Continue your reading journey today! Keep your streak going.",
          'daily-reminder'
        );
      } else {
        console.log('User has already read today, skipping notification');
      }
    });

    cleanupRef.current = cleanup;

    // Cleanup on unmount or when dependencies change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [userProfile]);

  return null;
}
