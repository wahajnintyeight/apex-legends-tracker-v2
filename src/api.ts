// Apex Legends Status API client
// Docs: https://apexlegendsstatus.com/ · https://apexlegendsapi.com/

// NOTE: provided for development. For production, move it out of the bundle
// (react-native-config / backend proxy) instead of shipping it in the app.
export const API_KEY = '8167c9d4a4e6f814b920515ebf494b71';
const BASE_URL = 'https://api.apexlegendsstatus.com';

// ---- DRY request layer -----------------------------------------------------
// Single fetch helper used by every endpoint: injects auth, builds the query
// string, validates the response, and surfaces API-level errors uniformly.
type Params = Record<string, string | number | boolean | undefined>;

async function apiGet<T>(path: string, params: Params = {}): Promise<T> {
  const query = new URLSearchParams({auth: API_KEY});
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      query.append(k, String(v));
    }
  }
  const res = await fetch(`${BASE_URL}/${path}?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  const data: any = await res.json();
  if (data?.Error || data?.error) {
    throw new Error(data.Error || data.error);
  }
  return data as T;
}

// ============================================================================
// Map rotation
// ============================================================================
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

export type ModeRotation = {current: MapSlot; next: MapSlot};

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

export function fetchMapRotation(): Promise<MapRotation> {
  return apiGet<MapRotation>('maprotation', {version: 2});
}

export function getCurrentMapNames(rotation: MapRotation): string[] {
  const names = new Set<string>();
  for (const mode of MODE_ORDER) {
    const m = (rotation as any)[mode]?.current?.map;
    if (m) {
      names.add(m);
    }
  }
  return Array.from(names);
}

export function getAllMapNames(rotation: MapRotation): string[] {
  const names = new Set<string>();
  for (const mode of MODE_ORDER) {
    const r = (rotation as any)[mode] as ModeRotation | undefined;
    if (r?.current?.map) {
      names.add(r.current.map);
    }
    if (r?.next?.map) {
      names.add(r.next.map);
    }
  }
  return Array.from(names).sort();
}

// ============================================================================
// Player statistics  (GET /bridge)
// ============================================================================
export type Platform = 'PC' | 'PS4' | 'X1';

export const PLATFORMS: {key: Platform; label: string}[] = [
  {key: 'PC', label: 'PC'},
  {key: 'PS4', label: 'PlayStation'},
  {key: 'X1', label: 'Xbox'},
];

export type Tracker = {name: string; value: number; key: string};

export type RankInfo = {
  rankScore: number;
  rankName: string;
  rankDiv: number;
  rankImg: string;
  ladderPosPlatform: number;
};

export type PlayerStats = {
  global: {
    name: string;
    tag: string;
    uid: string;
    avatar: string;
    platform: string;
    level: number;
    toNextLevelPercent: number;
    levelPrestige?: number;
    bans: {isActive: boolean; remainingSeconds: number; last_banReason: string};
    rank: RankInfo;
    arena: RankInfo;
  };
  realtime: {
    isOnline: number;
    isInGame: number;
    selectedLegend: string;
    currentStateAsText: string;
  };
  legends: {
    selected: {
      LegendName: string;
      data: Tracker[];
      ImgAssets: {icon: string; banner: string};
    };
    all: Record<string, {data?: Tracker[]; ImgAssets?: {icon: string; banner: string}}>;
  };
  total: Record<string, {name: string; value: number}>;
};

export function fetchPlayerStats(player: string, platform: Platform): Promise<PlayerStats> {
  return apiGet<PlayerStats>('bridge', {player: player.trim(), platform, version: 5});
}

// Resolve a player's Origin UID only (GET /origin).
export function fetchOriginUid(player: string): Promise<any> {
  return apiGet('origin', {player: player.trim()});
}

// Pull a small set of headline lifetime stats from the `total` map, in a
// preferred order, skipping any the player has no tracker for.
const HEADLINE_KEYS = ['kills', 'damage', 'wins', 'kd', 'headshots', 'games_played'];

export function getHeadlineStats(stats: PlayerStats): {label: string; value: number}[] {
  const total = stats.total || {};
  const picks: {label: string; value: number}[] = [];
  for (const key of HEADLINE_KEYS) {
    const entry = total[key];
    if (entry && typeof entry.value === 'number') {
      picks.push({label: entry.name || key, value: entry.value});
    }
  }
  // Fallback: first few available trackers if none of the preferred ones exist
  if (picks.length === 0) {
    for (const [, entry] of Object.entries(total).slice(0, 4)) {
      picks.push({label: entry.name, value: entry.value});
    }
  }
  return picks.slice(0, 4);
}

// Top legends by their primary (first) tracker value, for a quick overview.
export function getTopLegends(
  stats: PlayerStats,
  limit = 6,
): {name: string; icon?: string; stat?: Tracker}[] {
  const all = stats.legends?.all || {};
  return Object.entries(all)
    .filter(([name]) => name !== 'Global')
    .map(([name, info]) => ({
      name,
      icon: info.ImgAssets?.icon,
      stat: info.data?.[0],
    }))
    .filter(l => l.stat && typeof l.stat.value === 'number')
    .sort((a, b) => (b.stat?.value || 0) - (a.stat?.value || 0))
    .slice(0, limit);
}
