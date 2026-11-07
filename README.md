# SSH Group Staff (Mobile App)

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
│   │   ├── src/
│   │   │   ├── core/                   # Shared errors, middleware, constants, and utilities
│   │   │   ├── features/
│   │   │   │   ├── attendance-requests/# Leave/Missing scan requests, R2 uploads & Telegram alerts
│   │   │   │   ├── attendance-security/# 0ms QR verification, Haversine geofence & anti-spoofing
│   │   │   │   ├── audit-logs/         # Security & domain event logger with Telegram alerts
│   │   │   │   ├── auth/               # Multi-role authentication & JWT token generation
│   │   │   │   ├── company/            # Branch profiles, geofence coords, work hours & bot tokens
│   │   │   │   ├── devices/            # Hardware binding, session termination & anti-sharing
│   │   │   │   ├── reports/            # Daily, Weekly, Monthly & Annual attendance aggregations
│   │   │   │   └── users/              # Staff directory, role-based access & system ID generation
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
│       │   │   ├── attendance/         # Attendance history list, filter chips, summary cards
│       │   │   ├── auth/               # Auth state, login mutations, session persistence
│       │   │   ├── change-info-.../    # Admin staff management & profile editing modal
│       │   │   ├── create-account-.../ # Admin create staff screen with Auto System ID
│       │   │   ├── home/               # 0ms QR scanner, optimistic modals, live clock
│       │   │   ├── report-.../         # Daily, Weekly, Monthly & Annual report screens
│       │   │   └── setting/            # Account details, branch information, logout
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
├── LICENSE                             # MIT License
└── README.md                           # Main Project Readme
```

---

## ⚡ Key Features

### 1. 0ms Ultra-Fast Attendance Scanner
- **Instant Client-Side Check**: Validates scanned QR strings locally against official branch lists in 0ms, instantly displaying confirmation without waiting for server roundtrips.
- **Background Deep Security**: Concurrently verifies device coordinates using the **Haversine Formula** against registered branch geofences, detects mock GPS (`isMocked`), and inspects network interfaces for VPN adapters (`tun0`, `10.8.x.x`).

### 2. Standardized User-Scoped Sequential IDs
All records generated across SQLite, Cloudflare D1, and JSON user records follow a strict, human-readable format scoped per staff user:

| Type | Format Pattern | Example |
| :--- | :--- | :--- |
| **Attendance Log** | `{system_id}-ATT-0000-0001` | `system-0001-0022-ATT-0000-0001` |
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

| Document | Topic |
| :--- | :--- |
| 🗄️ [docs/DATABASE.md](file:///d:/Code/SSH-Group-Staff-App/docs/DATABASE.md) | Database models, Cloudflare D1 integration, and schema definitions |
| 🛡️ [docs/ATTENDANCE_SECURITY.md](file:///d:/Code/SSH-Group-Staff-App/docs/ATTENDANCE_SECURITY.md) | 0ms QR verification, Haversine formula, and anti-spoofing engine |
| 📝 [docs/ATTENDANCE_REQUESTS.md](file:///d:/Code/SSH-Group-Staff-App/docs/ATTENDANCE_REQUESTS.md) | Attendance requests, Cloudflare R2 folder structures, and approval lifecycle |
| 📊 [docs/REPORTS_AND_PRINTING.md](file:///d:/Code/SSH-Group-Staff-App/docs/REPORTS_AND_PRINTING.md) | Daily, Weekly, Monthly, and Annual report aggregation & PDF export |
| 📋 [docs/AUDIT_LOGS.md](file:///d:/Code/SSH-Group-Staff-App/docs/AUDIT_LOGS.md) | Domain audit logging, event emitters, and security tracking |
| 🏛️ [docs/ARCHITECTURE_AND_STANDARDS.md](file:///d:/Code/SSH-Group-Staff-App/docs/ARCHITECTURE_AND_STANDARDS.md) | Clean Architecture, SOLID, DRY principles, and network troubleshooting |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](file:///d:/Code/SSH-Group-Staff-App/LICENSE) file for details.
