# SERA — Expense Tracker

<p align="center">
  <strong>Offline-first, cyber-technical personal financial architecture built on React Native.</strong>
</p>

<p align="center">
  <img src="src/assets/sera_logo.png" alt="SERA Emblem" width="120" />
</p>

<p align="center">
  <a href="#core-features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#design-system">Design System</a> •
  <a href="#security--privacy">Security & Privacy</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Documentation</a>
</p>

---

## Overview

**SERA** (*Expense Tracker*) is a precision personal finance application designed for intentional money management. Built with a high-contrast editorial and cyber-technical aesthetic, SERA operates **100% offline on-device**—eliminating external cloud databases, analytics tracking, and third-party data collection.

---

## Core Features

- ⚡ **Zero-Latency Expense Logging**: Tactile on-screen numeric keypad with instant haptic feedback, category chips, and receipt photo attachments.
- 🧠 **Smart Natural Language Parser**: Auto-parses pasted transaction SMS text and freeform phrases to extract amount, type (Debit/Credit/Transfer), merchant, category, and account masks.
- 📊 **Dynamic Monthly Budget Velocity**: Real-time burn-rate calculation, daily safe discretionary spend pacing (`safePace = remaining / daysLeft`), and category overrun alerts.
- 🎯 **Target Savings Goals**: Visual milestone tracking with completion projections and deposit logging.
- 🔄 **Subscription Commitments**: Recurring billing tracker with monthly burn and renewal countdowns.
- 🏦 **Multi-Account Net Worth**: Consolidated overview across banks, credit cards, savings, and cash wallets with instant inter-account transfers.
- 📲 **5 Native Android Home Screen Widgets**:
  1. *Quick Action Widget* (1-tap `+ Expense` and `+ Income`)
  2. *Budget Velocity Widget* (Monthly progress & daily safe spend)
  3. *Net Worth Widget* (Consolidated balances)
  4. *Active Goal Widget* (Savings target progress)
  5. *Command Dashboard Widget* (Multi-metric glance)
- 🔔 **Native Android Notification Scheduler**: High-priority budget warnings and scheduled evening reminder alarms.

---

## Security & Privacy

- **100% On-Device Sovereignty**: All financial logs, categories, and account details remain on the user's device in persistent storage.
- **Biometric Hardware Authorization**: Android `BiometricPrompt` supporting fingerprint and face unlock.
- **4-Digit PIN Security Gate**: Full-screen gate blocking unauthorized access on cold launch or app resume.
- **Automated Lifecycle Auto-Lock**: Enforces instant screen lock whenever the app moves to the background.
- **Global Privacy Mode**: Masks account balances and financial figures with dots (`••••••`) across the entire user interface.

---

## Design System

- **Chromatic Palette**:
  - Obsidian Midnight (`#090E14`)
  - Industrial Dark Slate (`#111822`)
  - Titanium Bone (`#E4DFD7`)
  - Vermilion Crimson (`#EB3B2E`)
  - Mint Positive (`#34D399`)
- **Typography Scale**: Dual font stacks using **Inter** for clean editorial structural headers and **JetBrains Mono** with tabular numeral alignment (`tabular-nums`) for all monetary figures and calculations.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | React Native `0.87.1` (Hermes Engine, New Architecture enabled) |
| **Language** | TypeScript `6.0.3` |
| **State Management** | Zustand `5.0.15` (7 isolated domain stores) |
| **Persistence** | `@react-native-async-storage/async-storage` |
| **Navigation** | React Navigation `v7` (Native Stack & Bottom Tabs) |
| **Native Integrations** | Android Biometrics, App Widgets, AlarmManager, Exact Alarms, Deep Links (`sera://`) |

---

## Getting Started

### Prerequisites
- Node.js `>= 22.11.0`
- OpenJDK 17
- Android SDK (API 34/35)

### Installation
```bash
# Clone the repository
git clone https://github.com/Saksham-cmd-tech/SERA.git
cd SERA

# Install dependencies
npm install

# Run on connected Android device or emulator
npm run android
```

---

## Documentation

For an exhaustive, code-level technical specification detailing every database model, Zustand store, screen route, and native Kotlin module, see [`info.md`](info.md).

---

## License

Private & Proprietary. All rights reserved.
