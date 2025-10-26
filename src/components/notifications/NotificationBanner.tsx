import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getAndStoreFCMToken,
} from '@/lib/notifications';
import { getStreakStatus } from '@/services/statsService';

const DISMISSAL_KEY = 'deenly_notification_banner_dismissed';
const DISMISSAL_DURATION_DAYS = 7; // Re-show after 7 days

export function NotificationBanner() {
  const { currentUser, userProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showReason, setShowReason] = useState<'default' | 'at-risk' | 'denied'>('default');

  useEffect(() => {
    if (!userProfile || !currentUser) return;

    // Check if user already has notifications enabled
    if (userProfile.settings.dailyReminder) {
      setVisible(false);
      return;
    }

    // Check if notifications are supported
    if (!isNotificationSupported()) {
      setVisible(false);
      return;
    }

    const { denied } = getNotificationPermission();

    // If permission was denied, show different message
    if (denied) {
      setShowReason('denied');
      setVisible(true);
      return;
    }

    // Check dismissal timestamp
    const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt));
      const daysSinceDismissal = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      // Don't re-show if dismissed recently (< 7 days)
      if (daysSinceDismissal < DISMISSAL_DURATION_DAYS) {
        // BUT, if user's streak is at risk, override dismissal and show urgently
        const stats = userProfile.stats;
        if (stats?.currentStreak && stats.currentStreak > 0) {
          const { status } = getStreakStatus(
            stats.currentStreak,
            stats.lastReadDate || null
          );

          if (status === 'at-risk') {
            setShowReason('at-risk');
            setVisible(true);
            return;
          }
        }

        setVisible(false);
        return;
      }
    }

    // Show banner (first time or after 7 days)
    setShowReason('default');
    setVisible(true);
  }, [userProfile, currentUser]);

  async function handleEnable() {
    if (!currentUser || !userProfile) return;

    setRequesting(true);
    try {
      const granted = await requestNotificationPermission();

      if (granted) {
        // Update user settings in Firestore first (don't block on FCM token)
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'settings.dailyReminder': true,
          'settings.reminderTime': '19:00', // default to 7pm
        });

        // Try to get and store FCM token in background (non-blocking)
        getAndStoreFCMToken(currentUser.uid).catch((error) => {
          console.warn('Failed to get FCM token (notifications will still work):', error);
        });

        // Clear dismissal record
        localStorage.removeItem(DISMISSAL_KEY);
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
    // Store dismissal timestamp
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  // Different styling and messaging based on reason
  const isDenied = showReason === 'denied';
  const isAtRisk = showReason === 'at-risk';

  const bgColor = isAtRisk
    ? 'bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700'
    : isDenied
      ? 'bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800'
      : 'bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-800 dark:to-purple-900';

  const borderColor = isAtRisk
    ? 'border-orange-500 dark:border-orange-700'
    : isDenied
      ? 'border-gray-500 dark:border-gray-600'
      : 'border-purple-500 dark:border-purple-700';

  return (
    <div className={`${bgColor} rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg border ${borderColor} mb-6`}>
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            {isAtRisk ? (
              <span className="text-2xl">⚠️</span>
            ) : (
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
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">
              {isAtRisk && 'Your Streak is At Risk! Enable Reminders'}
              {isDenied && 'Re-enable Notifications'}
              {!isAtRisk && !isDenied && 'Enable Daily Reading Reminders'}
            </h3>
            <p className="text-sm text-white/90">
              {isAtRisk &&
                'Never lose your streak again! Enable reminders to get notified daily.'}
              {isDenied && (
                <>
                  You previously blocked notifications. To re-enable:
                  <br />
                  <span className="font-medium">
                    Click the 🔒 icon in your browser's address bar → Allow notifications
                  </span>
                </>
              )}
              {!isAtRisk &&
                !isDenied &&
                'Get smart reminders to maintain your streak.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isDenied && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="border-white/30 text-white hover:bg-white/10"
            >
              {isAtRisk ? 'Later' : 'Not Now'}
            </Button>
          )}
          {!isDenied ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnable}
              disabled={requesting}
              isLoading={requesting}
              className="bg-white text-purple-700 hover:bg-purple-50"
            >
              {isAtRisk ? 'Enable Now' : 'Enable'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            {isAtRisk ? (
              <span className="text-lg">⚠️</span>
            ) : (
              <svg
                className="w-5 h-5 text-white"
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
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              {isAtRisk && 'Streak At Risk!'}
              {isDenied && 'Notifications Blocked'}
              {!isAtRisk && !isDenied && 'Enable Reminders'}
            </h3>
            <p className="text-xs text-white/90 leading-relaxed">
              {isAtRisk && 'Enable reminders to protect your streak with notifications.'}
              {isDenied && (
                <>
                  Tap 🔒 in address bar, then allow notifications.
                </>
              )}
              {!isAtRisk && !isDenied && 'Get daily reminders at customisable time.'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isDenied && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="flex-1 border-white/30 text-white hover:bg-white/10 text-xs py-2"
            >
              {isAtRisk ? 'Later' : 'Not Now'}
            </Button>
          )}
          {!isDenied ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnable}
              disabled={requesting}
              isLoading={requesting}
              className="flex-1 bg-white text-purple-700 hover:bg-purple-50 text-xs font-semibold py-2"
            >
              {isAtRisk ? 'Enable Now' : 'Enable'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="w-full border-white/30 text-white hover:bg-white/10 text-xs py-2"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
