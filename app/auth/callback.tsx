import {
  ambientShadow,
  Colors,
  FontFamily,
  ThemeTokens,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SECURE_STORE_AUTH_OPTIONS,
  SECURE_STORE_KEY,
  useAuthStore,
} from "../../store/useAuth";
import { UserResponseData } from "../../types/auth";
import { postMobileHandoffExchange } from "../../api/post";
import {
  AUTH_CALLBACK_ACTIONS,
  hasAuthCallbackPayload,
  parseAuthCallbackFromUrl,
} from "../../utils/parseSessionFromUrl";

function getSingleParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function buildCallbackUrlFromParams(params: {
  code?: string | string[];
  action?: string | string[];
  reason?: string | string[];
  email?: string | string[];
}) {
  const callbackParams = new URLSearchParams();
  const code = getSingleParamValue(params.code);
  const action = getSingleParamValue(params.action);
  const reason = getSingleParamValue(params.reason);
  const email = getSingleParamValue(params.email);

  if (code) {
    callbackParams.set("code", code);
  }

  if (action) {
    callbackParams.set("action", action);
  }

  if (reason) {
    callbackParams.set("reason", reason);
  }

  if (email) {
    callbackParams.set("email", email);
  }

  const query = callbackParams.toString();

  return query ? `?${query}` : null;
}

export default function AuthCallback() {
  const { t } = useTranslation();
  const tokens = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const params = useLocalSearchParams<{
    code?: string;
    action?: string;
    reason?: string;
    email?: string;
  }>();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasHandledCallback = useRef(false);
  const codeParam = getSingleParamValue(params.code);
  const actionParam = getSingleParamValue(params.action);
  const reasonParam = getSingleParamValue(params.reason);
  const emailParam = getSingleParamValue(params.email);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }

    hasHandledCallback.current = true;
    void WebBrowser.dismissBrowser().catch(() => undefined);

    const saveSessionAndRedirect = async (sessionData: UserResponseData) => {
      try {
        await SecureStore.setItemAsync(
          SECURE_STORE_KEY,
          JSON.stringify(sessionData),
          SECURE_STORE_AUTH_OPTIONS,
        );
      } catch (error) {
        // Log only the message, never the full error object (which could carry
        // session/token context) to device logs.
        console.error(
          "Failed to save session to SecureStore:",
          error instanceof Error ? error.message : "unknown error",
        );
      }
      login(sessionData);
      router.replace("/(tabs)/profile");
    };

    const routeToReactivation = (email?: string, reason?: string) => {
      router.replace({
        pathname: "/auth/reactivate",
        params: {
          email,
          reason,
        },
      });
    };

    const handleAuthCallback = async (rawUrl: string) => {
      const authCallback = parseAuthCallbackFromUrl(rawUrl);

      if (!authCallback) {
        return false;
      }

      if (authCallback.type === "code") {
        // Exchange the single-use code for a session over HTTPS. The deep link
        // never carries tokens.
        try {
          const session = await postMobileHandoffExchange(authCallback.code);
          await saveSessionAndRedirect(session);
        } catch (error) {
          console.error(
            "Mobile handoff exchange failed:",
            error instanceof Error ? error.message : "unknown error",
          );
          setErrorMessage(t("auth.callback.invalidSessionData"));
        }
        return true;
      }

      if (authCallback.action === AUTH_CALLBACK_ACTIONS.REACTIVATE_ACCOUNT) {
        routeToReactivation(authCallback.email, authCallback.reason);
        return true;
      }

      return false;
    };

    const handleDeepLink = async () => {
      const paramCallbackUrl = buildCallbackUrlFromParams({
        code: codeParam,
        action: actionParam,
        reason: reasonParam,
        email: emailParam,
      });
      const url = await Linking.getInitialURL();
      const callbackCandidates = [paramCallbackUrl, url].filter(
        (candidate, index, candidates): candidate is string =>
          typeof candidate === "string" &&
          candidate.length > 0 &&
          candidates.indexOf(candidate) === index,
      );

      for (const callbackCandidate of callbackCandidates) {
        if (await handleAuthCallback(callbackCandidate)) {
          return;
        }
      }

      if (paramCallbackUrl) {
        setErrorMessage(t("auth.callback.invalidSessionData"));
        return;
      }

      if (url && hasAuthCallbackPayload(url)) {
        setErrorMessage(
          t("auth.callback.unreadableSession"),
        );
        return;
      }

      setErrorMessage(t("auth.callback.noPendingSession"));
    };

    handleDeepLink();
  }, [
    actionParam,
    codeParam,
    emailParam,
    login,
    reasonParam,
    router,
    t,
  ]);

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t("auth.callback.failedTitle")}</Text>
        <Text style={styles.subtitle}>{errorMessage}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/(tabs)/profile")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonLabel}>{t("auth.callback.backToProfile")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.title}>{t("auth.callback.signingIn")}</Text>
      <Text style={styles.subtitle}>{t("auth.callback.pleaseWait")}</Text>
    </View>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: tokens.bgBase,
      padding: 20,
    },
    title: {
      fontFamily: FontFamily.semiBold,
      fontSize: 20,
      color: tokens.textPrimary,
      marginTop: 20,
    },
    subtitle: {
      fontFamily: FontFamily.regular,
      fontSize: 14,
      color: tokens.textSecondary,
      marginTop: 8,
      textAlign: "center",
    },
    button: {
      marginTop: 20,
      backgroundColor: Colors.primary,
      borderRadius: 9999,
      paddingHorizontal: 20,
      paddingVertical: 14,
      ...ambientShadow,
    },
    buttonLabel: {
      fontFamily: FontFamily.semiBold,
      color: tokens.textInverse,
      fontSize: 15,
    },
    debug: {
      fontSize: 12,
      color: "#10b981",
      marginTop: 20,
      fontFamily: "monospace",
    },
  });
