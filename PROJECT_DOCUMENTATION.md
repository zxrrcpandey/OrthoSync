# OrthoSync - Project Documentation

> **Dental Practice Management App**
> Built by Dr. Pooja Gangare (Orthodontics & Dentofacial Orthopaedics)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features Requested](#features-requested)
3. [Features Implemented](#features-implemented)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Build Phases & Timeline](#build-phases--timeline)
7. [Known Bugs & Issues](#known-bugs--issues)
8. [Solutions Applied](#solutions-applied)
9. [Pending / Future Work](#pending--future-work)
10. [Setup & Run Instructions](#setup--run-instructions)
11. [Configuration Required](#configuration-required)

---

## Project Overview

OrthoSync is a cross-platform (iOS, Android, Web) dental practice management app designed for doctors who visit multiple hospitals and clinics. It handles patient management, treatment tracking, billing with commission calculations for clinic owners, appointment scheduling, and more.

- **App Name:** OrthoSync
- **Target Users:** Doctors (not patients)
- **Locations Scale:** 89+ hospitals/clinics
- **Languages:** English + Hindi
- **Theme:** Glass White (default) + 5 more selectable themes
- **Repository:** https://github.com/zxrrcpandey/OrthoSync

---

## Features Requested

These are the original features requested by the user:

| # | Feature Requested | Status |
|---|------------------|--------|
| 1 | Register patients with photos | Implemented |
| 2 | Patient's treatment history with photos | Implemented |
| 3 | Fees calculator master | Implemented |
| 4 | Fees calculator patient-wise | Implemented |
| 5 | Treatment-wise fees with equipment cost | Implemented |
| 6 | Logs for hospitals and clinics appointments with calendars | Implemented |
| 7 | In-app notifications | Implemented |
| 8 | Push notifications (patient appointment reminders) + notification page | Implemented |
| 9 | Multi-doctor registration | Implemented |
| 10 | Commission calculation for clinic owners | Implemented (added based on discussion) |
| 11 | Offline support | Implemented |
| 12 | Web admin panel | Implemented |
| 13 | Hindi language support | Implemented |

---

## Features Implemented

### Phase 1 — Authentication & UI Foundation
- [x] Email + Password login
- [x] Phone + OTP login
- [x] Doctor registration with admin verification
- [x] Forgot password flow
- [x] OTP verification (6-digit, auto-focus)
- [x] Doctor profile management
- [x] 3-step doctor setup wizard (Profile, Location, Treatments)
- [x] Green glassmorphism UI theme system
- [x] 6 reusable glass UI components (GlassCard, GlassButton, GlassInput, GradientBackground, Avatar, StatusBadge)
- [x] Bottom tab navigation (Dashboard, Patients, Calendar, Billing, More)
- [x] English + Hindi internationalization (i18n)
- [x] Zustand state management with AsyncStorage persistence

### Phase 2 — Location Management
- [x] Add/Edit/Delete locations (hospitals, own clinics, other's clinics)
- [x] 3 location types: Own Clinic, Hospital, Other's Clinic
- [x] Per-location working schedule (Mon-Sun with time slots)
- [x] Commission model per location:
  - Percentage based
  - Fixed per patient
  - Fixed per visit
  - Monthly rent
  - None (own clinic)
- [x] Commission calculated on: Total Fee or Fee minus Material Cost
- [x] Settlement frequency: Weekly, Monthly, Custom
- [x] Owner details for non-own clinics
- [x] Location search and type filters
- [x] Active/Inactive toggle per location
- [x] Location-wise stats (patients, revenue, pending commission)

### Phase 3 — Patient Registration & Photos
- [x] Patient registration with auto-generated ID (PAT-0001 format)
- [x] Personal info: name, age, gender, phone, email
- [x] Address and city
- [x] Medical info: blood group (8 types), medical history, allergies, emergency contact
- [x] Profile photo capture (camera/gallery)
- [x] 6 dental photo categories:
  - Extraoral Front
  - Extraoral Side
  - Intraoral
  - X-Ray
  - OPG
  - Cephalogram
- [x] Multi-location patient support (patient can visit different locations)
- [x] Patient search by name, ID, or phone
- [x] Patient detail with tabbed view (Overview, Photos, Treatments, Billing)
- [x] Photo grid with category filters
- [x] Full-screen photo viewer modal

### Phase 4 — Treatment History & Stages
- [x] 12 default treatments pre-loaded (English + Hindi names):
  - Metal Braces, Ceramic Braces, Clear Aligners, Retainer
  - Tooth Extraction, Scaling & Polishing, Root Canal
  - Dental Crown, Dental Filling, Dental Implant
  - Teeth Whitening, Denture
- [x] Treatment stage tracking (e.g., Consultation → Bonding → Monthly Adjustments → Debonding → Retainer)
- [x] Treatment status management: Planned, In Progress, On Hold, Completed, Cancelled
- [x] Stage advancement with visual stepper/timeline
- [x] Visit recording per treatment (procedure, notes, photos)
- [x] Treatment fee and equipment cost tracking
- [x] Start date and expected end date
- [x] Doctor-configurable treatment list in settings

### Phase 5 — Fees & Billing
- [x] Fees Master: inline editing of treatment rates and equipment costs
- [x] Category-wise treatment filtering (8 categories)
- [x] Profit calculation (fee - equipment cost)
- [x] Create Bill: patient search, dynamic bill items, treatment suggestions
- [x] GST toggle with configurable percentage (default 18%)
- [x] Payment modes: Cash (primary), UPI
- [x] Full payment or partial payment support
- [x] EMI/Installment setup:
  - Configurable number of installments
  - Auto-calculated monthly due dates
  - Editable installment amounts
- [x] Bill Detail: financial summary, payment recording, installment tracking
- [x] Overdue installment detection
- [x] Shareable text receipt via Share API
- [x] Bill status: Pending, Partial, Paid, Overdue
- [x] Revenue stats on billing overview

### Phase 6 — Commission & Settlement
- [x] Auto-commission calculation for each location per month
- [x] Commission models: Percentage, Fixed/Patient, Fixed/Visit, Rent, None
- [x] Configurable: calculated on Total Fee or Fee minus Material Cost
- [x] Commission Dashboard with month selector (last 6 months)
- [x] Location-wise commission cards with progress bars
- [x] Own clinic earnings separate (no commission)
- [x] Settlement recording: Cash, UPI, Bank Transfer
- [x] Settlement history per location per month
- [x] Shareable commission report for clinic owners (via Share API)
- [x] Settlement status: Pending, Partial, Settled
- [x] Commission can be overridden per patient (configurable in settings)

### Phase 7 — Appointment Calendar
- [x] Custom-built month calendar grid (no external library)
- [x] Appointment dots per location on calendar days
- [x] Day selection to view appointments
- [x] Location filter chips
- [x] Appointment creation: patient search, date/time, location, treatment linking
- [x] Quick duration buttons: 15, 30, 45, 60 minutes
- [x] Appointment statuses: Scheduled, Completed, Missed, Cancelled, Hold
- [x] Status actions: Mark Completed, Mark Missed, Put on Hold, Cancel, Reschedule
- [x] Inline rescheduling with new date/time
- [x] Recurring appointments: Weekly, Bi-weekly, Monthly
- [x] Recurring preview (shows count of appointments to be created)
- [x] Month navigation (previous/next)

### Phase 8 — Notifications
- [x] In-app notification center with filter tabs (All, Reminders, Missed, Payments, Custom)
- [x] Unread count badge on notification bell
- [x] Mark as read / Mark all as read
- [x] Notification types: Appointment Reminder, Missed Appointment, Payment Due, Custom, System
- [x] Push notifications via expo-notifications
- [x] Auto-schedule reminders: 1 day before + 1 hour before appointments
- [x] WhatsApp deep linking for patient messages
- [x] Pre-built WhatsApp message templates:
  - Appointment reminder (with date, time, location, doctor name)
  - Missed appointment follow-up
- [x] Send Notification screen: type selection, patient search, editable messages
- [x] Push + WhatsApp toggles per notification
- [x] Auto-generate reminders for tomorrow's appointments (bulk)
- [x] Time-ago display (Just now, X min ago, X hours ago, Yesterday, date)

### Phase 9 — Reports & Analytics
- [x] Period selector: Today, This Week, This Month, This Year, All Time
- [x] Overview stats: Total Revenue, Total Patients, Appointments, Pending Payments
- [x] Revenue summary with collection rate and visual bar
- [x] Location-wise revenue breakdown with proportional bars
- [x] Treatment-wise revenue breakdown
- [x] Appointment stats: Total, Completed, Missed, Cancelled, Hold with percentages
- [x] Patient summary with gender breakdown
- [x] Commission summary (owed, paid, pending)
- [x] Shareable text report (comprehensive, formatted)
- [x] Shareable daily summary
- [x] Indian number format for all currency (₹XX,XX,XXX)

### Phase 10 — Offline Sync
- [x] Sync service with operation queue (create/update/delete)
- [x] AsyncStorage-based queue persistence
- [x] Network status detection (@react-native-community/netinfo)
- [x] Auto-sync when back online
- [x] Retry logic (up to 3 retries per failed operation)
- [x] useNetworkStatus custom hook
- [x] OfflineBanner component (shows offline status + pending changes count)
- [x] Sync Now button for manual sync
- [x] Last sync time tracking
- [x] Dashboard updated with real-time store data

### Phase 11 — Web Admin Panel
- [x] Platform detection: web renders admin panel, mobile renders app
- [x] Sidebar navigation (10 sections)
- [x] Dashboard: stat cards, today's appointments, recent activity, upcoming
- [x] Patients table with search
- [x] Appointments table with date filter
- [x] Billing table with status filters and summary stats
- [x] Locations grid with cards
- [x] Treatments table with fees and stages
- [x] Commission records table
- [x] Reports section with analytics
- [x] Notifications list
- [x] Settings section
- [x] Web-optimized glassmorphism (backdropFilter, boxShadow)
- [x] Responsive layout with sidebar + main content

### Phase 12 — Multi-Theme System
- [x] 6 selectable themes with live preview:
  - 🤍 Glass White (DEFAULT) — soft grey gradient, frosted white glass, cyan accent, dark text (inspired by Apple Vision Pro)
  - 🟢 Green Glass — dark green gradient, white text, green accent
  - 🔵 Ocean Blue — deep blue gradient, ice glass, cyan accent
  - 🌑 Dark Neon — dark purple background, neon pink accents
  - 💜 Purple Haze — deep purple gradient, soft glass, violet accent
  - 🌿 Light Green — light green background, clean glass, dark text
- [x] ThemeProvider React Context with useTheme() hook
- [x] Theme persisted in Zustand appStore (survives app restart)
- [x] Theme Settings screen with visual gallery (mini phone mockups per theme)
- [x] Live Preview section showing sample UI elements in real-time
- [x] StatusBar adapts (light for dark themes, dark for light themes)
- [x] Tab bar colors update per theme
- [x] All key screens updated to use dynamic colors

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React Native (Expo SDK 55) | Cross-platform (iOS, Android, Web) |
| Language | TypeScript | Type safety |
| State Management | Zustand | Lightweight, persistent stores |
| Persistence | AsyncStorage | Local data storage & offline support |
| Navigation | React Navigation v7 | Stack + Tab navigation |
| UI Effects | expo-blur, expo-linear-gradient | Glassmorphism effects |
| Camera/Photos | expo-image-picker | Photo capture & gallery |
| Notifications | expo-notifications | Push notifications |
| Icons | @expo/vector-icons (Ionicons) | Icon system |
| i18n | i18next + react-i18next | English + Hindi |
| Network | @react-native-community/netinfo | Offline detection |
| Backend (placeholder) | Firebase | Auth, Firestore, Storage, FCM |

---

## Project Structure

```
OrthoSync/ (77 source files)
├── App.tsx                              # Entry point
├── src/
│   ├── components/ui/                   # 8 reusable UI components
│   │   ├── GlassCard.tsx
│   │   ├── GlassButton.tsx
│   │   ├── GlassInput.tsx
│   │   ├── GradientBackground.tsx
│   │   ├── Avatar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoViewer.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── index.ts
│   ├── screens/
│   │   ├── auth/                        # 4 auth screens
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── OtpVerificationScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── doctor/                      # 2 doctor screens
│   │   │   ├── DoctorProfileScreen.tsx
│   │   │   └── DoctorSetupScreen.tsx
│   │   ├── main/                        # 5 tab screens
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── PatientsScreen.tsx
│   │   │   ├── CalendarScreen.tsx
│   │   │   ├── BillingScreen.tsx
│   │   │   └── MoreScreen.tsx
│   │   ├── patient/                     # 2 patient screens
│   │   │   ├── AddPatientScreen.tsx
│   │   │   └── PatientDetailScreen.tsx
│   │   ├── location/                    # 3 location screens
│   │   │   ├── LocationsListScreen.tsx
│   │   │   ├── AddLocationScreen.tsx
│   │   │   └── LocationDetailScreen.tsx
│   │   ├── treatment/                   # 3 treatment screens
│   │   │   ├── AddTreatmentScreen.tsx
│   │   │   ├── TreatmentDetailScreen.tsx
│   │   │   └── AddTreatmentVisitScreen.tsx
│   │   ├── billing/                     # 6 billing screens
│   │   │   ├── FeesMasterScreen.tsx
│   │   │   ├── CreateBillScreen.tsx
│   │   │   ├── BillDetailScreen.tsx
│   │   │   ├── CommissionDashboardScreen.tsx
│   │   │   ├── CommissionDetailScreen.tsx
│   │   │   └── AddSettlementScreen.tsx
│   │   ├── calendar/                    # 3 calendar screens
│   │   │   ├── CalendarViewScreen.tsx
│   │   │   ├── AddAppointmentScreen.tsx
│   │   │   └── AppointmentDetailScreen.tsx
│   │   ├── notification/                # 2 notification screens
│   │   │   ├── NotificationsScreen.tsx
│   │   │   └── SendNotificationScreen.tsx
│   │   ├── reports/                     # 1 reports screen
│   │   │   └── ReportsDashboardScreen.tsx
│   │   ├── settings/                    # 1 settings screen
│   │   │   └── ThemeSettingsScreen.tsx
│   │   └── web/                         # 1 web panel
│   │       └── WebDashboard.tsx
│   ├── navigation/                      # 8 navigation files
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   ├── PatientsNavigator.tsx
│   │   ├── CalendarNavigator.tsx
│   │   ├── BillingNavigator.tsx
│   │   ├── MoreNavigator.tsx
│   │   ├── WebNavigator.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   ├── store/                           # 7 Zustand stores
│   │   ├── authStore.ts
│   │   ├── appStore.ts
│   │   ├── locationStore.ts
│   │   ├── patientStore.ts
│   │   ├── treatmentStore.ts
│   │   ├── billingStore.ts
│   │   ├── commissionStore.ts
│   │   ├── appointmentStore.ts
│   │   ├── notificationStore.ts
│   │   └── index.ts
│   ├── services/                        # 2 services
│   │   ├── notificationService.ts
│   │   └── syncService.ts
│   ├── hooks/                           # 1 custom hook
│   │   ├── useNetworkStatus.ts
│   │   └── index.ts
│   ├── theme/                           # Theme system (6 themes)
│   │   ├── themes.ts                    # 6 theme color palettes
│   │   ├── ThemeProvider.tsx             # React Context + useTheme() hook
│   │   ├── colors.ts                    # Legacy static colors
│   │   ├── spacing.ts                   # Spacing, BorderRadius, FontSize
│   │   └── index.ts
│   ├── i18n/                            # Internationalization
│   │   ├── en.ts
│   │   ├── hi.ts
│   │   └── index.ts
│   ├── types/                           # TypeScript definitions
│   │   └── index.ts
│   └── config/                          # Configuration
│       └── firebase.ts
```

---

## Build Phases & Timeline

| Phase | Commit | Files Changed | Lines Added |
|-------|--------|---------------|-------------|
| 1 & 2 | `cb12f03` | 42 files | ~8,075 |
| 3 | `406cfa3` | 10 files | ~2,483 |
| 4 | `4a97d7f` | 7 files | ~2,933 |
| 5 | `a595c5a` | 8 files | ~3,248 |
| 6 | `8f25ebd` | 7 files | ~2,329 |
| 7 | `847106a` | 7 files | ~2,993 |
| 8 | `4276a82` | 7 files | ~1,954 |
| 9 | `bfb58f7` | 3 files | ~1,158 |
| 10 & 11 | `6459b31` | 12 files | ~2,573 |
| 12 (Theme) | `b47a1fc` | 13 files | ~1,261 |
| **Total** | **13+ commits** | **77 source files** | **~29,007 lines** |

---

## Known Bugs & Issues

### Critical
| # | Bug | Status | Notes |
|---|-----|--------|-------|
| 1 | Node.js v18 engine warnings | Open | Expo SDK 55 requires Node >= 20. App works but shows npm warnings. **Solution:** Upgrade Node.js to v20+ |

### Medium
| # | Bug | Status | Notes |
|---|-----|--------|-------|
| 2 | Firebase not connected | Open | Using placeholder config. No real auth/database. All data is local-only via AsyncStorage |
| 3 | Date/Time pickers are plain TextInputs | Open | Should use native date/time picker components for better UX |
| 4 | BlurView may not render on Android emulator | Open | Known expo-blur limitation. Works on physical devices |
| 5 | Web panel BlurView fallback | Resolved | Web uses rgba backgrounds instead of BlurView (not supported on web) |

### Low
| # | Bug | Status | Notes |
|---|-----|--------|-------|
| 6 | Quick Actions on Dashboard don't navigate | Open | Currently `console.log` placeholders. Need to wire to navigation |
| 7 | Photo storage is URI-only | Open | Photos stored as local URIs. Will be lost if app cache is cleared. Need Firebase Storage |
| 8 | No form validation UI feedback | Open | Validation uses Alert.alert. Should show inline error messages |
| 9 | Subscription/paywall not implemented | Open | Photo limit model defined but not enforced |
| 10 | Settings screen is placeholder | Open | Shows info but no actual toggleable settings |

---

## Solutions Applied

### TypeScript Compilation Fixes
| Issue | Solution |
|-------|---------|
| LinearGradient colors type error (`string[]` not assignable) | Added `as const` to all gradient arrays in `colors.ts` |
| `@expo/vector-icons` module not found | Installed `@expo/vector-icons` package |
| `Alert.prompt` callback implicit `any` type | Added explicit `(value: string \| undefined)` parameter types |
| Navigation type mismatch for screens with required params | Used separate `onPress` handlers instead of dynamic `navigation.navigate(item.screen)` |

### Architecture Decisions
| Decision | Reasoning |
|----------|-----------|
| Zustand over Redux | Lighter, simpler for this project size. Built-in persist middleware. |
| AsyncStorage for offline | Works with Zustand persist. Firebase sync can be layered on top. |
| Custom calendar grid over library | No external dependency. Full control over design. Glassmorphism-compatible. |
| Single-file web dashboard | Simpler deployment. All sections in one component with state-based switching. |
| expo-image-picker over expo-camera | Simpler API, handles both camera and gallery. Permission management included. |
| WhatsApp deep linking over API | No backend needed. Opens WhatsApp directly with pre-filled message. |
| Text-based receipts/reports over PDF | Works everywhere without native PDF libraries. Share via any app. |
| Platform.OS check for web vs mobile | Clean separation. Web gets admin panel, mobile gets patient-facing app. |

---

## Security Audit Results

### Last Audit: 2026-03-16

| Check | Result |
|-------|--------|
| `npm audit` | **0 vulnerabilities** |
| `npx expo-doctor` | **17/17 checks passed** |
| TypeScript (`npx tsc --noEmit`) | **0 errors** across 77 files |
| React version | **19.2.0** (NOT vulnerable to CVE-2024-56562) |
| React Native version | **0.83.2** (latest stable) |

### CVE-2024-56562 — React.js Critical (CVSS 10.0)
- **Affected:** React < 19.0.0 (react-dom SSR with dangerouslySetInnerHTML)
- **Our status:** **NOT AFFECTED** — React 19.2.0 is fully patched
- **React Native:** Not affected (no react-dom SSR)

### Dependency Fixes Applied (2026-03-16)
| Package | Was | Fixed To | Reason |
|---------|-----|----------|--------|
| @react-native-async-storage | 3.0.1 | 2.2.0 | SDK 55 compatibility |
| @react-native-community/netinfo | 12.0.1 | 11.5.2 | SDK 55 compatibility |
| react-native-safe-area-context | 5.7.0 | ~5.6.2 | SDK 55 compatibility |
| react-native-screens | 4.24.0 | ~4.23.0 | SDK 55 compatibility |
| expo-font | (missing) | ~55.0.4 | Missing peer dependency |
| react-dom | (missing) | 19.2.0 | Web platform support |
| react-native-web | (missing) | ~0.21.0 | Web platform support |

### How to Run Security Audit
```bash
npm audit                    # Check for vulnerabilities
npx expo-doctor              # Check Expo compatibility
npx tsc --noEmit             # Check TypeScript compilation
npm ls react react-dom       # Verify React versions
```

---

## Pending / Future Work

### Phase 12 — Production Readiness

| # | Task | Priority | Description |
|---|------|----------|-------------|
| 1 | Connect Firebase | High | Replace placeholder config, enable Auth, Firestore, Storage, FCM |
| 2 | Upgrade Node.js | High | Upgrade to Node.js v20+ to resolve engine warnings |
| 3 | Native Date/Time Pickers | Medium | Replace TextInput date/time with `@react-native-community/datetimepicker` |
| 4 | App Icon & Splash Screen | Medium | Design and configure OrthoSync branding |
| 5 | Subscription Paywall | Medium | Implement RevenueCat or Razorpay for photo limits |
| 6 | PDF Receipt Generation | Medium | Use `react-native-html-to-pdf` for professional receipts |
| 7 | Real Push Notifications | Medium | FCM setup for actual remote push delivery to patient devices |
| 8 | SMS Integration | Low | Twilio/MSG91 for SMS appointment reminders |
| 9 | Unit & Integration Tests | Low | Jest + React Native Testing Library |
| 10 | App Store Submission | Low | Build profiles, screenshots, metadata for iOS & Android stores |
| 11 | Doctor Verification Backend | Low | Admin approval flow for new doctor registrations |
| 12 | Data Backup/Export | Low | Full data export to JSON/CSV for backup |

---

## Setup & Run Instructions

### Prerequisites
- Node.js v20+ (recommended)
- npm or yarn
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator
- Physical device with Expo Go app (optional)

### Installation
```bash
# Clone the repository
git clone https://github.com/zxrrcpandey/OrthoSync.git
cd OrthoSync

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on specific platform
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
npx expo start --web      # Web Admin Panel
```

### Running on Physical Device
1. Install "Expo Go" app from App Store / Play Store
2. Run `npx expo start`
3. Scan the QR code with your phone

---

## Configuration Required

### Firebase Setup (Required for Production)
1. Create a Firebase project at https://console.firebase.google.com
2. Enable: Authentication (Email/Password + Phone), Firestore, Storage, Cloud Messaging
3. Update `src/config/firebase.ts` with your config:
```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### WhatsApp Notifications
- Works out of the box via deep linking
- No API key needed
- Patient must have WhatsApp installed

### Push Notifications
- Local notifications work immediately
- For remote push: configure FCM in Firebase Console
- Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

---

## Git History

```
0856324 docs: Update Setup Guide v2.0
6ee5b81 fix: Resolve all dependency issues and security vulnerabilities
87ef73b feat: Add theme gallery mockup showing all 5 themes across 4 screens
b47a1fc feat: Multi-theme system with 5 selectable themes and live preview
6459b31 feat: Phase 10 & 11 — Offline sync, live dashboard, and web admin panel
bfb58f7 feat: Phase 9 — Reports dashboard with analytics and export
4276a82 feat: Phase 8 — Push notifications, WhatsApp reminders, and notification center
847106a feat: Phase 7 — Appointment calendar with recurring and multi-location support
8f25ebd feat: Phase 6 — Commission calculator and settlement tracking
a595c5a feat: Phase 5 — Fees master, patient billing, installments, and receipts
4a97d7f feat: Phase 4 — Treatment history with stages, visits, and photos
406cfa3 feat: Phase 3 — Patient registration with photos and detail view
cb12f03 feat: Phase 1 & 2 — App foundation, auth, glassmorphism UI, and location management
e7d22b9 Initial commit
```

---

*Generated by OrthoSync Development Team*
*Built by Dr. Pooja Gangare*
*Developed by Rahul Pandey*
