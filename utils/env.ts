// EXPO_PUBLIC_* variables are inlined at build time, which only works for
// static `process.env.X` member access — hence this explicit table instead of
// a dynamic `process.env[name]` lookup.
const PUBLIC_ENV = {
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_FRONTEND_URL: process.env.EXPO_PUBLIC_FRONTEND_URL,
  EXPO_PUBLIC_SITE_URL: process.env.EXPO_PUBLIC_SITE_URL,
} as const;

type PublicEnvName = keyof typeof PUBLIC_ENV;

function readPublicEnv(name: PublicEnvName) {
  const value = PUBLIC_ENV[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function requirePublicEnv(name: PublicEnvName) {
  const value = readPublicEnv(name);

  if (!value) {
    throw new Error(`${name} is not defined`);
  }

  return value;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

// Transport security: in production builds (`!__DEV__`) every configured
// endpoint must use a secure scheme (https:/wss:). This guards against a
// misconfigured EXPO_PUBLIC_* URL silently downgrading API and socket traffic
// (and the JWT it carries) to cleartext. Dev builds stay permissive so local
// http://localhost / ws://localhost development keeps working.
const SECURE_SCHEMES = ["https:", "wss:"];

function assertSecureUrl(name: string, value: string) {
  if (__DEV__) {
    return;
  }

  let protocol: string;
  try {
    protocol = new URL(value).protocol;
  } catch {
    throw new Error(`${name} is not a valid URL: ${value}`);
  }

  if (!SECURE_SCHEMES.includes(protocol)) {
    throw new Error(
      `${name} must use a secure scheme (https:// or wss://) in production builds, but got "${protocol}". ` +
        `Cleartext transport is not allowed outside development.`,
    );
  }
}

function normalizeBaseUrl(value: string) {
  return trimTrailingSlash(value);
}

function normalizeRouteSegment(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

function buildAbsoluteUrl(baseUrl: string, path: string) {
  return new URL(normalizeRouteSegment(path), `${baseUrl}/`).toString();
}

export const API_URL = normalizeBaseUrl(
  requirePublicEnv("EXPO_PUBLIC_API_URL"),
);
assertSecureUrl("EXPO_PUBLIC_API_URL", API_URL);

export const FRONTEND_URL = readPublicEnv("EXPO_PUBLIC_FRONTEND_URL");
if (FRONTEND_URL) {
  assertSecureUrl("EXPO_PUBLIC_FRONTEND_URL", FRONTEND_URL);
}

const SITE_URL = normalizeBaseUrl(
  readPublicEnv("EXPO_PUBLIC_SITE_URL") || FRONTEND_URL || "",
);

if (!SITE_URL) {
  throw new Error(
    "EXPO_PUBLIC_SITE_URL or EXPO_PUBLIC_FRONTEND_URL is not defined",
  );
}

export const TERMS_URL = buildAbsoluteUrl(SITE_URL, "/terms");
export const PRIVACY_URL = buildAbsoluteUrl(SITE_URL, "/privacy");
export const OPEN_SOURCE_LICENSES_URL = buildAbsoluteUrl(
  SITE_URL,
  "/open-source-licenses",
);
