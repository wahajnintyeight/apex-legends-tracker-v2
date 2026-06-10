import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { fetchMapRotation, MODE_LABELS, MODE_ORDER } from './api';
import { getAlerts, getNotifiedKeys, markNotified } from './storage';

export const BG_TASK = 'apex-map-rotation-check';

// Foreground presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForNotifications(): Promise<boolean> {
  if (!Device.isDevice) {
    // Notifications only work on physical devices
    return false;
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('map-alerts', {
      name: 'Map Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF4655',
    });
  }
  return true;
}

async function sendMapAlert(map: string, modeLabel: string, timer?: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🗺️ ${map} is LIVE`,
      body: `${map} is now in rotation for ${modeLabel}.${
        timer ? ` ${timer} remaining.` : ''
      }`,
      sound: true,
      data: { map, modeLabel },
    },
    trigger: null, // immediate
  });
}

// Core check: compare live rotation against the user's subscribed maps and
// fire a notification for any newly-active subscribed map+window.
export async function checkRotationAndNotify(): Promise<number> {
  const alerts = await getAlerts();
  if (alerts.length === 0) return 0;

  const rotation = await fetchMapRotation();
  const notified = await getNotifiedKeys();
  let fired = 0;

  for (const mode of MODE_ORDER) {
    const slot = (rotation as any)[mode]?.current;
    if (!slot?.map) continue;

    const sub = alerts.find(
      (a) =>
        a.map.toLowerCase() === slot.map.toLowerCase() &&
        (a.modes.length === 0 || a.modes.includes(mode))
    );
    if (!sub) continue;

    // Unique key per rotation window so we only notify once per window
    const key = `${mode}|${slot.map}|${slot.start}`;
    if (notified[key]) continue;

    await sendMapAlert(slot.map, MODE_LABELS[mode] || mode, slot.remainingTimer);
    await markNotified(key);
    fired++;
  }
  return fired;
}

// ---- Background task registration ----
TaskManager.defineTask(BG_TASK, async () => {
  try {
    const fired = await checkRotationAndNotify();
    return fired > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetch(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      return;
    }
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BG_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BG_TASK, {
        minimumInterval: 15 * 60, // 15 min (OS minimum on iOS)
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (e) {
    // background fetch unsupported (e.g. web) — fall back to foreground polling
  }
}
