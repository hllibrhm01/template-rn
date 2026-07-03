import {
  AUTH_CALLBACK_ACTIONS,
} from "@/utils/parseSessionFromUrl";
import { startAuthSession } from "@/utils/authSession";
import { postMobileHandoffExchange } from "@/api/post";
import * as SecureStore from "expo-secure-store";
import { ThemeTokens, FontFamily, Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ScreenContainer from "./ScreenContainer";
import {
  SECURE_STORE_AUTH_OPTIONS,
  SECURE_STORE_KEY,
  useAuthStore,
} from "@/store/useAuth";

interface LoginRequiredProps {
  readonly pageTitle: string;
  readonly title: string;
  readonly description: string;
}

export default function LoginRequired({
  pageTitle,
  title,
  description,
}: LoginRequiredProps) {
  const tokens = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const router = useRouter();
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);

  const persistSession = async (
    session: Awaited<ReturnType<typeof postMobileHandoffExchange>>,
  ) => {
    await SecureStore.setItemAsync(
      SECURE_STORE_KEY,
      JSON.stringify(session),
      SECURE_STORE_AUTH_OPTIONS,
    );
    login(session);
  };

  const handleLogin = async () => {
    try {
      const result = await startAuthSession(
        "login",
        t("profileScreen.errors.frontendUrlMissing"),
      );

      if (result.type === "opened-in-browser" || result.type === "cancelled") {
        return;
      }

      if (result.type === "invalid-callback") {
        Alert.alert(
          t("profileScreen.authFailedTitle"),
          t("auth.callback.unreadableSession"),
        );
        return;
      }

      if (result.authCallback.type === "intent") {
        if (result.authCallback.action === AUTH_CALLBACK_ACTIONS.REACTIVATE_ACCOUNT) {
          router.push({
            pathname: "/auth/reactivate",
            params: {
              email: result.authCallback.email,
              reason: result.authCallback.reason,
            },
          });
          return;
        }

        Alert.alert(
          t("profileScreen.authFailedTitle"),
          t("profileScreen.errors.additionalActionRequired"),
        );
        return;
      }

      // Exchange the single-use deep-link code for a session over HTTPS;
      // tokens are never carried in the deep link.
      const session = await postMobileHandoffExchange(result.authCallback.code);
      await persistSession(session);
    } catch (error) {
      Alert.alert(
        t("profileScreen.loginStartFailed"),
        error instanceof Error
          ? error.message
          : t("profileScreen.errors.browserSessionFailed"),
      );
    }
  };

  return (
    <ScreenContainer title={pageTitle} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.iconSection}>
          <View style={styles.iconBackground}>
            <MaterialIcons name="directions-car" size={56} color={Colors.primary} />
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              void handleLogin();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>{t("tabs.signIn")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  iconBackground: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${Colors.primary}14`,
    justifyContent: "center",
    alignItems: "center",
  },
  contentSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontFamily: FontFamily.bold,
    color: tokens.textPrimary,
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: tokens.textSecondary,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 280,
  },
  actionSection: {
    width: "100%",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: tokens.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 9999,
    minWidth: 200,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
    letterSpacing: 0.5,
  },
});
