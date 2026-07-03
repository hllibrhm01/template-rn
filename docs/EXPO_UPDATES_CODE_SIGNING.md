# expo-updates Code Signing

Code signing lets the app cryptographically verify that OTA updates delivered
by `expo-updates` were produced by us and were not tampered with in transit.
This is opt-in and is **not** configured yet — follow the steps below to set
it up. Do not add a `codeSigningCertificate` reference to `app.json` until the
certificate file actually exists, or builds will fail.

## 1. Generate the key pair and certificate

Run from the repo root:

```bash
npx expo-updates codesigning:generate \
  --key-output-directory keys \
  --certificate-output-directory certs \
  --certificate-validity-duration-years 10 \
  --certificate-common-name TemplateRN
```

This produces:

- `keys/private-key.pem` — the signing private key (**keep secret**).
- `keys/public-key.pem` — the public key.
- `certs/certificate.pem` — the self-signed code-signing certificate.

## 2. Reference the certificate in `app.json`

Add to `expo.updates`:

```jsonc
{
  "expo": {
    "updates": {
      "codeSigningCertificate": "./certs/certificate.pem",
      "codeSigningMetadata": {
        "keyid": "main",
        "alg": "rsa-v1_5-sha256"
      }
    }
  }
}
```

Commit `certs/certificate.pem` and `keys/public-key.pem` (these are public).

## 3. Keep the private key out of the repo

- Add `keys/private-key.pem` to `.gitignore` — **never commit the private key**.
- Store the private key in EAS secrets so `eas update` can sign updates in CI:

```bash
eas secret:create --scope project \
  --name EXPO_UPDATES_PRIVATE_KEY \
  --type file \
  --value ./keys/private-key.pem
```

When publishing updates, `expo-updates` signs the manifest with the private
key; clients verify the signature against the embedded certificate. An update
signed with the wrong key (or unsigned) is rejected by the app.

## Rotation notes

- The certificate is valid for 10 years (`--certificate-validity-duration-years 10`).
- Rotating the key requires shipping a new binary that embeds the new
  certificate, since the certificate is bundled into the build.
