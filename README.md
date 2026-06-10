# 🗺️ Apex Map Tracker

A modern Expo (React Native) app that tracks the live **Apex Legends** map rotation and sends push notifications when a map you care about goes live.

![dark](https://img.shields.io/badge/theme-dark-0B0E13) ![expo](https://img.shields.io/badge/Expo-SDK%2051-000)

## ✨ Features

- **Live rotation** for Battle Royale, Ranked, Mixtape/LTM, and Wildcard
- **Real-time countdown** timers showing time left on each map + the next map up
- **Map alerts** — tap the 🔔 on any map (or use the Alerts tab) to subscribe
- **Notifications** fire the moment a subscribed map enters rotation:
  - Instantly while the app is open (60s polling)
  - In the background roughly every 15 minutes (OS minimum) via `expo-background-fetch`
  - De-duplicated: one notification per rotation window per map
- **Apex-inspired dark UI** with map artwork, live badges, and gold/red accents

## 🚀 Getting started

```bash
cd apex-map-tracker
npm install          # or: yarn
npx expo start       # press i (iOS), a (Android), or scan the QR with Expo Go
```

> **Notifications & background fetch only work on a physical device** (not the web preview or simulator background mode). Use a real phone with the Expo Go app or a development build.

## 🔑 API key

The app uses the [apexlegendsstatus.com](https://apexlegendsstatus.com/) API.
The key currently lives in `src/api.ts`:

```ts
export const API_KEY = '8167c9d4a4e6f814b920515ebf494b71';
```

For production, **do not ship the key in the bundle**. Proxy requests through your
own backend, or inject it via [EAS secrets](https://docs.expo.dev/build-reference/variables/)
/ `expo-constants` `extra` config instead.

## 🗂️ Project structure

```
app/
  _layout.tsx            # root: registers notifications + background fetch
  (tabs)/_layout.tsx     # bottom tabs
  (tabs)/index.tsx       # live rotation screen
  (tabs)/alerts.tsx      # manage map alert subscriptions
components/
  MapCard.tsx            # rotation card with image, timer, alert bell
  Countdown.tsx          # live ticking countdown
src/
  api.ts                 # typed map-rotation API client
  storage.ts             # AsyncStorage for alert subscriptions
  notifications.ts       # permissions, alert logic, background task
  theme.ts               # design tokens
```

## ⚙️ How notifications work

1. On launch the app requests notification permission and registers a
   background-fetch task (`apex-map-rotation-check`).
2. `checkRotationAndNotify()` fetches the rotation, compares the *current* map in
   each mode against your saved subscriptions, and schedules a local
   notification for any newly-live match.
3. A per-window key (`mode|map|start`) is stored so you're never notified twice
   for the same rotation window.

> Background fetch intervals are controlled by the OS and may be longer than 15
> minutes depending on device state. For guaranteed, instant delivery, wire up a
> server + Expo Push (`expo-server-sdk`) that watches the rotation and pushes to
> registered device tokens.
