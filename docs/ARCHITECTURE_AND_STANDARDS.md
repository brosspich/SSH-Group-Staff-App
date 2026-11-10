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
            └── login/          # Auth login form & mutations
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
