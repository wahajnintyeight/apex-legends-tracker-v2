// Apex Legends Status API client
// Docs: https://apexlegendsstatus.com/

// NOTE: This key was provided for development. For production, move it to a
// secure backend or use expo-constants / EAS secrets instead of bundling it.
export const API_KEY = '8167c9d4a4e6f814b920515ebf494b71';
const BASE_URL = 'https://api.apexlegendsstatus.com';

export type MapSlot = {
  start: number;
  end: number;
  readableDate_start: string;
  readableDate_end: string;
  map: string;
  code: string;
  DurationInSecs: number;
  DurationInMinutes: number;
  asset: string;
  eventName?: string;
  isActive?: boolean;
  remainingSecs?: number;
  remainingMins?: number;
  remainingTimer?: string;
};

export type ModeRotation = {
  current: MapSlot;
  next: MapSlot;
};

export type MapRotation = {
  battle_royale?: ModeRotation;
  ranked?: ModeRotation;
  ltm?: ModeRotation;
  wildcard?: ModeRotation;
};

export const MODE_LABELS: Record<string, string> = {
  battle_royale: 'Battle Royale',
  ranked: 'Ranked',
  ltm: 'Mixtape / LTM',
  wildcard: 'Wildcard',
};

export const MODE_ORDER = ['battle_royale', 'ranked', 'ltm', 'wildcard'];

export async function fetchMapRotation(): Promise<MapRotation> {
  const res = await fetch(`${BASE_URL}/maprotation?version=2`, {
    headers: { Authorization: API_KEY },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  const data = await res.json();
  if (data?.Error || data?.error) {
    throw new Error(data.Error || data.error);
  }
  return data as MapRotation;
}

// Returns the unique set of map names currently appearing anywhere in rotation
export function getCurrentMapNames(rotation: MapRotation): string[] {
  const names = new Set<string>();
  for (const mode of MODE_ORDER) {
    const m = (rotation as any)[mode]?.current?.map;
    if (m) names.add(m);
  }
  return Array.from(names);
}

// All distinct map names known across current + next slots (used for the
// alert picker so users can subscribe to maps not currently live).
export function getAllMapNames(rotation: MapRotation): string[] {
  const names = new Set<string>();
  for (const mode of MODE_ORDER) {
    const r = (rotation as any)[mode] as ModeRotation | undefined;
    if (r?.current?.map) names.add(r.current.map);
    if (r?.next?.map) names.add(r.next.map);
  }
  return Array.from(names).sort();
}
