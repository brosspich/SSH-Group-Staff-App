# SSH Group Staff (Full Stack Mobile App)

An enterprise cross-platform mobile application and backend system built with **React Native (Expo SDK 57)**, **Node.js (Express & Prisma ORM)**, **Cloudflare D1 (Distributed SQLite Database)**, and **Cloudflare R2** for encrypted proof photo storage — with zero Docker requirement.

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_57-blue.svg?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg?logo=node.js)](https://nodejs.org)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.20-2D3748.svg?logo=prisma)](https://www.prisma.io)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-SQLite-F38020.svg?logo=cloudflare)](https://developers.cloudflare.com/d1/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-S3_Compatible-F38020.svg?logo=cloudflare)](https://developers.cloudflare.com/r2/)

---

## 🏛️ Architecture Overview

```
+----------------------------------------------------------------------------------------------------+
|                               MOBILE APP (React Native / Expo SDK 57)                              |
+-------------------------------------------------------+--------------------------------------------+
| Native Mobile Platforms (iOS & Android)               | Core Client Architecture                   |
| * Camera & 0ms Ultra-Fast QR Scanner                  | * Expo Router (File-Based Navigation)      |
| * Real-time Hardware Geolocation & Haversine Geofence | * State: Zustand + TanStack Query (v5)     |
| * Anti-Mock GPS & Virtual VPN Adapter Detection       | * API: Axios Client + Dynamic Host IP      |
| * Proof Photo Capture & Base64 Compression            | * Storage: AsyncStorage                    |
+-------------------------------------------------------+--------------------------------------------+
                                               |
                          REST API HTTP/JSON   |   Port: 4000
                                               v
+----------------------------------------------------------------------------------------------------+
|                                BACKEND (Feature-Based Modular API Server)                          |
+--------------------+---------------------+--------------------+------------------------------------+
| Auth & Device      | Attendance Security | Attendance Request | Reports Engine                     |
| Sessions           | Engine (Geofence,   | Service (Photo,    | (Daily, Weekly,                    |
| (Multi-Role, JWT)  | Anti-Mock GPS, VPN) | R2 Upload, States) | Monthly, Annual)                   |
+--------------------+---------------------+--------------------+------------------------------------+
                               |                                |
                               v                                v
+---------------------------------------------+   +--------------------------------------------------+
|          DATABASE & STORAGE LAYER           |   |            EXTERNAL NOTIFICATIONS                |
+---------------------------------------------+   +--------------------------------------------------+
| * Local SQLite (Prisma ORM dev.db)          |   | * Telegram Bot API (Instant Scan Alerts)         |
| * Cloudflare D1 (Global Edge SQLite)        |   | * Native Multipart sendPhoto Proof Delivery      |
| * Cloudflare R2 (S3-Compatible Object Store)|   | * Dynamic Bot & Chat ID Routing per Branch       |
+---------------------------------------------+   +--------------------------------------------------+
```

---

## 📁 Project Structure

```
SSH-Group-Staff-App/
├── .vscode/
│   ├── settings.json                   # VS Code formatting & TypeScript preferences
│   └── extensions.json                 # Recommended extensions (Prisma, Expo, ESLint)
│
├── app/
│   ├── backend/                        # 🚀 BACKEND (Node.js, Express, Prisma, Cloudflare D1 & R2)
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # Prisma SQLite Database Schema (Models, Relations)
│   │   │   └── migrations/             # Local database migration history
│   │   ├── scripts/
│   │   │   ├── sync_user_to_d1.js      # Bi-directional sync: Local User -> Cloudflare D1
│   │   │   ├── sync_user_to_local.js   # Bi-directional sync: Cloudflare D1 User -> Local
│   │   │   ├── sync_company_to_d1.js   # Bi-directional sync: Local Company -> Cloudflare D1
│   │   │   ├── sync_company_to_local.js# Bi-directional sync: Cloudflare D1 Company -> Local
│   │   │   └── sync_subscription_to_d1.js # Sync Subscription -> Cloudflare D1
│   │   ├── src/
│   │   │   ├── core/                   # Shared errors, middleware, constants, and utilities
│   │   │   ├── features/
│   │   │   │   ├── attendance-requests/# Leave/Missing scan requests, R2 uploads & Telegram alerts
│   │   │   │   ├── attendance-security/# 0ms QR verification, Haversine geofence & anti-spoofing
│   │   │   │   ├── audit-logs/         # Security & domain event logger with Telegram alerts
│   │   │   │   ├── auth/               # Multi-role authentication & JWT token generation
│   │   │   │   ├── company/            # Branch profiles, geofence coords, work hours & bot tokens
│   │   │   │   ├── d1/                 # Cloudflare D1 query relay & proxy routes
│   │   │   │   ├── devices/            # Hardware binding, session termination & anti-sharing
│   │   │   │   ├── keys/               # Server SSH/Access keys management
│   │   │   │   ├── reports/            # Daily, Weekly, Monthly & Annual attendance aggregations
│   │   │   │   ├── server-groups/      # Server clusters, members & permissions
│   │   │   │   ├── subscription/       # Branch validity, plan evaluation & D1 realtime sync
│   │   │   │   ├── system-config/      # Remote dynamic configuration & support channels
│   │   │   │   └── users/              # Staff CRUD, systemId auto-generation
│   │   │   ├── infrastructure/
│   │   │   │   ├── database/
│   │   │   │   │   ├── d1Client.ts     # Cloudflare D1 REST client (query, execute, batch)
│   │   │   │   │   └── prisma.ts       # Prisma Client singleton
│   │   │   │   └── storage/
│   │   │   │       └── r2.service.ts   # Cloudflare R2 (S3 SDK) file upload & storage service
│   │   │   ├── routes.ts               # Central feature-based API router
│   │   │   └── server.ts               # Express application entry point (Port 4000)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── frontend/                       # 📱 FRONTEND (React Native / Expo SDK 57)
│       ├── assets/                     # Graphic assets, branding, and icons
│       ├── src/
│       │   ├── app/                    # Expo Router file-based route screens
│       │   │   ├── (tabs)/             # Tab navigation (Home, Attendance, Reports, Settings)
│       │   │   ├── login/              # Staff authentication screens
│       │   │   └── _layout.tsx         # Root layout with QueryClientProvider & UserProvider
│       │   ├── features/
│       │   │   ├── about/              # Application info & build metadata
│       │   │   ├── account/            # Account profile overview & logout
│       │   │   ├── attendance/         # Attendance history list, filter chips, summary cards
│       │   │   ├── audit-logs/         # Audit logs viewer & action filtering
│       │   │   ├── auth/               # Auth state, login mutations, session persistence
│       │   │   ├── change-info-account-staff/ # Admin staff info editor & role switcher
│       │   │   ├── contact/            # Official platforms & dynamic social links
│       │   │   ├── create-account-staff/ # Admin staff creation with Auto System ID
│       │   │   ├── devices/            # Device session manager & remote termination
│       │   │   ├── home/               # 0ms QR scanner, optimistic modals, live clock
│       │   │   ├── info-company/       # Company settings & GPS geofence configuration
│       │   │   ├── information/        # Personal profile & credentials editing modal
│       │   │   ├── keys/               # Access key upload & list UI
│       │   │   ├── language/           # i18n store, useLanguage hook, Khmer & English locales
│       │   │   ├── login/              # Staff authentication screens & Privacy Policy modal
│       │   │   ├── non-subscription/   # Expired subscription guard screen & support contact
│       │   │   ├── privacy-policy/     # Multilingual privacy policy viewer
│       │   │   ├── report/             # Reports hub & filter navigation
│       │   │   ├── report-all-staff/   # Company-wide reports
│       │   │   ├── report-current-staff/ # Current staff daily/weekly/monthly/annual
│       │   │   ├── report-individual-staff/ # Staff selector + report preview
│       │   │   ├── report-request-current-staff/ # Current staff leave/missing scan requests
│       │   │   ├── report-request-individual-staff/ # Individual staff leave requests
│       │   │   ├── server-groups/      # Server cluster management UI
│       │   │   ├── setting/            # Account details, branch information, logout
│       │   │   ├── subscription/       # Branch service package info & validity display
│       │   │   └── system-config/      # Remote dynamic configuration & support channels
│       │   └── shared/
│       │       ├── components/         # AppbarBack, Modals, Loading, Report paper templates
│       │       ├── constants/          # Attendance config, system key helpers
│       │       ├── contexts/           # UserContext (Zustand + TanStack Query cache)
│       │       ├── hooks/              # useResponsive, useAttendanceReportData
│       │       ├── services/           # apiClient (Axios), locationService, userService
│       │       └── styles/             # Unified theme colors, typography, and spacing
│       ├── tsconfig.json
│       └── package.json
│
├── docs/                               # 📚 COMPREHENSIVE TECHNICAL DOCUMENTATION
│   ├── README.md                       # Documentation Suite Index
│   ├── DATABASE.md                     # SQLite, Cloudflare D1, Schema Relations & R2 Integration
│   ├── AUDIT_LOGS.md                   # Audit Logging Architecture & Event Emitter
│   ├── ATTENDANCE_SECURITY.md          # 0ms QR Verification, Geofence & Anti-Spoofing Engine
│   ├── ATTENDANCE_REQUESTS.md          # Request Lifecycle, R2 Storage & Sequential IDs
│   ├── REPORTS_AND_PRINTING.md         # Report Aggregation, PDF Export & Column Layouts
│   └── ARCHITECTURE_AND_STANDARDS.md   # Clean Code, SOLID, DRY & Troubleshooting
│
├── LICENSE                             # Proprietary License (SSH Group Cambodia)
└── README.md                           # Main Project Readme
```

---

## ⚡ Key Features

### 1. 0ms Ultra-Fast Attendance Scanner

- **Instant Client-Side Check**: Validates scanned QR strings locally against official branch lists in 0ms, instantly displaying confirmation without waiting for server roundtrips.
- **Background Deep Security**: Concurrently verifies device coordinates using the **Haversine Formula** against registered branch geofences, detects mock GPS (`isMocked`), and inspects network interfaces for VPN adapters (`tun0`, `10.8.x.x`).

### 2. Standardized User-Scoped Sequential IDs

All records generated across SQLite, Cloudflare D1, and JSON user records follow a strict, human-readable format scoped per staff user:

| Type                   | Format Pattern              | Example                          |
| :--------------------- | :-------------------------- | :------------------------------- |
| **Attendance Log**     | `{system_id}-ATT-0000-0001` | `system-0001-0022-ATT-0000-0001` |
| **Attendance Request** | `{system_id}-REQ-0000-0001` | `system-0001-0022-REQ-0000-0001` |

- **Isolated Counters**: Sequence counts reset per user (Staff A's scans do not increment Staff B's sequence).
- **Dual-Database Sync**: Scans sync to local SQLite (`dev.db`) and remote Cloudflare D1 (`ssh-database`).

### 3. Cloudflare R2 Proof Photo Storage

Proof photos submitted with attendance scans or leave requests are uploaded directly to **Cloudflare R2 (`ssh-storage`)** using an AWS S3-compatible SDK:

```
ssh-storage/
└── staff-attendance-request/
    └── {userFolder}/                  # e.g. system-0002-0001
        └── {createdDateStr}/          # Calendar creation date (YYYY-MM-DD UTC+7)
            └── {timestamp}_proof.jpg  # Encrypted proof image
```

### 4. Native Telegram Multipart Photo Alerts

- Sends native Telegram `POST /sendPhoto` multipart requests containing the proof image and an HTML-formatted caption detailing staff name, ID, time window, and subject.
- Dynamically routes alerts to the appropriate Telegram Group using branch bot tokens and chat IDs configured in `Company`.

### 5. Multi-Layer Caching (Zustand + TanStack Query)

- **TanStack Query (v5)**: Server-state caching (`staleTime: 5m`, `gcTime: 15m`), query deduplication, and automatic invalidation on mutations.
- **Zustand**: Fast client-side persistent storage using AsyncStorage with re-entrancy and race condition guards.

### 6. Bilingual Localization (Khmer & English)

Complete localization across all screens, modals, pickers, and alerts using the `useLanguage()` hook with persistent device storage.

### 7. Branch Subscription & Non-Subscription Guard

- **Pre-computed Validity**: Backend evaluates subscription expiry (`daysRemaining`, `isExpired`, `status`) and automatically maps branch Company IDs to subscriptions.
- **Self-Healing Realtime Sync**: If local SQLite shows an expired subscription, the backend automatically checks Cloudflare D1 for real-time renewals and updates local SQLite in the background.
- **Blocking Guard Route**: Expired branches are routed to the `NonSubscriptionScreen`, keeping sensitive features secure.

### 8. Dynamic Remote Configuration (Backend 70% Link Management)

- Support channels (Telegram support, fallback, phone, email) and social media links are managed dynamically from the backend via `/api/v1/system-config`.
- **Zero Client Rebuilds**: Updating support contacts or social media links in the backend takes effect on all staff devices instantly without recompiling the mobile app.

### 9. Bi-Directional Database Synchronization

CLI tools to synchronize data between local SQLite (`dev.db`) and Cloudflare D1:

```bash
# Subscription Sync
npm --prefix app/backend run sync:sub        # Local -> D1
npm --prefix app/backend run sync:sub:pull   # D1 -> Local

# Users & UserDetails Sync
npm --prefix app/backend run sync:user       # Local -> D1
npm --prefix app/backend run sync:user:pull  # D1 -> Local

# Company Sync
npm --prefix app/backend run sync:company    # Local -> D1
npm --prefix app/backend run sync:company:pull # D1 -> Local
```

- **Comprehensive i18n Architecture**: Native support for Khmer (`km`) and English (`en`) powered by `useLanguage` hook.
- **Khmer Typography Support**: Integrated premium Khmer fonts (`KohSantepheap`, `KantumruyPro`, `Hanuman`) for clear, polished typography.
- **Persistent Locale**: Remembers user choice across app restarts via device storage.

### 7. Branch-Scoped System ID & Global Username Uniqueness

- **Structured System ID**: Formatted as `{companyId}-{staffId}` (e.g., `system-0001-0022`, `system-0002-0001`) with automatic preview in admin forms.
- **Global Username Uniqueness**: Usernames are strictly unique across the entire platform and all systems (`system-0001`, `system-0002`, etc.) with `@unique` database constraints and instant validation in staff creation and edit workflows.

### 8. Edge Data Routing & Dual-Database Persistence

- **Cloudflare D1**: Serverless SQL database running globally at the edge for staff records, attendance logs, and requests.
- **Cloudflare R2**: High-throughput object storage for attendance proof photos and avatars.
- **Local SQLite Fallback**: Synchronized via Prisma Client for local speed and offline resilience.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x`
- **npm** or **pnpm**
- **Expo CLI** (included with project dependencies)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd app/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma Client & apply SQLite migrations
npx prisma generate
npx prisma migrate dev

# Start development server (Port 4000)
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd app/frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

Press `a` in the Expo terminal to launch on **Android Device / Emulator**, or `i` for **iOS Simulator**.

---

## 📖 Technical Documentation

For deep technical specifications, please consult the dedicated documentation suite:

| Document                                                                                                        | Topic                                                                        |
| :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| 🗄️ [docs/DATABASE.md](file:///d:/Code/SSH-Group-Staff-App/docs/DATABASE.md)                                     | Database models, Cloudflare D1 integration, and schema definitions           |
| 🛡️ [docs/ATTENDANCE_SECURITY.md](file:///d:/Code/SSH-Group-Staff-App/docs/ATTENDANCE_SECURITY.md)               | 0ms QR verification, Haversine formula, and anti-spoofing engine             |
| 📝 [docs/ATTENDANCE_REQUESTS.md](file:///d:/Code/SSH-Group-Staff-App/docs/ATTENDANCE_REQUESTS.md)               | Attendance requests, Cloudflare R2 folder structures, and approval lifecycle |
| 📊 [docs/REPORTS_AND_PRINTING.md](file:///d:/Code/SSH-Group-Staff-App/docs/REPORTS_AND_PRINTING.md)             | Daily, Weekly, Monthly, and Annual report aggregation & PDF export           |
| 📋 [docs/AUDIT_LOGS.md](file:///d:/Code/SSH-Group-Staff-App/docs/AUDIT_LOGS.md)                                 | Domain audit logging, event emitters, and security tracking                  |
| 🏛️ [docs/ARCHITECTURE_AND_STANDARDS.md](file:///d:/Code/SSH-Group-Staff-App/docs/ARCHITECTURE_AND_STANDARDS.md) | Clean Architecture, SOLID, DRY principles, and network troubleshooting       |

---

## 📄 License & Copyright

Copyright (c) 2026 **SSH Group Cambodia**. All rights reserved.  
Developed by **BROSSPICH**.

This project and its entire source code are proprietary and confidential to **SSH Group Cambodia**. Unauthorized copying, reverse engineering, redistribution, or exploitation of any part of this software, via any medium, is strictly prohibited.
