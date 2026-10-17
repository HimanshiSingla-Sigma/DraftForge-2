# DraftForge AI — Mobile Application (Android & iOS)

A standalone, store-ready Flutter mobile application for **DraftForge AI** — an evidence-grounded legal drafting education and statutory evaluation platform.

The mobile app reuses the existing FastAPI backend, Supabase authentication, and Neo4j GraphRAG services directly, without altering or disrupting the production React website.

---

## 1. Architecture Overview

The app follows a clean, layered mobile architecture:

```
mobile/
├── android/                  # Android native project & Gradle config
├── ios/                      # iOS native project, Runner & Podfile
├── lib/
│   ├── main.dart             # App entrypoint, theme & authentication gate
│   ├── core/
│   │   ├── config/           # Environment config (Production Render HTTPS default)
│   │   ├── constants/        # Design system tokens (colors, typography)
│   │   ├── network/          # Dio HTTP client, Auth Interceptors, Error Handling
│   │   ├── security/         # Encrypted SharedPreferences & iOS Keychain session storage
│   │   └── models/           # Typed Dart models (User, Draft, Evaluation, Loophole, Assignment)
│   ├── features/
│   │   ├── auth/             # Login, Token Verification, Invitation Acceptance
│   │   ├── dashboard/        # Executive stats, metric summary, quick actions
│   │   ├── drafts/           # Draft corpus, full text viewer, version revisions, document upload
│   │   ├── evaluations/      # Dimensional rubric breakdown, traceable evidence citations
│   │   ├── loopholes/        # Neo4j GraphRAG loophole & risk report
│   │   ├── assignments/      # Coursework list, draft version submission
│   │   ├── tutor/            # Socratic AI legal mentor chat interface
│   │   └── profile/          # Scholar credentials, institution security, sign out
│   └── shared/
│       └── widgets/          # TactileCard, TactileButton, StatusBadge, Empty/Error/Loading states
├── test/                     # Automated model serialization & business logic unit tests
├── pubspec.yaml              # Flutter dependency manifest
└── README.md
```

---

## 2. Prerequisites & Setup

### Install Flutter SDK
1. Download Flutter SDK (version 3.19.0 or higher) from [flutter.dev](https://docs.flutter.dev/get-started/install).
2. Extract the SDK and add `flutter/bin` to your system `PATH`.
3. Verify the installation:
   ```bash
   flutter doctor
   ```

### Get Dependencies
From the `mobile/` directory:
```bash
cd mobile
flutter pub get
```

---

## 3. Running the Application

### Connect to Backend
The app is pre-configured to connect to your live production Render backend:
`https://draftforge-2-d9mc.onrender.com/api/v1`

To switch to a local development backend (e.g. while developing locally), open `lib/core/config/app_config.dart` and set:
```dart
static AppEnvironment currentEnvironment = AppEnvironment.localDevelopment;
```
*(On Android Emulator, `10.0.2.2:8000` automatically maps to your PC's `localhost:8000`).*

### Run on Android
```bash
flutter run -d android
```

### Run on iOS (Requires macOS & Xcode)
```bash
cd ios && pod install && cd ..
flutter run -d ios
```

---

## 4. Building for Google Play Store (Android)

### 1. Create a Keystore
Generate a private signing key:
```bash
keytool -genkey -v -keystore android/app/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

### 2. Configure `android/key.properties`
Create `android/key.properties` (this file is ignored in git):
```properties
storePassword=yourStorePassword
keyPassword=yourKeyPassword
keyAlias=upload
storeFile=upload-keystore.jks
```

### 3. Generate Release App Bundle (AAB)
```bash
flutter build appbundle --release
```
The output file will be at:
`build/app/outputs/bundle/release/app-release.aab`

Upload this file to the **Google Play Console** under **Production** or **Internal Testing**.

---

## 5. Building for Apple App Store (iOS)

> **Note**: Building and signing iOS apps requires a Mac with Xcode and an active Apple Developer Program account.

1. Open `ios/Runner.xcworkspace` in Xcode.
2. Select your Team under **Signing & Capabilities**.
3. Verify bundle identifier: `com.draftforge.ai`.
4. Build the archive:
   ```bash
   flutter build ipa --release
   ```
5. In Xcode Organizer, click **Distribute App** to upload to **TestFlight** and **App Store Connect**.

---

## 6. Store Privacy Disclosures

When submitting to Google Play and the App Store:
- **Data Collected**:
  - Name and Email (for student account authentication).
  - User Content (legal drafting text and uploaded documents).
- **Data Security**:
  - All communication uses HTTPS with TLS 1.3 encryption.
  - JWT tokens are encrypted at rest using Android EncryptedSharedPreferences and iOS Keychain.
- **Account Deletion**:
  - Users can request account and draft removal via institution administrator or within the app profile settings.

---

## 7. Website Preservation Guarantee

- The existing React/Vite website (`frontend/`) and FastAPI backend (`backend/`) remain 100% intact.
- Both mobile and web clients communicate with the identical backend API contracts, sharing the exact same user accounts, legal drafts, submissions, and evaluation scores.
