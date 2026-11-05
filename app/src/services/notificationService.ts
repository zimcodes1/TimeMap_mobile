import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { notificationsAPI } from '@/api/notificationsAPI';
import { secureStore } from '@/lib/storage/secureStore';

// Configure foreground presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Configure Android notification channels using the device's default sound and alert settings.
 */
export async function setupAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    // 1. Urgent alerts: Cancellations, Venue Shifts, Postponements, Rescheduled Exams
    await Notifications.setNotificationChannelAsync('timemap-urgent', {
      name: 'Urgent Schedule Alerts',
      description: 'Immediate alerts for lecture cancellations, venue shifts, and exam updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EF4444',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    // 2. Schedule Updates: Timetable publications, invigilation duties, report responses
    await Notifications.setNotificationChannelAsync('timemap-updates', {
      name: 'Timetable & Exam Updates',
      description: 'Published lecture timetables, exam schedules, and status updates',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200],
      lightColor: '#10B981',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    // 3. Reminders: Upcoming class and exam reminders
    await Notifications.setNotificationChannelAsync('timemap-reminders', {
      name: 'Class & Exam Reminders',
      description: 'Upcoming class and exam alerts',
      importance: Notifications.AndroidImportance.LOW,
      showBadge: false,
    });
  } catch (error) {
    console.warn('[NotificationService] Error setting up Android channels:', error);
  }
}

/**
 * Request OS permission and register device token with the backend.
 * Uses native FCM token retrieval on Android.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[NotificationService] Push notifications require a physical device.');
    return null;
  }

  try {
    // Ensure Android channels are configured
    await setupAndroidNotificationChannels();

    // 1. Check existing permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 2. Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[NotificationService] Notification permission was denied by user.');
      return null;
    }

    // 3. Retrieve raw device push token (FCM token on Android)
    let fcmToken: string | null = null;
    try {
      const deviceTokenResult = await Notifications.getDevicePushTokenAsync();
      fcmToken = deviceTokenResult.data;
    } catch (tokenErr) {
      console.warn('[NotificationService] getDevicePushTokenAsync failed, falling back:', tokenErr);
      // Fallback: try expo push token data
      const expoToken = await Notifications.getExpoPushTokenAsync();
      fcmToken = expoToken.data;
    }

    if (!fcmToken) {
      console.warn('[NotificationService] Failed to obtain FCM device token.');
      return null;
    }

    // 4. Register with Django backend
    const platform = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'web';
    await notificationsAPI.registerDeviceToken(fcmToken, platform);

    // 5. Cache token in SecureStore
    await secureStore.savePushToken(fcmToken);
    console.log('[NotificationService] Device token registered successfully:', fcmToken);

    return fcmToken;
  } catch (err) {
    console.warn('[NotificationService] Registration error (non-blocking):', err);
    return null;
  }
}

/**
 * Deactivate device token with backend and clear local cache on logout.
 */
export async function unregisterForPushNotificationsAsync(): Promise<void> {
  try {
    const cachedToken = await secureStore.getPushToken();
    if (cachedToken) {
      await notificationsAPI.deactivateDeviceToken(cachedToken);
      await secureStore.clearPushToken();
      console.log('[NotificationService] Device token deactivated.');
    }
  } catch (err) {
    console.warn('[NotificationService] Unregister error:', err);
  }
}

/**
 * Check if notifications are currently permitted by the OS.
 */
export async function isPushPermissionGrantedAsync(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Set application icon badge count.
 */
export async function setBadgeCountAsync(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(Math.max(0, count));
  } catch (err) {
    console.warn('[NotificationService] setBadgeCountAsync error:', err);
  }
}

export interface NotificationPayloadData {
  notificationId?: string;
  type?: string;
  relatedModel?: string;
  relatedId?: string;
  channelId?: string;
}

/**
 * Attach listeners for foreground reception and notification tray taps.
 * Returns a cleanup function to unsubscribe.
 */
export function setupNotificationListeners(
  onNotificationTapped?: (data: NotificationPayloadData) => void,
  onNotificationReceived?: (notification: Notifications.Notification) => void,
): () => void {
  // Listener 1: Foreground notification received
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    onNotificationReceived?.(notification);
  });

  // Listener 2: User tapped a notification in the system tray
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const rawData = response.notification.request.content.data as Record<string, any>;
    if (rawData) {
      const parsed: NotificationPayloadData = {
        notificationId: rawData.notification_id || rawData.notificationId,
        type: rawData.type,
        relatedModel: rawData.related_model || rawData.relatedModel,
        relatedId: rawData.related_id || rawData.relatedId ? String(rawData.related_id || rawData.relatedId) : undefined,
        channelId: rawData.channel_id || rawData.channelId,
      };
      onNotificationTapped?.(parsed);
    }
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
