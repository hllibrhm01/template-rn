# Deep Links (App Links / Universal Links)

The app handles the OAuth/auth callback via deep links. Two mechanisms are
configured:

1. **Custom scheme** `templatern://` — fallback, always works without domain setup.
2. **Verified domain links** for `example.com` — preferred on production,
   open the app directly from `https://example.com/auth/callback` links.

## Expo config (`app.json`)

- iOS: `expo.ios.associatedDomains: ["applinks:example.com"]`
- Android: `expo.android.intentFilters` entry with `action VIEW`,
  `autoVerify: true`, categories `DEFAULT` + `BROWSABLE`, and data
  `{ scheme: "https", host: "example.com", pathPrefix: "/auth/callback" }`
- The `templatern` custom `scheme` is kept as a fallback.

## Required server-side hosting

Verified links only work if the domain serves the association files over
HTTPS (no redirects), with `Content-Type: application/json`:

- **iOS:** `https://example.com/.well-known/apple-app-site-association`
  must list the app's `appID` (`<TeamID>.<bundleIdentifier>` =
  `com.example.templatern`) with the `/auth/callback*` path.
- **Android:** `https://example.com/.well-known/assetlinks.json` must
  list the package `com.example.templatern` and the SHA-256 signing certificate
  fingerprints (debug + release / Play App Signing).

Without these files hosted, the OS falls back to opening the URL in the
browser and the `templatern://` scheme deep link continues to work.
