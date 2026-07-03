export const AUTH_CALLBACK_ACTIONS = {
  REACTIVATE_ACCOUNT: "reactivate-account",
} as const;

export type AuthCallbackResult =
  | {
      // Single-use handoff code: the app exchanges it for a session over HTTPS.
      // Tokens are never carried in the deep link.
      type: "code";
      code: string;
    }
  | {
      type: "intent";
      action: string;
      reason?: string;
      email?: string;
    };

// The verified Android App Link / iOS associated domain. An https URL on this
// host has been validated by the OS (autoVerify), so an intent arriving on it
// is trusted. Arbitrary `templatern://` custom-scheme links have no host
// verification and must not be trusted for the reactivate intent.
const TRUSTED_INTENT_HOST = "example.com";

function getSearchParams(url: string) {
  if (url.includes("://")) {
    return new URL(url).searchParams;
  }

  if (url.startsWith("?")) {
    return new URLSearchParams(url.slice(1));
  }

  const queryIndex = url.indexOf("?");

  if (queryIndex >= 0) {
    return new URLSearchParams(url.slice(queryIndex + 1));
  }

  return new URLSearchParams();
}

// True when the URL is a verified https App Link on the trusted host. The
// `code` branch is always safe (the code is server-validated over HTTPS), but
// the `intent` branch pre-fills a credential screen and must only be honored
// from a trusted origin.
function isTrustedIntentUrl(url: string): boolean {
  if (!url.includes("://")) {
    // No scheme: this is a bare query string sourced from in-app navigation
    // params, not an external deep link. Trust is decided by the caller.
    return false;
  }

  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" &&
      parsed.hostname.toLowerCase() === TRUSTED_INTENT_HOST
    );
  } catch {
    return false;
  }
}

function parseCode(searchParams: URLSearchParams): string | null {
  const codeParam = searchParams.get("code");

  if (!codeParam) {
    return null;
  }

  // Decode once in case the scheme/redirect layer percent-encoded it.
  try {
    return decodeURIComponent(codeParam) || codeParam;
  } catch {
    return codeParam;
  }
}

export type ParseAuthCallbackOptions = {
  // Set when the URL is known to come from a trusted source, i.e. the in-app
  // `WebBrowser.openAuthSessionAsync` success result. Untrusted external
  // deep links (e.g. a cold-start `templatern://` link) must leave this false so
  // the reactivate `intent` branch is rejected. The `code` branch is always
  // honored regardless, as the code is server-validated over HTTPS.
  trustIntent?: boolean;
};

export function parseAuthCallbackFromUrl(
  url: string,
  options: ParseAuthCallbackOptions = {},
): AuthCallbackResult | null {
  try {
    const searchParams = getSearchParams(url);
    const code = parseCode(searchParams);

    if (code) {
      return {
        type: "code",
        code,
      };
    }

    const action = searchParams.get("action");

    if (action) {
      // Only honor the intent (e.g. reactivate-account) when it arrives from a
      // trusted source: an explicitly trusted caller (in-app browser result)
      // or a verified https App Link on the trusted host. Otherwise an
      // attacker-controlled `templatern://auth/callback?action=...` deep link could
      // pre-fill the reactivation credential screen (phishing).
      if (!options.trustIntent && !isTrustedIntentUrl(url)) {
        return null;
      }

      return {
        type: "intent",
        action,
        reason: searchParams.get("reason") || undefined,
        email: searchParams.get("email") || undefined,
      };
    }
  } catch (error) {
    console.error("Auth callback parse error:", error);
  }
  return null;
}

export function hasAuthCallbackPayload(url: string) {
  const searchParams = getSearchParams(url);

  return searchParams.has("code") || searchParams.has("action");
}
