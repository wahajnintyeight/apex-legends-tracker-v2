import AsyncStorage from '@react-native-async-storage/async-storage';

const ALERTS_KEY = 'apex_map_alerts_v1';
const NOTIFIED_KEY = 'apex_map_notified_v1';

// A subscription is keyed by map name. Optionally scoped to a mode.
export type Alert = {
  map: string;
  modes: string[]; // empty array = any mode
};

export async function getAlerts(): Promise<Alert[]> {
  try {
    const raw = await AsyncStorage.getItem(ALERTS_KEY);
    return raw ? (JSON.parse(raw) as Alert[]) : [];
  } catch {
    return [];
  }
}

export async function saveAlerts(alerts: Alert[]): Promise<void> {
  await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export async function toggleAlert(map: string): Promise<Alert[]> {
  const alerts = await getAlerts();
  const idx = alerts.findIndex((a) => a.map === map);
  if (idx >= 0) {
    alerts.splice(idx, 1);
  } else {
    alerts.push({ map, modes: [] });
  }
  await saveAlerts(alerts);
  return alerts;
}

export async function isAlertOn(map: string): Promise<boolean> {
  const alerts = await getAlerts();
  return alerts.some((a) => a.map === map);
}

// Track which (map|window) pairs we've already notified for, so background
// polling doesn't fire duplicate notifications for the same rotation window.
export async function getNotifiedKeys(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFIED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function markNotified(key: string): Promise<void> {
  const keys = await getNotifiedKeys();
  keys[key] = Date.now();
  // prune entries older than 24h to keep storage small
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const k of Object.keys(keys)) {
    if (keys[k] < cutoff) delete keys[k];
  }
  await AsyncStorage.setItem(NOTIFIED_KEY, JSON.stringify(keys));
}
