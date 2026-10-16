# Privacy Policy — SERA

**Effective Date:** October 16, 2026  
**Application:** SERA — Expense Tracker (*Spending & Expense Record App*)  
**Package Name:** `dev.sakshamtale.sera`  
**Developer:** Saksham Tale  
**Contact:** Saksham.tale02dev@gmail.com  

---

## 1. Introduction

**SERA** (“the App”, “we”, “our”) is a personal finance management application developed by Saksham Tale for Android devices. SERA is designed to help individuals record daily expenses, track income, balance accounts, calculate net worth, establish budgets, monitor savings goals, manage recurring subscriptions, and analyze monthly cash flows.

SERA is engineered from the ground up as an **offline-first, privacy-respecting tool**. We believe your financial data belongs exclusively to you. All core functionality operates locally on your physical device. The App does not require user account registration, cloud sign-in, or internet connectivity to manage your financial ledger.

This Privacy Policy explains what data SERA handles, how that data is stored and processed on your device, what permissions the App requests, and how you retain total control over your records.

---

## 2. Information Handled by the App

Depending on which features you use, SERA stores and organizes the following user-entered data locally on your device:

- **Financial Transactions:** Amounts, currency codes (`₹`, `$`, `€`, `£`), transaction types (expense, income, inter-account transfer), category tags, merchant or payee names, transaction dates, timestamps, and optional user notes.
- **Financial Accounts & Net Worth:** Account labels, account types (Bank, Cash, Credit Card, Wallet, Savings, Investment), opening and current balances, financial institution names, and optional last-4-digit account masks (e.g., `••4821`).
- **Budgets & Spending Limits:** Monthly spending targets, per-category budget limits, alert threshold indicators, and safe daily spend velocity calculations.
- **Savings Goals:** Target savings amounts, accumulated savings balances, target achievement dates, planned monthly contributions, and deposit contribution history.
- **Recurring Subscriptions:** Subscription names, billing amounts, recurrence frequencies (monthly or yearly), next renewal dates, and payment history.
- **Receipt Attachments:** Physical receipt photos captured via the device camera or selected from the device photo gallery.
- **User Preferences & Security Configurations:** Display name, profile avatar photo (stored locally), dark/light theme preference, active currency preference, 4-digit security PIN, biometric unlock preference, Privacy Mode state, and scheduled daily reminder times.

---

## 3. Offline Architecture & Zero Data Collection

SERA is strictly an **offline-first application**:

- **No Remote Servers:** The developer does not operate, host, or communicate with any cloud server or database to store, transmit, or process your financial records.
- **No Account Registration:** You do not need an email address, telephone number, password, or third-party login (e.g., Google or Facebook) to use SERA.
- **No Third-Party Analytics:** SERA contains zero telemetry trackers, analytics SDKs (such as Firebase Analytics, Google Analytics, Mixpanel, or Adjust), and zero crash-reporting frameworks that upload device identifiers or crash logs to third parties.
- **No Advertisements:** SERA does not include advertising SDKs, ad networks, or tracking pixels. We do not profile your financial behavior or monetize your personal data.

---

## 4. Smart Text Parser (No Automatic SMS Inbox Access)

SERA features a **Smart Text Parser (Smart Expense Auto-Fill)** to streamline manual expense entry:

- **On-Demand Manual Input:** The Smart Text Parser only processes text that **you explicitly paste or type** into the input field (such as copying a bank SMS alert, an email receipt, or typing quick notes like *"Dinner 420"*).
- **No Background SMS Access:** SERA does **not** read your SMS inbox, does **not** intercept incoming text messages, and **does not declare or request the `READ_SMS` or `RECEIVE_SMS` permissions**.
- **100% Local Pattern Matching:** All text parsing is executed entirely on your device using deterministic, local regular expression patterns. Your pasted text is never transmitted over any network.

---

## 5. Device Permissions & System Capabilities

SERA requests only the minimum Android permissions necessary to provide its local utility features. You can review or revoke these permissions at any time via Android Settings:

| Permission | Android Identifier | Purpose in SERA |
| :--- | :--- | :--- |
| **Notifications** | `android.permission.POST_NOTIFICATIONS` | Used strictly to deliver local scheduled reminders (e.g., daily evening notification to log expenses) and local budget overrun warning alerts. No remote push notifications or cloud messaging services are used. |
| **Camera** | `android.permission.CAMERA` | Used optionally when you choose to photograph a physical paper receipt within the Add Transaction screen. Captured images are stored strictly in private device storage. |
| **Biometric Hardware** | `android.permission.USE_BIOMETRIC` | Used to trigger Android's native `BiometricPrompt` (fingerprint or face unlock). Authentication is performed entirely by your device’s secure hardware (Trusted Execution Environment / Keystore). SERA never accesses, handles, or stores your biometric templates. |
| **Exact Alarms** | `android.permission.SCHEDULE_EXACT_ALARM` | Used by the native Android `AlarmManager` to trigger your scheduled daily expense reminder at the exact time you configured in Settings. |
| **Boot Completed** | `android.permission.RECEIVE_BOOT_COMPLETED` | Used to automatically re-register your scheduled daily reminder alarm after your device restarts. |
| **Vibration** | `android.permission.VIBRATE` | Used to provide subtle tactile haptic feedback when pressing numeric keypad keys. |
| **Internet** | `android.permission.INTERNET` | Standard network permission included with the React Native framework runtime. SERA does not use internet connectivity for core financial logging, does not sync data to any cloud service, and functions completely offline. |

SERA does **not** request access to your Contacts, Device Location, Microphone, Call Logs, or SMS Inbox.

---

## 6. Home Screen Widgets & OS Integrations

SERA includes 5 native Android home screen widgets:
1. **Quick Action Widget:** Instant 1-tap shortcuts to open the expense or income logging screen.
2. **Budget Progress Widget:** Real-time progress bar showing monthly spend and remaining budget.
3. **Net Worth Widget:** Glanceable consolidated liquid balance across all your accounts.
4. **Savings Goal Widget:** Target progress meter for your primary active savings goal.
5. **Dashboard Widget:** Multi-metric overview showing net worth, daily spend, active goal, and recent transactions.

**How Widget Data is Handled:**  
To render information on your home screen, the App writes minimal summary metrics to Android's local `SharedPreferences` storage on your device. This data never leaves your device. Because home screen widgets may be visible to anyone viewing an unlocked screen or lock screen (depending on your Android configuration), you are responsible for adjusting widget visibility according to your privacy comfort level.

SERA also supports Android App Launcher Shortcuts and deep links (`sera://`) for fast navigation.

---

## 7. Data Sharing & Third-Party Disclosure

- **Zero Sale of Data:** The developer does not sell, rent, monetize, or trade your personal or financial information to data brokers, advertisers, or third parties under any circumstances.
- **Zero Third-Party SDK Data Transmission:** The App does not integrate third-party SDKs that collect or broadcast device identifiers, advertising IDs, or financial metrics.
- **User-Initiated Sharing:** When you intentionally choose to share a backup file, receipt photo, or export through Android's system share sheet (e.g., saving to Google Drive or sending via email), that data is handled directly by the destination application you selected according to their respective privacy terms.

---

## 8. Exporting, Backing Up, and Data Portability

SERA provides full data portability through its built-in Backup & Restore tool:

- **JSON Backup Export:** You can export your entire financial ledger—including all accounts, categories, transactions, budgets, goals, subscriptions, and app preferences—into a structured, human-readable JSON backup file.
- **JSON Backup Import:** You can restore a previously exported JSON backup file on any compatible device running SERA.
- **Storage Security:** Exported files are written to the local storage location or application you specify. Once exported, you are responsible for keeping these backup files secure.

---

## 9. Security & Access Protection

SERA incorporates multiple layers of local security:

- **Biometric Authentication:** Hardware-backed fingerprint and facial recognition via Android `BiometricPrompt`.
- **4-Digit Numeric PIN Lock:** Built-in passcode lock screen that blocks access to all views until authenticated.
- **Automatic Background Lock:** Enforces the lock screen immediately whenever the app transitions away from the active foreground and is reopened.
- **Privacy Mode (Balance Masking):** A dedicated 1-tap global privacy toggle that obscures all account balances, ledger amounts, and financial metrics with `••••••` across all screens, allowing safe usage in public spaces.

*Security Notice:* While SERA implements local access controls, overall security depends on your device's operating-system security, device passcode, and how you manage exported backup files.

---

## 10. Data Retention, Deletion, and Local Reset

- **Retention Period:** All financial records, receipts, and settings remain stored on your physical device until you choose to delete them.
- **In-App Application Reset:** SERA includes a **"Reset Application / Clear All Data"** option in Settings. Tapping this option flushes all local database tables and returns the app to its fresh initial seed state immediately.
- **Device-Level Deletion:** You can permanently delete all records at any time by selecting "Clear Storage / Clear Data" for SERA in Android System Settings or by uninstalling the application.
- **No Remote Copies:** Because the developer maintains no cloud servers or remote databases, we cannot access, view, or remotely restore or delete your data once cleared from your device.

---

## 11. Children's Privacy

SERA is a general-purpose personal financial utility and is not directed at or designed for children under the age of 13 (or under the applicable legal age in your jurisdiction). SERA does not knowingly collect or solicit personal data from children.

---

## 12. Open-Source Software & Transparency

SERA may be published as open-source software. Public availability of the source code ensures technical transparency and allows anyone to verify that the application operates strictly offline without hidden background telemetry or remote tracking.

---

## 13. Changes to This Privacy Policy

This Privacy Policy may be updated periodically to reflect new features, improvements, or regulatory compliance requirements. Any revisions will be published with an updated **Effective Date** at:  
[https://sera-privacy-policy.vercel.app](https://sera-privacy-policy.vercel.app) *(or the designated production privacy URL)*.

We encourage users to review this policy periodically.

---

## 14. Contact Information

If you have any questions, concerns, or inquiries regarding this Privacy Policy or SERA's privacy practices, please contact the developer directly:

- **Developer:** Saksham Tale
- **Application:** SERA — Expense Tracker (*Spending & Expense Record App*)
- **Application ID:** `dev.sakshamtale.sera`
- **Email:** [Saksham.tale02dev@gmail.com](mailto:Saksham.tale02dev@gmail.com)
