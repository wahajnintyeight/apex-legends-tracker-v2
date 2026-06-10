import notifee, {AndroidImportance, AuthorizationStatus} from '@notifee/react-native';
import BackgroundFetch from 'react-native-background-fetch';
import {Platform} from 'react-native';
import {fetchMapRotation, MODE_LABELS, MODE_ORDER} from './api';
import {getAlerts, getNotifiedKeys, markNotified} from './storage';

const CHANNEL_ID = 'map-alerts';

// Request OS notification permission and create the Android channel.
export async function initNotifications(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Map Alerts',
      importance: AndroidImportance.HIGH,
      vibration: true,
      lights: true,
      lightColor: '#FF4655',
    });
  }
  return granted;
}

async function sendMapAlert(map: string, modeLabel: string, timer?: string) {
  await notifee.displayNotification({
    title: `${map} is LIVE`,
    body: `${map} is now in rotation for ${modeLabel}.${
      timer ? ` ${timer} remaining.` : ''
    }`,
    android: {
      channelId: CHANNEL_ID,
      smallIcon: 'ic_launcher',
      color: '#FF4655',
      pressAction: {id: 'default'},
    },
    ios: {sound: 'default'},
  });
}

// Compare live rotation against subscribed maps and notify newly-live windows.
export async function checkRotationAndNotify(): Promise<number> {
  const alerts = await getAlerts();
  if (alerts.length === 0) {
    return 0;
  }

  const rotation = await fetchMapRotation();
  const notified = await getNotifiedKeys();
  let fired = 0;

  for (const mode of MODE_ORDER) {
    const slot = (rotation as any)[mode]?.current;
    if (!slot?.map) {
      continue;
    }

    const sub = alerts.find(
      a =>
        a.map.toLowerCase() === slot.map.toLowerCase() &&
        (a.modes.length === 0 || a.modes.includes(mode)),
    );
    if (!sub) {
      continue;
    }

    const key = `${mode}|${slot.map}|${slot.start}`;
    if (notified[key]) {
      continue;
    }

    await sendMapAlert(slot.map, MODE_LABELS[mode] || mode, slot.remainingTimer);
    await markNotified(key);
    fired++;
  }
  return fired;
}

// Register periodic background polling. iOS/Android enforce the actual cadence.
export async function registerBackgroundFetch(): Promise<void> {
  try {
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // minutes (OS minimum)
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      },
      async (taskId: string) => {
        try {
          await checkRotationAndNotify();
        } catch (e) {
          // ignore network/API errors during background runs
        }
        BackgroundFetch.finish(taskId);
      },
      async (taskId: string) => {
        // task timed out — must still call finish
        BackgroundFetch.finish(taskId);
      },
    );
  } catch (e) {
    // background fetch unsupported on this platform/config
  }
}
