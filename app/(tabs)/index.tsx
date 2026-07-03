import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LegendList } from '@legendapp/list';
import { FontFamily, Colors, ambientShadow, ThemeTokens } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import HomeHeader from '@/components/HomeHeader';
import { useAuthStore } from '@/store/useAuth';
import { AuthStatusEnum } from '@/types/auth';

export default function HomeScreen() {
  const tokens = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const insets = useSafeAreaInsets();
  const { t: translate } = useTranslation();
  const status = useAuthStore((s) => s.status);
  const hasUser = useAuthStore((s) => !!s.user);

  const isAuthenticated = status === AuthStatusEnum.LOGGED_IN && hasUser;

  return (
    <>
      <HomeHeader />

      <LegendList
        estimatedItemSize={220}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom + 112, 124),
          },
        ]}
      >
        <View style={styles.heroCard}>
          <MaterialIcons name="rocket-launch" size={72} color={Colors.secondaryContainer} />
          <Text style={styles.title}>{translate('homeScreen.title')}</Text>
          <Text style={styles.subtitle}>
            {isAuthenticated
              ? translate('homeScreen.subtitleLoggedIn')
              : translate('homeScreen.subtitleLoggedOut')}
          </Text>
        </View>
      </LegendList>
    </>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: tokens.bgBase,
    },
    container: {
      flexGrow: 1,
      paddingHorizontal: 20,
      backgroundColor: tokens.bgBase,
      gap: 16,
    },
    heroCard: {
      backgroundColor: tokens.surfaceContainerLowest,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      ...ambientShadow,
    },
    title: {
      fontFamily: FontFamily.bold,
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: -0.56,
      color: tokens.textPrimary,
      marginTop: 20,
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: FontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: tokens.textSecondary,
      textAlign: 'center',
    },
  });
