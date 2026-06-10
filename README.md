# Apex Map Tracker

A React Native (Expo SDK 51) application for tracking live Apex Legends map rotation data. Supports push notification subscriptions per map, background rotation polling, and real-time countdown timers.

[![GitHub](https://img.shields.io/badge/Expo-SDK%2051-000?logo=expo)](https://expo.dev) [![license](https://img.shields.io/badge/license-MIT-blue)](/LICENSE)

## Features

- **Live rotation display** — Battle Royale, Ranked, Mixtape/LTM, and Wildcard modes with map artwork from the API
- **Real-time countdown** — ticking timer showing time remaining in the current rotation window
- **Next map preview** — queued map card with thumbnail for each mode
- **Map alert subscriptions** — per-map toggle (Rotation tab bell icon or Alerts tab) that registers a local notification trigger
- **Background polling** — registered via `expo-background-fetch` (~15 min OS-minimum interval) with deduplication per rotation window
- **Foreground polling** — 60-second auto-refresh while the app is open, with pull-to-refresh
- **Dark theme** — Apex Legends colour palette (#0B0E13 background, #FF4655 accent, #FFB000 gold)

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 51 with expo-router (file-based routing) |
| Language | TypeScript (strict mode) |
| State | React hooks + AsyncStorage for persisting subscriptions |
| Notifications | `expo-notifications` (local scheduling), `expo-background-fetch` + `expo-task-manager` |
| API | `apexlegendsstatus.com` map rotation v2 endpoint |
| Theming | Custom design tokens in `src/theme.ts` |
| Assets | PNG icons generated via Pillow (1024×1024 app icon, 1242×2436 splash) |

## Getting started

```bash
cd apex-map-tracker
npm install
npx expo start          # scan QR with Expo Go, or press i / a for simulator
```

> Notifications and background fetch require a physical device. They will not fire in the web preview or iOS simulator background mode.

## Project structure

```
app/
  _layout.tsx             # root layout — registers notification permissions + background task
  (tabs)/_layout.tsx      # bottom tab navigator
  (tabs)/index.tsx        # rotation feed — fetches API, renders MapCard per mode
  (tabs)/alerts.tsx       # subscription manager — toggles per-map alert state
components/
  MapCard.tsx             # map card: artwork, gradient overlay, live badge, timer, bell, next map
  Countdown.tsx           # <Countdown endTs={unix} /> — 1s-interval ticking timer
src/
  api.ts                  # typed fetch wrapper for GET /maprotation?version=2
  storage.ts              # AsyncStorage helpers for alert subscriptions and dedup keys
  notifications.ts        # permission request, checkRotationAndNotify(), background task definition
  theme.ts                # colour palette, spacing, typography constants
```

## API configuration

The map rotation data is sourced from [apexlegendsstatus.com](https://apexlegendsstatus.com/). The API key is defined in `src/api.ts`:

```ts
export const API_KEY = '8167c9d4a4e6f814b920515ebf494b71';
```

For production deployments, the key should be moved out of the bundle — use EAS secrets (`expo-constants` `extra` config) or proxy requests through a backend service.

## Notification architecture

1. On app launch, `_layout.tsx` calls `registerForNotifications()` (requests OS permission + creates Android channel) and `registerBackgroundFetch()` (registers `apex-map-rotation-check` background task).
2. `checkRotationAndNotify()` fetches the full rotation, compares each mode's current map against the user's subscribed maps (stored in AsyncStorage), and schedules a local notification if a new match is found.
3. Deduplication: each combination of `{mode, map, start}` is stored in a notified-keys map (24-hour TTL), ensuring one notification per rotation window.

## Limitations

- Background fetch interval is enforced by the OS and may exceed 15 minutes depending on device power state.
- For guaranteed near-instant delivery, a server-side watcher using `expo-server-sdk` to send push notifications to registered device tokens would be required.