import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import { Animated, View } from "react-native";

interface SkeletonBoxProps {
  readonly width?: number | string;
  readonly height: number;
  readonly borderRadius?: number;
  readonly marginBottom?: number;
}

export function SkeletonBox({
  width = "100%",
  height,
  borderRadius = 8,
  marginBottom = 0,
}: SkeletonBoxProps) {
  const tokens = useTheme();
  const [shimmerAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <Animated.View
      style={[
        {
          width: typeof width === "number" ? width : "100%",
          height,
          borderRadius,
          marginBottom,
          backgroundColor: tokens.bgMuted,
          opacity,
        },
      ]}
    />
  );
}

interface SkeletonCardProps {
  readonly marginBottom?: number;
}

export function SkeletonCard({ marginBottom = 12 }: SkeletonCardProps) {
  const tokens = useTheme();
  return (
    <View
      style={{
        marginBottom,
        padding: 16,
        backgroundColor: tokens.bgElevated,
        borderRadius: 12,
        gap: 8,
      }}
    >
      <SkeletonBox height={20} />
      <SkeletonBox height={14} width="75%" />
      <SkeletonBox height={16} width="85%" marginBottom={8} />
    </View>
  );
}

interface SkeletonListProps {
  readonly count?: number;
  readonly marginBottom?: number;
}

export function SkeletonList({
  count = 3,
  marginBottom = 0,
}: SkeletonListProps) {
  return (
    <View style={{ marginBottom }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} marginBottom={i !== count - 1 ? 12 : 0} />
      ))}
    </View>
  );
}

interface SkeletonCircleProps {
  readonly size: number;
  readonly marginBottom?: number;
}

export function SkeletonCircle({
  size,
  marginBottom = 0,
}: SkeletonCircleProps) {
  const [shimmerAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const tokens = useTheme();
  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tokens.bgMuted,
        marginBottom,
        opacity,
      }}
    />
  );
}
