// Notification utilities for Deenly

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

/**
 * Check if notifications are supported in this browser
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) {
    return { granted: false, denied: true, prompt: false };
  }

  const permission = Notification.permission;
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    prompt: permission === 'default',
  };
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return null;
  }

  try {
    // For Vite, service worker should be in public folder
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      { scope: import.meta.env.BASE_URL }
    );

    console.log('Service worker registered successfully');

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Show a notification via the service worker
 */
export async function showNotification(
  title: string,
  body: string,
  tag: string = 'daily-reminder'
): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  const permission = getNotificationPermission();
  if (!permission.granted) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Send message to service worker to show notification
    if (registration.active) {
      registration.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
}

/**
 * Calculate milliseconds until next occurrence of target time today or tomorrow
 * @param timeString - Time in "HH:MM" format (24-hour)
 */
export function getMillisecondsUntilTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);

  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If target time has passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

/**
 * Check if user has read today (used to skip notification if already read)
 */
export function hasReadToday(lastReadDate: Date | null): boolean {
  if (!lastReadDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastRead = new Date(lastReadDate);
  lastRead.setHours(0, 0, 0, 0);

  return today.getTime() === lastRead.getTime();
}

/**
 * Schedule daily notification check
 * This sets up a timer to check at the specified time each day
 */
export function scheduleDailyNotification(
  reminderTime: string = '19:00',
  onTrigger: () => void
): () => void {
  let timeoutId: number | null = null;

  function scheduleNext() {
    const msUntilTime = getMillisecondsUntilTime(reminderTime);

    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Schedule notification
    timeoutId = window.setTimeout(() => {
      onTrigger();
      // Schedule next occurrence (tomorrow)
      scheduleNext();
    }, msUntilTime);

    console.log(
      `Next notification scheduled in ${Math.round(msUntilTime / 1000 / 60)} minutes (at ${reminderTime})`
    );
  }

  // Start scheduling
  scheduleNext();

  // Return cleanup function
  return () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
}
