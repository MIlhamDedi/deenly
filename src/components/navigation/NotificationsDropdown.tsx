import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';

export function NotificationsDropdown() {
  const { currentUser, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notificationPermission = getNotificationPermission();
  const shouldShowEnableBanner =
    isNotificationSupported() &&
    !userProfile?.settings.dailyReminder &&
    !notificationPermission.denied;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  async function handleEnableNotifications() {
    if (!currentUser || !userProfile) return;

    setRequesting(true);
    try {
      const granted = await requestNotificationPermission();

      if (granted) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'settings.dailyReminder': true,
          'settings.reminderTime': '19:00',
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
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

        {/* Badge */}
        {shouldShowEnableBanner && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            !
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Notifications
            </h3>

            {shouldShowEnableBanner ? (
              // Enable notifications card
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center">
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
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Enable Daily Reminders
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Get a gentle reminder at 7pm each day to continue your Quran reading journey
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEnableNotifications}
                  disabled={requesting}
                  isLoading={requesting}
                  className="w-full"
                >
                  Enable Reminders
                </Button>
              </div>
            ) : (
              // No new notifications state
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                  <svg
                    className="w-6 h-6 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You're all caught up!
                </p>
                {userProfile?.settings.dailyReminder && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Daily reminders are enabled
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
