````markdown
<div align="center">

# ⚠️ WORK IN PROGRESS - FOR PERSONAL USE - NO RESPONSIBILITY TAKEN ⚠️

# <img src="https://raw.githubusercontent.com/vrcx-team/VRCX/master/images/VRCX.ico" width="64" height="64"> </img> VRCX Mobile (Unofficial Port)

[![VRCX Discord Invite](https://img.shields.io/discord/854071236363550763?color=%237289DA&logo=discord&logoColor=white&label=discord)](https://vrcx.app/discord)

VRCX Mobile is an experimental, unofficial mobile port of the VRCX assistant/companion application for VRChat. It brings the core features of the desktop app to iOS and Android, allowing you to manage your friends, worlds, and avatars on the go.

</div>

## Tech Stack & Architecture

This port leverages the existing Vue.js frontend and wraps it into native mobile applications using Capacitor.

- **Frontend**: Vue.js, Vite
- **Mobile Bridge**: Capacitor (`@capacitor/core`, `@capacitor/cli`)
- **Platforms**: `@capacitor/android`, `@capacitor/ios`
- **Native Integrations**:
    - **Networking**: `CapacitorHttp` and `CapacitorCookies` native plugins seamlessly handle VRChat API requests, bypassing strict browser CORS limits and automatically securely managing your authentication cookies (e.g., `auth` and `twoFactorAuth`).
    - **Storage**: `@capacitor/preferences` replaces desktop storage implementations for secure, native mobile key-value persistence.
    - **Mocked Desktop Features**: Desktop-exclusive integrations (like `SQLite`, `LogWatcher`, `AssetBundleManager`, and `Discord` Rich Presence) have been safely mocked with no-ops to prevent frontend crashes on mobile platforms.

---

## Build Guide (iOS & Android)

To compile and test the mobile application, you will need Node.js installed, along with **Android Studio** (for Android) and/or **Xcode** (for iOS, requires macOS).

### 1. Install Dependencies

Clone the repository and install the Node packages:

```bash
npm install
```
````

### 2. Build the Web App for Mobile

Compile the Vue application specifically for the mobile platform environment:

```bash
npm run prod-mobile
# Alternatively: PLATFORM=mobile npx vite build

```

### 3. Sync Native Projects

Synchronize your built web assets into the generated native iOS and Android projects:

```bash
npm run cap:sync
# Alternatively: npx cap sync

```

### 4. Run / Open the Native IDEs

Open the respective native project in Android Studio or Xcode to build, sign, and run the app on your physical device or an emulator:

**For Android:**

```bash
npm run cap:run-android
# Alternatively: npx cap open android

```

**For iOS:**

```bash
npm run cap:run-ios
# Alternatively: npx cap open ios

```

---

## Features

- :family: **Friend, world, and avatar list management**
- Manage your friends list, world/group/avatar lists outside of VRChat.
- Monitor the activity of your friends and track their online status, locations, and avatars.
- Track friendship history including add dates, time spent together, and name changes.
- Save notes and memos to help remember how you met.

- :mag: **Powerful search across all entities**
- Search for users, worlds, avatars, and groups, or paste IDs and URLs for direct access.
- Quick Search provides instant client-side fuzzy search across your friends, avatars, worlds, and groups.

- :bell: **Monitor/respond to notifications**
- You can send/receive invites and friend requests from VRCX as well as see the instance info of invites that you receive.

- :performing_arts: **Social Status Presets**
- Save and quickly apply status + status description combinations.

- :rotating_light: **VRChat Server Status**
- A status bar indicator and login page alert inform you of VRChat server issues and outages in real time.

---

## Is VRCX against VRChat's TOS?

**No.**

VRCX is an external tool that uses the VRChat API to provide the features it does.

It does not modify the game in any way, only using the API responsibly to provide the features it does. It is not a mod, or a cheat, or any other form of modification to the game.

To see VRChat's stance on API usage, see the #faq channel in the VRChat Discord.

---

_VRCX is not endorsed by VRChat and does not reflect the views or opinions of VRChat or anyone officially involved in producing or managing VRChat properties. VRChat and all associated properties are trademarks or registered trademarks of VRChat Inc. VRChat © VRChat Inc._

```

```
