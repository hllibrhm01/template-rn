# template-rn

Expo (React Native) starter template with authentication, profile/account
management, notifications, i18n, and theming already wired up. Fork it, rename
it, and start building your product screens.

## What's included

- **Expo Router** file-based navigation with native tabs (`app/`)
- **Auth**: browser-based login with mobile handoff, secure token storage
  (`expo-secure-store`), session refresh, reactivation flow
  (`providers/AuthProvider.tsx`, `store/useAuth.ts`, `app/auth/`)
- **Account screens**: edit profile (with avatar upload), change password,
  email/phone verification, active sessions, freeze/delete account,
  notification preferences, permissions, feedback, support, legal, about
  (`app/profile/`)
- **API layer**: axios instance with auth header + refresh handling (`api/`)
- **State**: zustand stores (`store/`) and TanStack Query hooks (`query-hooks/`)
- **i18n**: i18next with English, Turkish, and German locales (`i18n/`)
- **Theming**: token-based light theme, Manrope font, text-size scaling shim
  (`constants/theme.ts`, `shims/react-native.js`)
- **Infra**: push notifications + device registration, network status provider,
  error boundary, expo-updates ready (see `docs/EXPO_UPDATES_CODE_SIGNING.md`),
  deep links (see `docs/DEEP_LINKS.md`)

## Getting started

1. Copy `.env.example` to `.env` and point `EXPO_PUBLIC_API_URL`,
   `EXPO_PUBLIC_FRONTEND_URL`, and `EXPO_PUBLIC_SITE_URL` at your backend and
   web origins.
2. Rename the app: `name`, `slug`, `scheme`, `ios.bundleIdentifier`, and
   `android.package` in `app.json`, plus the `appName` key in
   `i18n/locales/*.json`.
3. Install and run:

```sh
yarn install
yarn start        # expo start
yarn ios          # expo run:ios
yarn android      # expo run:android
```

## Backend contract

The template expects a REST API exposing the `v1/auth/*`, `v1/users/*`,
`v1/sessions/*`, `v1/devices`, `v1/notifications`, `v1/feedback`, `v1/legal`,
and `v1/app-version/check` endpoints used in `api/`. Adjust the `api/` and
`types/` layers to match your backend.
