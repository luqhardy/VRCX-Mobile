# Capacitor Mobile Port Walkthrough

I have successfully initialized Capacitor in the VRCX project and built the necessary bridges to run the app natively on iOS and Android.

## Changes Made

### 1. Capacitor Setup & Configuration
- **Dependencies**: Installed `@capacitor/core`, `@capacitor/cli`, `@capacitor/preferences`, `@capacitor/ios`, and `@capacitor/android`.
- **Config**: Created `capacitor.config.json` defining the app ID, name, and enabling `CapacitorHttp` and `CapacitorCookies`.
- **NPM Scripts**: Added `prod-mobile`, `cap:sync`, `cap:run-ios`, and `cap:run-android` to `package.json`.

### 2. Platform Bridge (`mobileApi.js`)
Since the app relies on the C# backend via `InteropApi.js` for native integrations, I implemented a mobile polyfill (`mobileApi.js`) that takes over when `isMobilePlatform` is true:
- **`WebApi.Execute`**: Re-routed to use `CapacitorHttp.request`. 
- **`VRCXStorage`**: Re-routed to use `@capacitor/preferences` for native mobile key-value storage.
- **Desktop Only Features**: Mocked `SQLite`, `LogWatcher`, `AssetBundleManager`, and `Discord` with no-ops so the frontend doesn't crash when trying to access them.

> [!NOTE]
> **Authentication & Cookies**
> You mentioned you weren't sure about the auth part. Because we are using the `CapacitorHttp` plugin, all API requests are routed through the native iOS (NSURLSession) and Android (HttpURLConnection) HTTP clients. These native clients automatically store and manage session cookies (like `auth` and `twoFactorAuth`) securely. The VRChat API will set the cookies upon login, and the native client will attach them to subsequent requests automatically!

### 3. UI Adjustments
- Added `isMobilePlatform` tracking to explicitly render or hide features.
- Updated `IntegrationsTab.vue` to hide the Discord Rich Presence settings on mobile, as this feature relies on the desktop Discord client. (More UI hauling will definitely be needed down the line!)

## What was Tested
- Modified the `vite.config.js` to build specifically for the mobile platform (`PLATFORM=mobile`).
- Successfully built the Vue web app using `vite build`.
- Generated the iOS and Android native projects (`npx cap add ios` / `npx cap add android`).
- Synchronized the web build into the native apps (`npx cap sync`).

## Validation Results
Both iOS and Android projects have been generated and are ready to compile. You can open them in Android Studio or Xcode to test the UI on an emulator:
- `npx cap open android`
- `npx cap open ios`
