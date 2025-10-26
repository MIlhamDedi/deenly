// Notification utilities for Deenly

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface SystemReminder {
  time: string; // "HH:MM" format
  title: string;
  body: string;
  tag: string;
  requiresNotRead?: boolean; // Only show if user hasn't read today
}

/**
 * System-configured reminders (always active if notifications are enabled)
 * These are in addition to user-configured reminders
 */
export const SYSTEM_REMINDERS: SystemReminder[] = [
  {
    time: '04:00',
    title: 'Good Morning! ☀️',
    body: 'Start your day with the Quran. A few verses can set a blessed tone for the day ahead.',
    tag: 'morning-reminder',
    requiresNotRead: true,
  },
  {
    time: '21:00',
    title: 'Evening Reminder 🌙',
    body: 'Great job today! Read a few verses before sleep to end your day with peace.',
    tag: 'evening-reminder',
    requiresNotRead: true,
  },
];

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

/**
 * Schedule multiple daily notifications
 * Returns a cleanup function that cancels all scheduled notifications
 */
export function scheduleMultipleNotifications(
  reminders: Array<{
    time: string;
    onTrigger: () => void;
  }>
): () => void {
  const cleanupFunctions: Array<() => void> = [];

  // Schedule each reminder
  reminders.forEach(({ time, onTrigger }) => {
    const cleanup = scheduleDailyNotification(time, onTrigger);
    cleanupFunctions.push(cleanup);
  });

  // Return a function that cleans up all schedules
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

/**
 * Get FCM token for the current device
 * Requires Firebase Messaging to be initialized and notification permission granted
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const { getMessagingInstance } = await import('@/lib/firebase');
    const messaging = await getMessagingInstance();

    if (!messaging) {
      console.log('Firebase Messaging not supported');
      return null;
    }

    const { getToken } = await import('firebase/messaging');
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      console.warn('VAPID key not configured. FCM tokens cannot be generated.');
      return null;
    }

    // Wait for service worker with timeout
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker timeout')), 5000)
      ),
    ]);

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Store FCM token in Firestore for a user
 * Stores in users/{userId}/fcmTokens/{tokenHash} subcollection
 */
export async function storeFCMToken(userId: string, token: string): Promise<boolean> {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    // Use a hash of the token as the document ID to avoid duplicates
    const tokenHash = await hashString(token);

    const tokenRef = doc(db, 'users', userId, 'fcmTokens', tokenHash);

    await setDoc(tokenRef, {
      token,
      createdAt: serverTimestamp(),
      lastUsed: serverTimestamp(),
      deviceInfo: getDeviceInfo(),
    });

    console.log('FCM token stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing FCM token:', error);
    return false;
  }
}

/**
 * Get and store FCM token for the current user
 * This should be called after notification permission is granted
 */
export async function getAndStoreFCMToken(userId: string): Promise<string | null> {
  try {
    const token = await getFCMToken();

    if (!token) {
      console.log('No FCM token obtained');
      return null;
    }

    const stored = await storeFCMToken(userId, token);

    if (stored) {
      console.log('FCM token obtained and stored');
      return token;
    }

    return null;
  } catch (error) {
    console.error('Error getting and storing FCM token:', error);
    return null;
  }
}

/**
 * Simple hash function for creating consistent token IDs
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 20); // Use first 20 chars for document ID
}

/**
 * Get basic device info for tracking which device has which token
 */
function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect browser
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  return `${browser} on ${os}`;
}
