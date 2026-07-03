import { FontFamily, ThemeTokens } from "@/constants/theme";
import LiquidGlassView from "@/components/LiquidGlassView";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuth";
import { useHamburgerDrawerStore } from "@/store/useHamburgerDrawer";
import { AuthStatusEnum } from "@/types/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  readonly onMenuPress?: () => void;
}

export default function HomeHeader({
  onMenuPress,
}: HomeHeaderProps) {
  const tokens = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const photo = useAuthStore((s) => s.user?.user?.photo);
  const toggleDrawer = useHamburgerDrawerStore((state) => state.toggle);
  const isLoggedIn = status === AuthStatusEnum.LOGGED_IN;
  const userPhoto = isLoggedIn ? photo : undefined;
  const handleMenuPress = onMenuPress ?? toggleDrawer;
  const { t } = useTranslation();

  const headerContent = (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.left}>
        <TouchableOpacity
          onPress={handleMenuPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          style={styles.menuButton}
        >
          <MaterialIcons name="menu" size={24} color={tokens.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.brandTitle}>{t("appName")}</Text>
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.avatarButton}
        >
          {userPhoto ? (
            <Image
              source={{ uri: userPhoto }}
              style={styles.avatar}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={20} color={tokens.textTertiary} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LiquidGlassView
      glassStyle="regular"
      tintColor={tokens.glassTint}
      style={styles.blurWrap}
      contentStyle={styles.glassContent}
    >
      {headerContent}
    </LiquidGlassView>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
  blurWrap: {
    zIndex: 40,
    borderBottomWidth: 1,
    borderBottomColor: tokens.glassStrokeMuted,
  },
  glassContent: {
    flex: 0,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
    minHeight: 48,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    borderRadius: 9999,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: tokens.textPrimary,
    letterSpacing: -0.22,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  avatarButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.borderDefault,
    overflow: "hidden",
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.borderDefault,
  },
});
