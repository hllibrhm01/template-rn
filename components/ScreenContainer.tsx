import { FontFamily } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import LiquidGlassView from "@/components/LiquidGlassView";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode, useState } from "react";
import {
  Animated,
  Keyboard,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 48;

interface ScreenContainerProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly headerRight?: ReactNode;
  readonly showBackButton?: boolean;
  readonly scrollRef?: React.RefObject<ScrollView | null>;
  readonly onScrollBeginDrag?: () => void;
  readonly refreshControl?: React.ReactElement<RefreshControlProps>;
  readonly scrollable?: boolean;
}

export default function ScreenContainer({
  title,
  children,
  contentContainerStyle,
  headerRight,
  showBackButton = false,
  scrollRef,
  onScrollBeginDrag,
  refreshControl,
  scrollable = true,
}: ScreenContainerProps) {
  const tokens = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [scrollY] = useState(() => new Animated.Value(0));
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.85],
    extrapolate: "clamp",
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.bgBase,
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: "transparent",
      zIndex: 100,
    },
    headerContent: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      gap: 12,
    },
    headerSide: {
      width: 80,
      justifyContent: "center",
      flexShrink: 0,
    },
    backButton: {
      padding: 4,
    },
    headerRightContainer: {
      alignItems: "flex-end",
    },
    headerTitle: {
      flex: 1,
      minWidth: 0,
      fontFamily: FontFamily.semiBold,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.22,
      color: tokens.textPrimary,
      textAlign: "center",
    },
    headerBorder: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: "#E0E0E0",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    staticContainer: {
      flex: 1,
    },
  });

  const handleBack = () => {
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      router.back();
    });
  };

  const headerInner = (
    <View style={styles.headerContent}>
      <View style={styles.headerSide}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={22}
              color={tokens.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={[styles.headerSide, styles.headerRightContainer]}>
        {headerRight}
      </View>
    </View>
  );

  const renderContent = () => {
    if (!scrollable) {
      return (
        <View
          style={[
            styles.staticContainer,
            { marginTop: HEADER_HEIGHT + insets.top },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      );
    }

    return (
      <Animated.ScrollView
        ref={scrollRef as any}
        style={[styles.scrollView, { marginTop: HEADER_HEIGHT + insets.top }]}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={onScrollBeginDrag}
        refreshControl={refreshControl}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {children}
      </Animated.ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: HEADER_HEIGHT + insets.top,
            opacity: headerOpacity,
          },
        ]}
      >
        <LiquidGlassView
          glassStyle="regular"
          tintColor={tokens.glassTint}
          style={StyleSheet.absoluteFill}
        />
        {headerInner}
        <View style={styles.headerBorder} />
      </Animated.View>

      {renderContent()}
    </View>
  );
}

