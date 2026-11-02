# AGENTS.md

## Purpose

Build and maintain this React Native (Expo v57) Mobile Application with clean, reliable, secure, accessible, scalable, and maintainable code adhering to Clean Code, SOLID, DRY, and Feature-Driven Architecture (FDD).

## Instruction Check

- Expo docs reference: Always refer to Expo v57.0.0+ docs (https://docs.expo.dev/versions/v57.0.0/).
- Inspect relevant source files, configurations, and dependencies before making modifications.
- Maintain established architectural conventions: Feature-based folder structure, Zustand state slices, and typed design system primitives.

## Working Principles

- **SOLID Principles**:
  - **Single Responsibility (SRP)**: UI components only render presentation and forward events; business logic lives in custom hooks (`useAuth`, `useSshGroups`); API requests live in feature `api/`; global/cached state lives in Zustand slices (`store/`).
  - **Open/Closed (OCP)**: Build extensible UI with composition (`children`, render props) instead of fragile boolean branches.
  - **Liskov Substitution (LSP)**: UI primitives extend native contracts (`ViewProps`, `TextInputProps`, `TouchableOpacityProps`) without altering baseline prop behavior.
  - **Interface Segregation (ISP)**: Feature DTOs, prop interfaces, and selector subscriptions request only the exact fields required.
  - **Dependency Inversion (DIP)**: State slices and domain logic rely on abstract storage interfaces (`IStorageService` / `zustandStorage`) rather than concrete platform storage APIs directly.
- **DRY (Don't Repeat Yourself)**:
  - Stable cross-cutting concerns (formatters, validators, design tokens, network client interceptors) live in `/components/ui/`, `/services/`, and `/utils/`.
  - Avoid premature abstraction: do not create generic wrappers when two small blocks only superficially resemble each other.
- **KISS & YAGNI**: Implement the simplest, most explicit design that satisfies the current user requirement.
- **Zustand State Architecture**:
  - Create small, feature-scoped Zustand stores (`useAuthStore`, `useSshGroupStore`, `useKeyStore`, `useAttendanceStore`).
  - Use `persist` middleware with the `createJSONStorage(() => zustandStorage)` adapter for persistent session data.
  - Always prefer fine-grained selector hooks (e.g. `useAuthStore((s) => s.user)`) to avoid unnecessary re-renders.

## Module Boundaries & Barrel Exports

- Each feature in `src/features/<feature>/` exposes strictly its public API via `src/features/<feature>/index.ts`.
- Subcomponents, private helpers, and raw internal state mutations remain private inside the feature folder.
- Expo Router pages in `src/app/` remain thin route adapters that connect URL parameters to feature components.
