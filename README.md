# athena-mobile

> The React Native mobile app for Athena — a voice-cloning EPUB reading app.

This repository contains the Expo SDK 56 mobile app that powers the Athena experience on iOS and Android. It handles onboarding, voice recording, book discovery, library management, audio playback, and text reading..... all in a monochrome editorial design where book covers provide the only colour.

---

## What this app does

- Onboards new users with a one-time swipeable intro flow
- Guides users through a 60-second voice recording to create their voice profile
- Connects to `athena-api` for book discovery across 70,000+ free public domain books
- Manages a personal library with reading progress tracking
- Streams audio chunks synthesised in the user's cloned voice
- Reads books in text mode with font and size controls
- Highlights the sentence currently being read when listening and reading simultaneously
- Works on both iOS and Android with a native tab bar on iOS 26+ (Liquid Glass)

---

## Related repositories

| Repository | Description |
|---|---|
| [athena-api](https://github.com/sagittaerys/athena-api) | Rails 8 backend |
| [athena-tts](https://github.com/sagittaerys/athena-tts) | Python FastAPI TTS server |

---

## Tech stack

- **Expo SDK 56** — toolchain and native module management
- **React Native 0.85.3** — cross-platform mobile framework
- **React 19.2** — UI library
- **TypeScript 6** — type safety throughout
- **Expo Router** — file-based navigation (like Next.js for mobile)
- **Zustand** — global state management
- **React Native Reanimated v4** — animations (New Architecture)
- **expo-audio** — audio playback and voice recording
- **expo-blur** — blur effects for tab bar and mini player
- **expo-image** — optimised image loading with caching
- **expo-secure-store** — encrypted JWT token storage
- **expo-notifications** — local push notifications

---

## Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for builds (`npm install -g eas-cli`)
- Android Studio (for Android emulator) or physical device
- athena-api running locally or deployed

---

## Local setup

```bash
# Clone the repo
git clone https://github.com/sagittaerys/athena-mobile
cd athena-mobile

# Install dependencies
npm install

# Set up environment variables
# Create .env.local at the project root:
echo "EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000" > .env.local

```

### Font setup

Copy the Cabinet Grotesk font files into `assets/fonts/`:

```
assets/fonts/
  CabinetGrotesk-Regular.otf
  CabinetGrotesk-Medium.otf
  CabinetGrotesk-Bold.otf
  CabinetGrotesk-Extrabold.otf
```

Cabinet Grotesk is available free from Fontshare: https://www.fontshare.com/fonts/cabinet-grotesk

### Development build (recommended)

Expo Go does not support all native modules used in Athena. Use a development build instead:

```bash
# Android
npx expo run:android

# iOS (macOS only)
npx expo run:ios
```

### Start the development server

```bash
npx expo start --dev-client
```

### WSL + physical device setup

If running Rails on WSL and testing on a physical Android device:

```bash
# 1. Find your WSL IP
hostname -I | awk '{print $1}'

# 2. Set it in .env.local
EXPO_PUBLIC_API_URL=http://<WSL_IP>:3000

# 3. Start Rails listening on all interfaces
bin/rails server -b 0.0.0.0

# 4. Allow port through Windows firewall (run once as PowerShell admin)
New-NetFirewallRule -DisplayName "Rails 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

# 5. If direct connection fails, use tunnel
npx expo start --dev-client --tunnel
```

---

## Project structure

```
athena-mobile/
├── app/                          — Expo Router (navigation only)
│   ├── _layout.tsx               — root layout, fonts, auth check
│   ├── index.tsx                 — entry point, redirect logic
│   ├── player.tsx                — full screen player (modal)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── onboarding.tsx        — 3-slide intro (first launch only)
│   │   ├── welcome.tsx           — fanned book covers + CTA
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── voice-setup.tsx       — 5-step voice recording flow
│   ├── (tabs)/
│   │   ├── _layout.tsx           — tab bar (Liquid Glass iOS / animated Android)
│   │   ├── index.tsx             — Library tab
│   │   ├── discover.tsx          — Discover tab
│   │   └── me.tsx                — Me/Profile tab
│   ├── book/[id].tsx             — book detail screen
│   └── reader/[id].tsx           — text reader screen
│
├── src/
│   ├── features/
│   │   ├── auth/                 — auth components, hooks, store
│   │   ├── library/              — library screens, components, store
│   │   ├── discover/             — discover components, store
│   │   ├── player/               — player screen, useAudioPlayer hook, store
│   │   └── profile/              — profile components
│   ├── shared/
│   │   ├── components/
│   │   │   ├── MiniPlayer/       — persistent mini player above tab bar
│   │   │   ├── TabBar/           — AndroidTabBar + IOSNativeTabLayout
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── Typography/
│   │   ├── constants/
│   │   │   ├── colors.ts         — full light/dark color palette
│   │   │   ├── typography.ts     — Cabinet Grotesk font tokens + sizes
│   │   │   └── spacing.ts        — spacing and border radius tokens
│   │   ├── hooks/
│   │   │   ├── useTheme.ts
│   │   │   └── useNetworkStatus.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── book.ts
│   │   │   └── audio.ts
│   │   └── utils/
│   │       ├── api.ts            — fetch wrapper with JWT auto-refresh
│   │       ├── toast.ts          — sonner-native wrapper
│   │       └── storage.ts        — AsyncStorage helpers
│   └── services/
│       ├── auth.service.ts
│       ├── books.service.ts
│       ├── audio.service.ts
│       └── notification.service.ts
│
├── assets/
│   ├── fonts/                    — Cabinet Grotesk OTF files
│   ├── images/                   — app icon, splash, adaptive icon
│   └── audio/                    — demo-voice.wav for voice setup screen
│
├── app.json                      — Expo config
├── tsconfig.json                 — TypeScript config with @/ path alias
└── .env.local                    — local environment (never commit)
```

---

## Screen flow

```
First launch:
  Splash → Onboarding (3 slides) → Welcome → Register → Voice Setup → Library

Returning user (logged in):
  Splash → Library

Returning user (logged out):
  Splash → Welcome → Login → Library

Book flow:
  Discover → Book Detail → Add to Library → Parse EPUB → Listen / Read

Audio flow:
  Book Detail → Player → chunks requested async → poll → stream → playback
```

---

## Design system

Athena is monochrome — the UI contributes zero colour. Book covers are the only source of colour in the app.

**Font:** Cabinet Grotesk (Regular, Medium, Bold, Extrabold)

**Colour tokens:**

| Token | Light | Dark | Use |
|---|---|---|---|
| background | #F7F5F2 | #111111 | App background |
| text | #111111 | #F5F5F5 | Primary text and actions |
| textSecondary | #555555 | #AAAAAA | Supporting text |
| textTertiary | #999999 | #666666 | Placeholders, captions |
| border | #E5E3DF | #2A2A2A | Dividers, input borders |

**Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48

**Border radius:** 8 / 12 / 16 / 24 / full (9999)

---

## Audio pipeline

```
1. User taps Listen on a book
2. Rails parses EPUB → returns chapters and chunks (≤500 chars each)
3. App requests audio for current chunk via POST /audio_chunks
4. Rails enqueues AudioSynthesisJob (returns 202 immediately)
5. Background job calls TTS server → KokoClone synthesises WAV
6. App polls chunk status every 3 seconds until status: ready
7. App streams WAV via GET /audio_chunks/:id/stream
8. expo-audio plays the stream
9. PRELOAD_AHEAD = 2 chunks requested before needed → seamless playback
```

---

## State management

| Store | State | Key actions |
|---|---|---|
| useAuthStore | user, voiceProfile, isAuthenticated | login, register, logout, checkAuth |
| useLibraryStore | items, chaptersByBookId | fetchLibrary, addBook, removeBook, parseEpub |
| usePlayerStore | libraryItemId, chapter/chunk indexes, speed, status | openPlayer, setChunk, nextChunk, reset |
| useDiscoverStore | books, genres, pagination | searchBooks, loadMoreBooks, fetchGenres |

---

## Notifications

Athena uses local notifications only (no server-side push infrastructure):

- **Audio ready** — fires when a chunk finishes generating
- **Chapter complete** — fires when a chapter finishes playing
- **Reading reminder** — scheduled 24h nudge (optional)

All notifications tap through to the relevant screen via `NotificationService.handleNotificationTap`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| EXPO_PUBLIC_API_URL | Yes | Rails API base URL. Must use `EXPO_PUBLIC_` prefix to be available in the client bundle |

---

## Building for production

```bash
# Configure EAS
eas build:configure

# Android APK (for testing)
eas build --platform android --profile preview

# Android AAB (for Play Store)
eas build --platform android --profile production

# iOS (requires Apple Developer account)
eas build --platform ios --profile production
```

---

## Acknowledgements

Voice cloning powered by [KokoClone](https://github.com/Ashish-Patnaik/kokoclone) by Ashish Patnaik, built on [Kokoro-82M](https://github.com/hexgrad/kokoro) by hexgrad. Both licensed under Apache 2.0.

Book data from [Project Gutenberg](https://www.gutenberg.org) via [Gutendex](https://gutendex.com) and [Open Library](https://openlibrary.org).

---

## Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feat/your-feature`
3. Follow the existing folder structure — features vs shared
4. Submit a pull request

---

## License

MIT — see LICENSE for details.

---
