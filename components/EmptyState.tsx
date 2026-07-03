import { useTheme } from "@/hooks/useTheme";
import { FontFamily, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
  readonly icon: keyof typeof MaterialIcons.glyphMap;
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const tokens = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: Spacing.containerPadding,
      gap: Spacing.gutter,
    },
    iconContainer: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: `${tokens.primary}08`,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      fontFamily: FontFamily.semiBold,
      color: tokens.textPrimary,
      textAlign: "center",
    },
    description: {
      fontSize: 14,
      fontFamily: FontFamily.regular,
      color: tokens.textSecondary,
      textAlign: "center",
      maxWidth: 280,
      lineHeight: 20,
    },
    button: {
      marginTop: Spacing.gutter,
      paddingHorizontal: Spacing.containerPadding,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: tokens.primary,
      minWidth: 160,
    },
    buttonText: {
      fontSize: 14,
      fontFamily: FontFamily.semiBold,
      color: tokens.textInverse,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={44} color={tokens.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
