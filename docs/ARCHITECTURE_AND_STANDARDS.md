# System Architecture & Development Standards

This document establishes the architectural standards, clean code principles, folder conventions, and troubleshooting guidelines for the **SSH Group Staff App**.

---

## 1. Clean Code Principles (SOLID & DRY)

### Single Responsibility Principle (SRP)

- Each component, hook, and service is responsible for exactly one capability.
- Form inputs, pickers, and submission states are isolated in custom hooks (e.g. [useRequestAttendanceForm.ts](file:///d:/Code/SSH-Group-Staff-App/app/frontend/src/features/home/_hooks/useRequestAttendanceForm.ts)), leaving presentation components (e.g. [RequestAttendanceModal.tsx](file:///d:/Code/SSH-Group-Staff-App/app/frontend/src/features/home/_components/RequestAttendanceModal.tsx)) focused purely on JSX layout.

### Don't Repeat Yourself (DRY)

Duplicate UI layouts and handlers across modals have been extracted into shared, reusable components:

1. [ModalFooterButtons.tsx](file:///d:/Code/SSH-Group-Staff-App/app/frontend/src/features/home/_components/ModalFooterButtons.tsx): Pinned footer layout matching both `RequestAttendanceModal` and `EditAttendanceModal` (Cancel with `flex: 1` on left, Submit with `flex: 1.5` on right).
2. [ProofImageUpload.tsx](file:///d:/Code/SSH-Group-Staff-App/app/frontend/src/features/home/_components/ProofImageUpload.tsx): Unified upload box with dashed border, image preview, "Change Photo", and "Remove Photo" actions.
3. [RequestConfirmModal.tsx](file:///d:/Code/SSH-Group-Staff-App/app/frontend/src/features/home/_components/RequestConfirmModal.tsx): Standardized verification dialog before dispatching requests.

---

## 2. Feature-Based Architecture

The codebase follows domain-driven, feature-based modular packaging:

```
app/
├── backend/
│   └── src/
│       ├── core/               # Domain interfaces, AppError, logger
│       ├── infrastructure/     # Database (Prisma, D1), Storage (R2), Events
│       └── features/           # Domain features
│           ├── auth/           # Login, JWT issuing, password hashing
│           ├── attendance-security/ # Scanning, Geofencing, Anti-spoofing
│           ├── attendance-requests/ # Sequential ID, R2 uploads, Telegram
│           ├── reports/        # Server-side aggregations, summary math
│           ├── devices/        # Hardware session management
│           ├── server-groups/  # Server cluster & member management
│           ├── keys/           # Server SSH/Access keys management
│           ├── users/          # Staff CRUD, systemId auto-generation
│           └── audit-logs/     # Audit repository & querying
└── frontend/
    └── src/
        ├── shared/             # Shared constants, styles, services, widgets
        └── features/           # Feature domains
            ├── home/           # Dashboard, Scanner, Quick Actions
            ├── attendance/     # Attendance calendar, daily logs
            ├── report/         # Reports hub
            ├── report-current-staff/    # Current staff daily/weekly/monthly/annual
            ├── report-individual-staff/ # Staff selector + report preview
            ├── report-all-staff/        # Company-wide reports
            ├── devices/        # Device session manager
            ├── setting/        # Profile, settings
            ├── login/          # Auth login form & mutations
            ├── language/       # i18n store, useLanguage hook, Khmer/English locales
            ├── create-account-staff/    # Admin staff creation with Auto System ID
            ├── change-info-account-staff/ # Admin staff info editor & role switcher
            ├── server-groups/  # Server cluster management UI
            └── keys/           # Access key upload & list UI
```

Each feature folder is self-contained with:

- `_components/`: Components scoped specifically to that feature.
- `_hooks/`: Custom state and mutation hooks.
- `_utils/`: Pure helper functions.
- `_types/`: TypeScript definitions.

---

## 3. The 70% Backend / 30% Frontend Rule

To guarantee high mobile performance, minimal battery consumption, and rock-solid consistency across iOS and Android:

- **Backend (70%)**: All business calculations, date filtering, geofencing validations, aggregations, database persistence, and external notifications (Telegram, Cloudflare R2) occur on the server.
- **Frontend (30%)**: The mobile client remains a responsive presentation layer responsible for camera feeds, haptics, rendering charts/cards, and user input capture.

---

## 4. Local Development & Troubleshooting Guide

### Issue: "Cannot connect to server. Please check your network or server status."

```
WARN  Exception while fetching attendance config from Backend API: [ApiError: Cannot connect to server. Please check your network or server status.]
```

#### Causes & Fixes:

1. **Backend Server is Stopped**:
   Open a terminal and run the backend dev server:

   ```powershell
   cd d:\Code\SSH-Group-Staff-App\app\backend
   npm run dev
   ```

   Ensure it logs:

   ```
   🚀 SSH Group Backend API server is running on http://0.0.0.0:4000 in [development] mode.
   ```

2. **Machine IP Address Mismatch**:
   When switching Wi-Fi networks, your computer's local IP address changes.
   - Run `ipconfig` in PowerShell.
   - Find your **IPv4 Address** (e.g. `172.20.240.1`).
   - Check [app/frontend/.env.local](file:///d:/Code/SSH-Group-Staff-App/app/frontend/.env.local):
     ```ini
     EXPO_PUBLIC_API_URL=http://172.20.240.1:4000
     ```
   - Restart Expo bundler:
     ```powershell
     cd app/frontend
     npm run start -- -c
     ```

---

## 5. Internationalization & Multi-Language (i18n)

The mobile application features a comprehensive bilingual localization architecture supporting **Khmer (`km`)** and **English (`en`)**:

- **Custom Hook**: `useLanguage()` from [app/frontend/src/features/language/hooks/useLanguage.ts](file:///d:/Code/SSH-Group-Staff-App/app/frontend/src/features/language/hooks/useLanguage.ts) provides `{ language, t, setLanguage }`.
- **Translations Dictionary**:
  - [km.ts](file:///d:/Code/SSH-Group-Staff-App/app/frontend/src/features/language/i18n/locales/km.ts): Complete Khmer translation with native typography (`KohSantepheap`, `KantumruyPro`, `Hanuman`).
  - [en.ts](file:///d:/Code/SSH-Group-Staff-App/app/frontend/src/features/language/i18n/locales/en.ts): English translation dictionary.
- **Persistence**: User language preference is automatically saved to device storage via `@app_language` key in `AsyncStorage`.
- **Usage Rule**: Hardcoded text in user-facing components must be replaced with `t("section.key")` to ensure full localization across screens and modals.

---

## 6. System ID & Username Scoping Conventions

1. **System ID Format**:
   - Every staff member is uniquely identified by `system_id`:
     `{companyId}-{staffId}` (e.g., `system-0001-0022`, `system-0002-0001`).
   - The admin UI auto-generates this format dynamically based on the current branch and entered staff ID.

2. **Per-System Username Uniqueness**:
   - Usernames are unique **per system/branch**, not globally.
   - For example, `system-0001` can have username `manager`, and `system-0002` can also have username `manager`.
   - The backend checks `prisma.user.findFirst({ where: { username, details: { companyId } } })` before creating or updating any user.
