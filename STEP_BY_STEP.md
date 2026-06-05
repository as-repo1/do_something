# Step-by-Step Development Guide: Do_Something Task Manager

This guide walks through the architectural decisions, structural implementation, styling tokens, data migration engine, Android WebView wrapper, and CI/CD pipelines developed for the **Do_Something** Task Manager.

---

## Table of Contents
1. [Core Web Application & Theme Architecture](#1-core-web-application--theme-architecture)
2. [Data Migration & Storage Engine](#2-data-migration--storage-engine)
3. [Android WebView Integration & Native Bridge](#3-android-webview-integration--native-bridge)
4. [Responsive & Scaled Mobile Layouts](#4-responsive--scaled-mobile-layouts)
5. [CI/CD Release Automation](#5-cicd-release-automation)
6. [Local Synchronization & Build Commands](#6-local-synchronization--build-commands)

---

## 1. Core Web Application & Theme Architecture

The foundational frontend is implemented as a clean single-page application (SPA) using semantic HTML5, modern CSS with custom properties (variables), and Vanilla JavaScript without heavy frameworks.

### Semantic Layout (`index.html`)
The user interface is broken down into semantic containers:
- **`header`**: Houses the main title and the interactive Theme Switcher dropdown.
- **`aside` (Dashboard Stats)**: Formats overall statistics and features a circular SVG progress indicator.
- **`main`**: Wraps the tasks creation form, filters, sorting controls, search input, and the task list (`#task-list`).
- **`section` (Migration Card)**: Contains the Backup/Restore operations.

### Prevents Flash of Unstyled Content (FOUC)
To prevent theme flashes when loading pages:
- A compact script is embedded directly in the `<head>` of `index.html`.
- It reads the theme configuration from `localStorage` and applies the target class to the `<html>` root element *before* the DOM renders.

### CSS Custom Properties & Themes (`main.css`)
We use CSS variables referencing the **OKLCH** color space for fine-grained color control, transitions, and contrast.

Four curated palettes were designed using glassmorphic panels and borders:
1. **Nord**: Polar night background (`oklch(20% 0.02 260)`) with frosty accents (`oklch(80% 0.1 210)`).
2. **Gruvbox**: Retro sand/dark brown colors (`oklch(24% 0.03 65)`) with warm highlights (`oklch(75% 0.12 75)`).
3. **Dracula**: Vampire purple/pink theme (`oklch(18% 0.04 290)`) with neon pink bounds (`oklch(70% 0.2 330)`).
4. **Light Mode**: Vibrant, clean theme with a highly accessible white and slate design.

To make card animations look smooth, we use `@starting-style` transitions. This gives elements a soft fade-in and slide-up transition when they are appended dynamically to the DOM.

---

## 2. Data Migration & Storage Engine

The app uses `localStorage` to synchronize updates reactively. It also supports exporting/importing tasks via JSON.

### Task Schema
```json
{
  "id": 1685973600000,
  "text": "Implement SQLite backend",
  "completed": false,
  "priority": "high",
  "dueDate": "2026-06-10",
  "category": "Work",
  "created": "2026-06-05T13:00:00.000Z"
}
```

### JSON Migration Code (`main.js`)
- **Exporting**: Bundles the entire array, generates a `data:text/json;charset=utf-8` URI string, dynamically creates a temporary `<a download="do_something_backup.json">` element, and simulates a click to download.
- **Importing**: Triggers a hidden `<input type="file" accept=".json">`. Reads the file using the modern `FileReader` API.
- **Validation**: Verifies that the JSON parses into an array and checks that every entry contains at least `id`, `text`, and `completed`. If valid, it prompts the user with an overlay modal warning that importing will overwrite their current list.

---

## 3. Android WebView Integration & Native Bridge

To package the application as an offline Android app, we wrap the web files inside an Android WebView component built using Jetpack Compose.

### Android Entrypoint (`MainActivity.kt`)
The app requires storage read access to let users import backups. `MainActivity` implements an `ActivityResultLauncher` that listens for file choice events:
```kotlin
val fileChooserLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
) { result ->
    if (result.resultCode == Activity.RESULT_OK) {
        val data: Intent? = result.data
        val results = WebChromeClient.FileChooserParams.parseResult(result.resultCode, data)
        filePathCallback?.onReceiveValue(results)
    } else {
        filePathCallback?.onReceiveValue(null)
    }
    filePathCallback = null
}
```
This launcher communicates directly with the WebView's file chooser callbacks.

### Native Bridge (`MainScreen.kt`)
The Compose WebView wrapper sets up Web settings:
- **`javaScriptEnabled = true`**
- **`domStorageEnabled = true`**
- **`allowFileAccess = true`**
- **`useWideViewPort = true` & `loadWithOverviewMode = true`**: Scales the website viewport correctly to avoid rendering in standard desktop proportions.

It hooks into `WebChromeClient` and overrides `onShowFileChooser`. When the web page calls the file chooser (e.g. during backup restore), the wrapper intercepts the request, stores the callback, and launches the native file selection Intent.

### Orientation Preservation (`AndroidManifest.xml`)
Normally, rotating the phone destroys and recreates the parent Activity, resetting the WebView's temporary DOM state. To prevent this, we declare:
```xml
android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout"
```
This intercepts orientation changes and allows the WebView to resize dynamically without reloading.

---

## 4. Responsive & Scaled Mobile Layouts

Mobile screens vary in width and viewport scales. To ensure a premium layout on all form factors:
- **`viewport` Meta Tag**: Placed `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` inside `index.html` to lock native mobile pinch zooms.
- **Text Zoom Protection**: In Kotlin, we explicitly call `settings.textZoom = 100` on the WebView. This prevents the Android OS system font size accessibility settings from bloating the text elements and breaking the page container bounds.
- **Border Box & Flexibility**: `main.css` applies `box-sizing: border-box` globally. Input boxes and buttons use flexible layouts (`flex-wrap: wrap`) and percentages rather than fixed pixel widths to avoid horizontal scrolling.

---

## 5. CI/CD Release Automation

To automate releases, `.github/workflows/release.yml` compiles and publishes the application directly when you push tags.

- **Trigger**: Runs on tag pushes matching `v*` (e.g., `v1.2.0`).
- **Environment**: Builds on an `ubuntu-latest` GitHub Actions runner.
- **Build Sequence**:
  1. Installs JDK 17.
  2. Sets up Gradle caching to speed up subsequent builds.
  3. Grants execution permission to the Gradle wrapper (`chmod +x android-app/gradlew`).
  4. Triggers `./gradlew assembleDebug` inside the `android-app` folder.
  5. Collects the output `app-debug.apk` and publishes it directly to GitHub Releases.

---

## 6. Local Synchronization & Build Commands

If you make modifications to the root web assets (`index.html`, `main.css`, `main.js`), they must be synced to the Android assets directory before compilation.

### Sync Script Example
You can sync manually or use a shell script:
```sh
cp index.html main.css main.js android-app/app/src/main/assets/
```

### Local Build Command
To build a debug APK locally using your Android SDK environment:
```sh
cd android-app
./gradlew assembleDebug
```
The resulting APK will be generated at:
`android-app/app/build/outputs/apk/debug/app-debug.apk`
