<div align="center">

# 🦷 OrthoSync

### ✨ Complete Dental Practice Management System ✨

**Built with ❤️ by Dr. Pooja Gangare**
*Orthodontics & Dentofacial Orthopaedics*

[![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo_SDK-55-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-green?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#license)

---

🏥 A powerful, cross-platform dental practice management app designed for doctors who manage patients across **89+ hospitals and clinics** — with treatment tracking, smart billing, commission calculations, appointment scheduling, and a full web admin panel.

[🚀 Quick Start](#-quick-start) · [📖 Documentation](SETUP_GUIDE.md) · [🐛 Report Bug](https://github.com/zxrrcpandey/OrthoSync/issues) · [✨ Request Feature](https://github.com/zxrrcpandey/OrthoSync/issues)

</div>

---

## 📸 Screenshots

> 📷 *Screenshots coming soon — the app features a beautiful **green glassmorphism** UI theme*

```
┌──────────────────────────────────────────────────────────────────────┐
│                        🦷 OrthoSync App                             │
├─────────────┬─────────────┬─────────────┬──────────────────────────┤
│  🔐 Login   │ 📊 Dashboard│ 📅 Calendar │     💰 Billing           │
│             │             │             │                          │
│ Email/Phone │ Real-time   │ Multi-loc   │  Fees, Bills             │
│ OTP Auth    │ Stats       │ Scheduling  │  Installments            │
├─────────────┼─────────────┼─────────────┼──────────────────────────┤
│  👤 Patients│ 🏥 Locations│ 📈 Reports  │     🖥️ Web Panel        │
│             │             │             │                          │
│ Dental      │ Hospital &  │ Revenue     │  Full Admin              │
│ Photos      │ Clinic Mgmt │ Analytics   │  Dashboard               │
└─────────────┴─────────────┴─────────────┴──────────────────────────┘
```

> 💡 **Theme:** Dark green gradient background + frosted glass cards + white text = Premium dental app look

---

## 🌟 Features

OrthoSync is packed with everything a dental practice needs. Click any feature to expand the full details.

### 🔐 Multi-Doctor Registration & Authentication

> Secure, multi-method authentication with admin-verified doctor onboarding.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ Email + Password login
- ✅ Phone + OTP login (6-digit, auto-focus)
- ✅ Doctor registration with admin verification
- ✅ Forgot password flow
- ✅ 3-step doctor setup wizard (Profile → Location → Treatments)
- ✅ Doctor profile management
- ✅ Secure session persistence via Zustand + AsyncStorage

</details>

---

### 👥 Patient Management with Dental Photos

> Complete patient records with 6 categories of dental photography.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ Patient registration with auto-generated IDs (`PAT-0001` format)
- ✅ Personal info: name, age, gender, phone, email, address
- ✅ Medical info: blood group (8 types), medical history, allergies, emergency contact
- ✅ Profile photo capture (camera or gallery)
- ✅ **6 dental photo categories:**
  - 📷 Extraoral Front
  - 📷 Extraoral Side
  - 📷 Intraoral
  - 📷 X-Ray
  - 📷 OPG
  - 📷 Cephalogram
- ✅ Multi-location patient support
- ✅ Patient search by name, ID, or phone
- ✅ Tabbed patient detail view (Overview, Photos, Treatments, Billing)
- ✅ Photo grid with category filters & full-screen viewer

</details>

---

### 🦷 Treatment History & Stage Tracking

> Track every treatment from consultation to completion with a visual timeline.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ **12 default treatments** pre-loaded (English + Hindi names):
  - Metal Braces, Ceramic Braces, Clear Aligners, Retainer
  - Tooth Extraction, Scaling & Polishing, Root Canal
  - Dental Crown, Dental Filling, Dental Implant
  - Teeth Whitening, Denture
- ✅ Treatment stage tracking (Consultation → Bonding → Monthly Adjustments → Debonding → Retainer)
- ✅ Status management: Planned, In Progress, On Hold, Completed, Cancelled
- ✅ Visual stepper/timeline for stage advancement
- ✅ Visit recording per treatment (procedure, notes, photos)
- ✅ Treatment fee and equipment cost tracking
- ✅ Doctor-configurable treatment list in settings

</details>

---

### 💰 Fees Master & Patient Billing

> Comprehensive billing with GST, partial payments, EMI, and shareable receipts.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ **Fees Master:** inline editing of treatment rates & equipment costs
- ✅ Category-wise treatment filtering (8 categories)
- ✅ Profit calculation (fee - equipment cost)
- ✅ Dynamic bill creation with treatment suggestions
- ✅ GST toggle with configurable percentage (default 18%)
- ✅ Payment modes: Cash, UPI
- ✅ Full or partial payment support
- ✅ **EMI/Installment setup:**
  - Configurable number of installments
  - Auto-calculated monthly due dates
  - Editable installment amounts
- ✅ Overdue installment detection
- ✅ Shareable text receipt via Share API
- ✅ Bill status tracking: Pending, Partial, Paid, Overdue
- ✅ Revenue stats on billing overview
- ✅ Indian number format (₹XX,XX,XXX)

</details>

---

### 🤝 Commission Calculator & Settlement

> Smart commission tracking for multi-location practices — a unique feature of OrthoSync.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ Auto-commission calculation per location per month
- ✅ **4 commission models** (see [Commission Models](#-commission-models) below)
- ✅ Configurable: calculated on Total Fee or Fee minus Material Cost
- ✅ Commission Dashboard with month selector (last 6 months)
- ✅ Location-wise commission cards with progress bars
- ✅ Own clinic earnings kept separate (no commission)
- ✅ Settlement recording: Cash, UPI, Bank Transfer
- ✅ Settlement history per location per month
- ✅ Shareable commission report for clinic owners
- ✅ Settlement status: Pending, Partial, Settled
- ✅ Per-patient commission override option

</details>

---

### 📅 Appointment Calendar

> Custom-built calendar with recurring appointments and multi-location support.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ Custom-built month calendar grid (zero external dependencies)
- ✅ Appointment dots per location on calendar days
- ✅ Day selection to view appointments
- ✅ Location filter chips
- ✅ Appointment creation with patient search, date/time, location, treatment linking
- ✅ Quick duration buttons: 15, 30, 45, 60 minutes
- ✅ Appointment statuses: Scheduled, Completed, Missed, Cancelled, Hold
- ✅ Status actions: Complete, Miss, Hold, Cancel, Reschedule
- ✅ Inline rescheduling with new date/time
- ✅ Recurring appointments: Weekly, Bi-weekly, Monthly
- ✅ Recurring preview (shows count to be created)
- ✅ Month navigation (previous/next)

</details>

---

### 🔔 Push Notifications & WhatsApp

> Multi-channel patient communication with smart reminders.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ In-app notification center with filter tabs (All, Reminders, Missed, Payments, Custom)
- ✅ Unread count badge on notification bell
- ✅ Mark as read / Mark all as read
- ✅ Push notifications via `expo-notifications`
- ✅ Auto-schedule reminders: 1 day + 1 hour before appointments
- ✅ **WhatsApp deep linking** with pre-built templates:
  - 📩 Appointment reminder (date, time, location, doctor name)
  - 📩 Missed appointment follow-up
- ✅ Send Notification screen: type selection, patient search, editable messages
- ✅ Push + WhatsApp toggles per notification
- ✅ Bulk auto-generate reminders for tomorrow's appointments
- ✅ Time-ago display (Just now, X min ago, Yesterday, etc.)

</details>

---

### 📊 Reports & Analytics

> Comprehensive business intelligence with shareable reports.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ Period selector: Today, This Week, This Month, This Year, All Time
- ✅ Overview stats: Total Revenue, Total Patients, Appointments, Pending Payments
- ✅ Revenue summary with collection rate and visual bar
- ✅ Location-wise revenue breakdown with proportional bars
- ✅ Treatment-wise revenue breakdown
- ✅ Appointment stats: Total, Completed, Missed, Cancelled, Hold (with %)
- ✅ Patient summary with gender breakdown
- ✅ Commission summary (owed, paid, pending)
- ✅ Shareable comprehensive text report
- ✅ Shareable daily summary
- ✅ Indian number format for all currency (₹XX,XX,XXX)

</details>

---

### 📶 Offline Support

> Full offline capability — never lose data, even without internet.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ Sync service with operation queue (create/update/delete)
- ✅ AsyncStorage-based queue persistence
- ✅ Network status detection via `@react-native-community/netinfo`
- ✅ Auto-sync when back online
- ✅ Retry logic (up to 3 retries per failed operation)
- ✅ `useNetworkStatus` custom hook
- ✅ `OfflineBanner` component (shows offline status + pending changes count)
- ✅ Sync Now button for manual sync
- ✅ Last sync time tracking

</details>

---

### 🖥️ Web Admin Panel

> A full-featured desktop dashboard — same codebase, different experience.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ Platform detection: web → admin panel, mobile → patient-facing app
- ✅ Sidebar navigation (10 sections)
- ✅ Dashboard: stat cards, today's appointments, recent activity
- ✅ Patients table with search
- ✅ Appointments table with date filter
- ✅ Billing table with status filters and summary stats
- ✅ Locations grid with cards
- ✅ Treatments table with fees and stages
- ✅ Commission records table
- ✅ Reports section with analytics
- ✅ Notifications list & Settings section
- ✅ Web-optimized glassmorphism (`backdropFilter`, `boxShadow`)
- ✅ Responsive sidebar + main content layout

</details>

---

### 🌐 Multi-Language (English + Hindi)

> Full internationalization support for Hindi-speaking regions.

<details>
<summary><b>▶ View all sub-features</b></summary>
<br/>

- ✅ Complete English translations
- ✅ Complete Hindi (हिन्दी) translations
- ✅ Treatment names in both languages
- ✅ Powered by `i18next` + `react-i18next`
- ✅ Language toggle in settings
- ✅ All UI text, labels, and messages translated

</details>

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| 📱 Framework | React Native | 0.83.2 | Cross-platform mobile development |
| 🧰 Platform | Expo SDK | 55 | Managed workflow, OTA updates |
| 📝 Language | TypeScript | 5.9 | Type safety & developer experience |
| 🗃️ State | Zustand | 5.0 | Lightweight stores with persistence |
| 💾 Storage | AsyncStorage | 3.0 | Local data & offline support |
| 🧭 Navigation | React Navigation | v7 | Stack + Tab navigation |
| 🎨 UI Effects | expo-blur, expo-linear-gradient | — | Glassmorphism design system |
| 📷 Camera | expo-image-picker | — | Photo capture & gallery access |
| 🔔 Notifications | expo-notifications | — | Push notification support |
| 🎭 Icons | @expo/vector-icons (Ionicons) | — | Complete icon system |
| 🌐 i18n | i18next + react-i18next | — | English + Hindi translations |
| 📶 Network | @react-native-community/netinfo | — | Offline detection & sync |
| ☁️ Backend | Firebase | — | Auth, Firestore, Storage, FCM |

---

## 📈 Project Stats

<div align="center">

| 📁 Source Files | 📝 Lines of Code | 🏗️ Build Phases | 🗃️ Zustand Stores |
|:---------------:|:-----------------:|:----------------:|:------------------:|
| **74** | **~27,746** | **11** | **7** |

| 🦷 Default Treatments | 📱 Screens | 🌐 Languages | 🏥 Target Scale |
|:----------------------:|:----------:|:------------:|:---------------:|
| **12** | **30+** | **2** (EN + HI) | **89+ clinics** |

</div>

---

## 🚀 Quick Start

Get OrthoSync running in under 5 minutes:

```bash
# 1️⃣ Clone the repository
git clone https://github.com/zxrrcpandey/OrthoSync.git

# 2️⃣ Navigate to the project
cd OrthoSync

# 3️⃣ Install dependencies
npm install

# 4️⃣ Start the development server
npx expo start
```

Then choose your platform:

| Platform | Command | Requirement |
|:---------|:--------|:------------|
| 🍎 iOS | Press `i` or `npx expo start --ios` | macOS + Xcode |
| 🤖 Android | Press `a` or `npx expo start --android` | Android Studio |
| 🌐 Web | Press `w` or `npx expo start --web` | Any modern browser |
| 📱 Physical Device | Scan QR code | [Expo Go](https://expo.dev/client) app |

> **Note:** Requires Node.js v20+ and npm. See the full [Setup Guide](SETUP_GUIDE.md) for detailed first-time instructions.

---

## 📂 Project Structure

```
OrthoSync/
├── App.tsx                          # 🚀 Entry point
├── src/
│   ├── components/ui/               # 🎨 8 reusable glass UI components
│   ├── screens/
│   │   ├── auth/                    # 🔐 4 auth screens
│   │   ├── doctor/                  # 👨‍⚕️ 2 doctor screens
│   │   ├── main/                    # 📱 5 tab screens (Dashboard, Patients, Calendar, Billing, More)
│   │   ├── patient/                 # 👤 2 patient screens
│   │   ├── location/                # 🏥 3 location screens
│   │   ├── treatment/               # 🦷 3 treatment screens
│   │   ├── billing/                 # 💰 6 billing & commission screens
│   │   ├── calendar/                # 📅 3 calendar screens
│   │   ├── notification/            # 🔔 2 notification screens
│   │   ├── reports/                 # 📊 1 reports screen
│   │   └── web/                     # 🖥️ 1 web admin panel
│   ├── navigation/                  # 🧭 8 navigation files
│   ├── store/                       # 🗃️ 7 Zustand stores
│   ├── services/                    # ⚙️ 2 services (notifications, sync)
│   ├── hooks/                       # 🪝 1 custom hook (useNetworkStatus)
│   ├── theme/                       # 🎨 Theme system (colors, spacing)
│   ├── i18n/                        # 🌐 Translations (en.ts, hi.ts)
│   ├── types/                       # 📝 TypeScript definitions
│   └── config/                      # ⚙️ Firebase configuration
├── package.json
├── tsconfig.json
└── app.json
```

---

## 🧩 Modules Overview

| # | Module | Files | Description |
|:-:|:-------|:-----:|:------------|
| 1 | 🔐 Authentication | 4 | Login, register, OTP, forgot password |
| 2 | 👨‍⚕️ Doctor Profile | 2 | Profile management & 3-step setup wizard |
| 3 | 📱 Main Tabs | 5 | Dashboard, patients list, calendar, billing overview, more |
| 4 | 👤 Patient Management | 2 | Add patient with photos, detailed patient view |
| 5 | 🏥 Location Management | 3 | Add/edit/list locations with commission models |
| 6 | 🦷 Treatment Tracking | 3 | Add treatment, detail with stages, visit recording |
| 7 | 💰 Billing & Fees | 6 | Fees master, create bill, bill detail, commissions, settlements |
| 8 | 📅 Calendar | 3 | Calendar view, add appointment, appointment detail |
| 9 | 🔔 Notifications | 2 | Notification center, send notification |
| 10 | 📊 Reports | 1 | Analytics dashboard with shareable reports |
| 11 | 🖥️ Web Admin | 1 | Full admin panel for desktop browsers |

---

## 🤝 Commission Models

One of OrthoSync's standout features is its flexible commission system for doctors practicing at multiple clinics. Four commission models cover every real-world arrangement:

| Model | How It Works | Example |
|:------|:-------------|:--------|
| 📊 **Percentage** | Clinic owner gets a % of each bill | 30% of ₹10,000 = ₹3,000 to clinic |
| 👤 **Fixed per Patient** | Fixed fee for each new patient treated | ₹500 per patient × 20 patients = ₹10,000 |
| 🔄 **Fixed per Visit** | Fixed fee for each patient visit | ₹200 per visit × 50 visits = ₹10,000 |
| 🏠 **Monthly Rent** | Fixed monthly rent to the clinic | ₹25,000/month regardless of patients |
| ❌ **None** | Own clinic — no commission owed | Full revenue retained |

**Additional options:**
- 🔧 Commission calculated on **Total Fee** or **Fee minus Material Cost**
- 📅 Settlement frequency: **Weekly**, **Monthly**, or **Custom**
- 💳 Settlement via: **Cash**, **UPI**, or **Bank Transfer**
- 📤 Shareable commission reports for clinic owners

---

## 💳 Subscription Plans

| Feature | 🆓 Free | ⭐ Basic | 🚀 Pro |
|:--------|:-------:|:-------:|:------:|
| Patients | Up to 50 | Up to 500 | Unlimited |
| Photos per patient | 5 | 20 | Unlimited |
| Locations | 3 | 10 | Unlimited |
| Reports | Basic | Full | Full + Export |
| Web Admin Panel | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

> 📝 *Subscription system is defined in the data model and will be enforced in a future release.*

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💻 **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. 🚀 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 📬 **Open** a Pull Request

### Code Style

- 🔷 TypeScript strict mode
- 📁 Feature-based folder structure
- 🎨 Green glassmorphism design language
- 🗃️ Zustand for all state management
- 🌐 All user-facing strings must be in `i18n/en.ts` and `i18n/hi.ts`

---

## 📚 Documentation

| Document | Description |
|:---------|:------------|
| 📖 [Setup Guide](SETUP_GUIDE.md) | Complete beginner-friendly setup instructions — from installing Homebrew to deploying to app stores |
| 📋 [Project Documentation](PROJECT_DOCUMENTATION.md) | Full technical docs — features, architecture, build phases, known issues, and solutions |

---

## 🗺️ Roadmap

### ✅ Completed

- [x] Multi-doctor authentication (Email + Phone + OTP)
- [x] Location management with commission models
- [x] Patient registration with 6 dental photo categories
- [x] Treatment history with stage tracking
- [x] Fees master & patient billing with EMI
- [x] Commission calculator & settlement tracking
- [x] Appointment calendar with recurring support
- [x] Push notifications & WhatsApp integration
- [x] Reports & analytics dashboard
- [x] Offline sync with auto-retry
- [x] Web admin panel
- [x] English + Hindi internationalization
- [x] Green glassmorphism UI theme

### 🔮 Planned

- [ ] 🔥 Connect Firebase backend (Auth, Firestore, Storage, FCM)
- [ ] 📅 Native date/time pickers
- [ ] 🎨 App icon & splash screen branding
- [ ] 💳 Subscription paywall (RevenueCat / Razorpay)
- [ ] 📄 PDF receipt generation
- [ ] 📡 Remote push notifications via FCM
- [ ] 💬 SMS integration (Twilio / MSG91)
- [ ] 🧪 Unit & integration tests (Jest + RNTL)
- [ ] 📱 App Store & Play Store submission
- [ ] 👨‍⚕️ Doctor verification backend
- [ ] 💾 Data backup & export (JSON/CSV)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Dr. Pooja Gangare

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Credits

<div align="center">

**Built by [Dr. Pooja Gangare](https://github.com/zxrrcpandey)**
*Orthodontics & Dentofacial Orthopaedics*

🤖 Powered by **Claude Opus 4.6** (1M context) by Anthropic

---

### Technologies That Make OrthoSync Possible

[<img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />](https://reactnative.dev/)
[<img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" />](https://expo.dev/)
[<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />](https://www.typescriptlang.org/)
[<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />](https://firebase.google.com/)
[<img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" />](https://zustand-demo.pmnd.rs/)

</div>

---

<div align="center">

### ⭐ If OrthoSync helps you, give it a star!

**It motivates us to keep building.**

[![Star this repo](https://img.shields.io/github/stars/zxrrcpandey/OrthoSync?style=social)](https://github.com/zxrrcpandey/OrthoSync)

---

📧 **Contact:** [Open an Issue](https://github.com/zxrrcpandey/OrthoSync/issues) · 💬 **Discussions:** [GitHub Discussions](https://github.com/zxrrcpandey/OrthoSync/discussions)

---

<sub>Made in 🇮🇳 India | © 2026 Dr. Pooja Gangare | All Rights Reserved</sub>

</div>
