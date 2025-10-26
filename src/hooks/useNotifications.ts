import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import {
  scheduleMultipleNotifications,
  showNotification,
  hasReadToday,
  getNotificationPermission,
  SYSTEM_REMINDERS,
} from '@/lib/notifications';

/**
 * Hook to manage daily reading reminder notifications
 * Schedules both system-wide reminders and user-configured reminders
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

    // Check if we have notification permission
    const { granted } = getNotificationPermission();
    if (!granted) {
      return;
    }

    const reminders: Array<{ time: string; onTrigger: () => void }> = [];

    // Add system-wide reminders (always active when notifications are enabled)
    SYSTEM_REMINDERS.forEach((reminder) => {
      reminders.push({
        time: reminder.time,
        onTrigger: () => {
          const lastReadDate = userProfile?.stats?.lastReadDate?.toDate() || null;
          const alreadyRead = hasReadToday(lastReadDate);

          // Show notification if user hasn't read (when requiresNotRead is true)
          if (reminder.requiresNotRead && alreadyRead) {
            console.log(`Skipping ${reminder.tag} - user has already read today`);
            return;
          }

          showNotification(reminder.title, reminder.body, reminder.tag);
        },
      });
    });

    // Add user-configured reminder (if enabled)
    if (userProfile?.settings.dailyReminder) {
      const userReminderTime = userProfile.settings.reminderTime || '19:00';

      reminders.push({
        time: userReminderTime,
        onTrigger: () => {
          const lastReadDate = userProfile.stats?.lastReadDate?.toDate() || null;
          const alreadyRead = hasReadToday(lastReadDate);

          if (!alreadyRead) {
            showNotification(
              'Time to Read the Quran',
              "Continue your reading journey today! Keep your streak going.",
              'user-reminder'
            );
          } else {
            console.log('User has already read today, skipping user reminder');
          }
        },
      });
    }

    // Schedule all reminders
    if (reminders.length > 0) {
      const cleanup = scheduleMultipleNotifications(reminders);
      cleanupRef.current = cleanup;
    }

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
