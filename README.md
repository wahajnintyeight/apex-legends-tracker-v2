# Apex Map Tracker

A bare **React Native CLI** (0.76, TypeScript) application for tracking live Apex Legends map rotation, with per-map local push notifications and background polling.

> Migrated from Expo to bare React Native — no Expo runtime, no Expo Go. Runs via the React Native CLI on a native build.

[![React Native](https://img.shields.io/badge/React%20Native-0.76.5-61DAFB?logo=react)](https://reactnative.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org)

## Features

- **Live rotation** — Battle Royale, Ranked, Mixtape/LTM, and Wildcard with map artwork
- **Real-time countdown** — ticking timer for the current rotation window + next-map preview
- **Map alert subscriptions** — per-map toggle persisted in AsyncStorage
- **Local notifications** via Notifee when a subscribed map goes live
- **Background polling** via `react-native-background-fetch` (incl. Android headless task) with per-window deduplication
- **Foreground polling** — 60s auto-refresh + pull-to-refresh
- **Apex dark theme** — #0B0E13 background, #FF4655 / #FFB000 accents

## Tech stack

| Concern | Library |
|---------|---------|
| Core | `react-native` 0.76.5, `react` 18.3.1, TypeScript |
| Navigation | `@react-navigation/native` + `@react-navigation/bottom-tabs` (v7) |
| Notifications | `@notifee/react-native` |
| Background tasks | `react-native-background-fetch` |
| Gradients | `react-native-linear-gradient` |
| Icons | `react-native-vector-icons` (Ionicons) |
| Storage | `@react-native-async-storage/async-storage` |
| Device info | `react-native-device-info` |

## Project structure

```
index.js                    # entry — registers app + background-fetch headless task
App.tsx                     # NavigationContainer, theme, notification bootstrap
app.json                    # RN app name / displayName
metro.config.js             # Metro bundler config
react-native.config.js      # links vector-icons fonts
navigation/
  RootTabs.tsx              # bottom tab navigator (Rotation / Alerts)
screens/
  RotationScreen.tsx        # live rotation feed
  AlertsScreen.tsx          # manage per-map alert subscriptions
components/
  MapCard.tsx               # map card: artwork, gradient, live badge, timer, bell
  Countdown.tsx             # 1s-interval ticking countdown
src/
  api.ts                    # typed map-rotation API client
  storage.ts                # AsyncStorage subscription + dedup helpers
  notifications.ts          # Notifee permissions + display, background-fetch config
  theme.ts                  # design tokens
```

## Prerequisites

Set up your environment per the official guide: https://reactnative.dev/docs/set-up-your-environment
(Node >= 18, JDK 17, Android Studio / Xcode, CocoaPods for iOS).

## Install & run

```bash
npm install

# iOS only — install native pods
cd ios && bundle install && bundle exec pod install && cd ..

# Start Metro
npm start

# In a second terminal:
npm run android
# or
npm run ios
```

## Native configuration

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

`react-native-background-fetch` and `@notifee/react-native` autolink. Follow the
background-fetch Android setup notes (adds a `BackgroundFetchHeadlessTask` and a
boot receiver to the manifest): https://github.com/transistorsoft/react-native-background-fetch

### iOS

In Xcode, enable **Background Modes** capability with:
- Background fetch
- Background processing (and remote notifications if you later add push)

Add the BGTaskScheduler identifier per the background-fetch iOS docs, and request
notification permission (handled at runtime by Notifee `requestPermission()`).

### Vector icons

Fonts are linked via `react-native.config.js`. After install run
`npx react-native-asset` (or rebuild) so the Ionicons font is bundled. On iOS,
confirm the font appears under **Fonts provided by application** in `Info.plist`.

## API configuration

Map rotation data comes from [apexlegendsstatus.com](https://apexlegendsstatus.com/).
The key lives in `src/api.ts`:

```ts
export const API_KEY = '8167c9d4a4e6f814b920515ebf494b71';
```

For production, move it out of the bundle — use `react-native-config` (`.env`)
or proxy requests through a backend service rather than shipping the key.

## Notification architecture

1. `App.tsx` calls `initNotifications()` (Notifee permission + Android channel) and
   `registerBackgroundFetch()` on mount.
2. `checkRotationAndNotify()` fetches the rotation, compares each mode's current
   map against subscribed maps in AsyncStorage, and displays a Notifee
   notification for any newly-live match.
3. Each `{mode, map, start}` window is recorded (24h TTL) so a given window only
   notifies once.
4. While terminated, the Android headless task in `index.js` runs the same check
   when the OS fires a background-fetch event.

## Limitations

- Background-fetch cadence is OS-controlled and may exceed the 15-minute minimum.
- For guaranteed near-instant delivery, add a server that watches the rotation and
  sends remote push via FCM/APNs to registered device tokens.
