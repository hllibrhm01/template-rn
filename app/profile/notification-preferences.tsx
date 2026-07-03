import ScreenContainer from "@/components/ScreenContainer";
import { useNotification } from "@/components/Notification";
import {
    ambientShadow,
    Colors,
    FontFamily,
    ThemeTokens,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { usePatchUsers } from "@/query-hooks/useUser";
import { mergeAuthenticatedUser, useAuthStore } from "@/store/useAuth";
import { notifyApiError } from "@/utils/apiError";
import {
    getNotificationPermissionStatus,
    requestNotificationPermissionStatus,
} from "@/utils/notificationPermissions";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Linking,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PREFS_KEY = "notification_preferences";

interface NotificationPrefs {
    messages: boolean;
    promotions: boolean;
    system: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
    messages: true,
    promotions: true,
    system: true,
};

const makeMasterCardEnabledStyle = (tokens: ThemeTokens) => ({
    borderColor: tokens.success + "40",
});
const makeMasterCardDisabledStyle = (tokens: ThemeTokens) => ({
    borderColor: tokens.borderDefault,
});
const makeMasterIconEnabledStyle = (tokens: ThemeTokens) => ({
    backgroundColor: tokens.successBg,
});
const makeMasterIconDisabledStyle = (tokens: ThemeTokens) => ({
    backgroundColor: tokens.bgSubtle,
});
const makeManageButtonStyle = (tokens: ThemeTokens) => ({
    borderColor: tokens.borderDefault,
});
const makePreferenceTrackColor = (tokens: ThemeTokens) => ({
    false: tokens.borderSubtle,
    true: Colors.primary + "60",
});

function openAppSettings() {
    if (Platform.OS === "ios") {
        Linking.openURL("app-settings:");
    } else {
        Linking.openSettings();
    }
}

const PreferenceRow = memo(function PreferenceRow({
    icon,
    iconColor,
    label,
    description,
    value,
    onToggle,
    disabled,
}: {
    icon: keyof typeof MaterialIcons.glyphMap;
    iconColor: string;
    label: string;
    description: string;
    value: boolean;
    onToggle: (val: boolean) => void;
    disabled?: boolean;
}) {
    const tokens = useTheme();
    const styles = useMemo(() => makeStyles(tokens), [tokens]);
    const preferenceTrackColor = useMemo(
        () => makePreferenceTrackColor(tokens),
        [tokens],
    );
    const iconCircleStyle = useMemo(
        () => [styles.prefIconCircle, { backgroundColor: iconColor + "15" }],
        [iconColor, styles],
    );

    return (
        <View style={[styles.prefRow, styles.prefRowSurface]}>
            <View style={iconCircleStyle}>
                <MaterialIcons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.prefContent}>
                <Text
                    style={[
                        styles.prefLabel,
                        disabled ? styles.prefLabelDisabled : styles.prefLabelEnabled,
                    ]}
                >
                    {label}
                </Text>
                <Text style={[styles.prefDesc, styles.prefDescMuted]}>{description}</Text>
            </View>
            <Switch
                value={value && !disabled}
                onValueChange={onToggle}
                disabled={disabled}
                trackColor={preferenceTrackColor}
                thumbColor={value && !disabled ? Colors.primary : tokens.textInverse}
                ios_backgroundColor={tokens.borderSubtle}
            />
        </View>
    );
});

export default function NotificationPreferencesScreen() {
    const tokens = useTheme();
    const styles = useMemo(() => makeStyles(tokens), [tokens]);
    const theme = tokens;
    const masterCardEnabledStyle = useMemo(
        () => makeMasterCardEnabledStyle(tokens),
        [tokens],
    );
    const masterCardDisabledStyle = useMemo(
        () => makeMasterCardDisabledStyle(tokens),
        [tokens],
    );
    const masterIconEnabledStyle = useMemo(
        () => makeMasterIconEnabledStyle(tokens),
        [tokens],
    );
    const masterIconDisabledStyle = useMemo(
        () => makeMasterIconDisabledStyle(tokens),
        [tokens],
    );
    const manageButtonStyle = useMemo(
        () => makeManageButtonStyle(tokens),
        [tokens],
    );
    const preferenceTrackColor = useMemo(
        () => makePreferenceTrackColor(tokens),
        [tokens],
    );
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user?.user);
    const { notify } = useNotification();
    const patchUser = usePatchUsers();
    const accountNotificationsEnabled = user
        ? user.notificationsEnabled !== false
        : false;
    const [optimisticPushEnabled, setOptimisticPushEnabled] = useState<boolean | null>(null);
    const [systemNotificationsGranted, setSystemNotificationsGranted] = useState(false);
    const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
    const pushEnabled = optimisticPushEnabled ?? accountNotificationsEnabled;

    const checkPushPermission = useCallback(async () => {
        try {
            const status = await getNotificationPermissionStatus();
            setSystemNotificationsGranted(status === "granted");
        } catch (error) {
            // void-called from an effect — guard so a permission-check failure
            // doesn't surface as an unhandled promise rejection.
            console.warn(
                "Failed to check push permission:",
                error instanceof Error ? error.message : String(error),
            );
            setSystemNotificationsGranted(false);
        }
    }, []);

    const loadPrefs = useCallback(async () => {
        try {
            const stored = await SecureStore.getItemAsync(PREFS_KEY);
            if (stored) {
                setPrefs(JSON.parse(stored));
            }
        } catch {
            // Use defaults
        }
    }, []);

    const handleOpenAppSettings = useCallback(() => {
        openAppSettings();
    }, []);

    const persistPrefs = useCallback(async (nextPrefs: NotificationPrefs) => {
        try {
            await SecureStore.setItemAsync(PREFS_KEY, JSON.stringify(nextPrefs));
        } catch (error) {
            // Fire-and-forget (void-called from updatePref) — don't let a
            // SecureStore write failure become an unhandled rejection.
            console.warn(
                "Failed to persist notification preferences:",
                error instanceof Error ? error.message : String(error),
            );
        }
    }, []);

    const updatePref = useCallback((key: keyof NotificationPrefs, value: boolean) => {
        setPrefs((current) => {
            const nextPrefs = { ...current, [key]: value };
            void persistPrefs(nextPrefs);
            return nextPrefs;
        });
    }, [persistPrefs]);

    const toggleMessages = useCallback((value: boolean) => {
        updatePref("messages", value);
    }, [updatePref]);

    const togglePromotions = useCallback((value: boolean) => {
        updatePref("promotions", value);
    }, [updatePref]);

    const toggleSystem = useCallback((value: boolean) => {
        updatePref("system", value);
    }, [updatePref]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void checkPushPermission();
            void loadPrefs();
        });

        return () => {
            cancelAnimationFrame(frame);
        };
    }, [checkPushPermission, loadPrefs]);

    const handleTogglePush = useCallback(async (nextEnabled: boolean) => {
        if (!user) {
            return;
        }

        if (nextEnabled && !systemNotificationsGranted) {
            const status = await requestNotificationPermissionStatus();
            const granted = status === "granted";
            setSystemNotificationsGranted(granted);

            if (!granted) {
                setOptimisticPushEnabled(null);
                openAppSettings();
                return;
            }
        }

        setOptimisticPushEnabled(nextEnabled);

        try {
            const response = await patchUser.mutateAsync({
                id: user.id,
                d: { notificationsEnabled: nextEnabled },
            });
            const savedEnabled = response.result.notificationsEnabled !== false;
            await mergeAuthenticatedUser({ notificationsEnabled: savedEnabled });
            setOptimisticPushEnabled(null);
        } catch (error) {
            setOptimisticPushEnabled(null);
            notifyApiError({
                error,
                notify,
                title: t("notificationPreferencesScreen.notifications.updateFailedTitle"),
                fallbackMessage: t("notificationPreferencesScreen.notifications.updateFailedMessage"),
            });
        }
    }, [notify, patchUser, systemNotificationsGranted, t, user]);

    return (
        <ScreenContainer title={t("settings.notificationPreferences")} showBackButton>
            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
                    {t("notificationPreferencesScreen.sections.push")}
                </Text>
                <View
                    style={[
                        styles.masterCard,
                        styles.masterCardSurface,
                        pushEnabled ? masterCardEnabledStyle : masterCardDisabledStyle,
                    ]}
                >
                    <View style={styles.masterRow}>
                        <View
                            style={[
                                styles.masterIconCircle,
                                pushEnabled ? masterIconEnabledStyle : masterIconDisabledStyle,
                            ]}
                        >
                            <MaterialIcons
                                name="notifications-active"
                                size={24}
                                color={pushEnabled ? theme.success : theme.textPlaceholder}
                            />
                        </View>
                        <View style={styles.masterContent}>
                            <Text style={[styles.masterTitle, { color: theme.textPrimary }]}>
                                {t("notificationPreferencesScreen.master.title")}
                            </Text>
                            <Text style={[styles.masterDesc, { color: theme.textTertiary }]}>
                                {pushEnabled
                                    ? t("notificationPreferencesScreen.master.enabled")
                                    : t("notificationPreferencesScreen.master.disabled")}
                            </Text>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={handleTogglePush}
                            disabled={!user || patchUser.isPending}
                            trackColor={preferenceTrackColor}
                            thumbColor={pushEnabled ? Colors.primary : tokens.textInverse}
                            ios_backgroundColor={tokens.borderSubtle}
                        />
                    </View>
                    {!pushEnabled && (
                        <TouchableOpacity
                            style={styles.enableButton}
                            onPress={() => {
                                void handleTogglePush(true);
                            }}
                            disabled={!user || patchUser.isPending}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.enableButtonText}>
                                {t("notificationPreferencesScreen.actions.enable")}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {pushEnabled && (
                        <TouchableOpacity
                            style={[styles.manageButton, manageButtonStyle]}
                            onPress={handleOpenAppSettings}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[styles.manageButtonText, { color: theme.textSecondary }]}
                            >
                                {t("notificationPreferencesScreen.actions.manageSystem")}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
                    {t("notificationPreferencesScreen.sections.categories")}
                </Text>
                <View style={styles.prefList}>
                    <PreferenceRow
                        icon="chat-bubble"
                        iconColor="#3B82F6"
                        label={t("notificationPreferencesScreen.categories.messages.label")}
                        description={t("notificationPreferencesScreen.categories.messages.description")}
                        value={prefs.messages}
                        onToggle={toggleMessages}
                        disabled={!pushEnabled}
                    />
                    <PreferenceRow
                        icon="local-offer"
                        iconColor="#F59E0B"
                        label={t("notificationPreferencesScreen.categories.promotions.label")}
                        description={t("notificationPreferencesScreen.categories.promotions.description")}
                        value={prefs.promotions}
                        onToggle={togglePromotions}
                        disabled={!pushEnabled}
                    />
                    <PreferenceRow
                        icon="notifications"
                        iconColor="#8B5CF6"
                        label={t("notificationPreferencesScreen.categories.system.label")}
                        description={t("notificationPreferencesScreen.categories.system.description")}
                        value={prefs.system}
                        onToggle={toggleSystem}
                        disabled={!pushEnabled}
                    />
                </View>
            </View>

            {!pushEnabled && (
                <View style={styles.disabledNote}>
                    <MaterialIcons
                        name="info-outline"
                        size={16}
                        color={theme.warningText}
                    />
                    <Text style={[styles.disabledNoteText, { color: theme.warningText }]}>
                        {t("notificationPreferencesScreen.disabledNote")}
                    </Text>
                </View>
            )}

            <View style={{ height: 32 }} />
        </ScreenContainer>
    );
}

const makeStyles = (tokens: ThemeTokens) =>
    StyleSheet.create({
    section: {
        marginTop: 20,
    },
    sectionLabel: {
        fontFamily: FontFamily.semiBold,
        fontSize: 12,
        letterSpacing: 0.6,
        marginBottom: 10,
        marginLeft: 4,
    },
    masterCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        gap: 14,
    },
    masterCardSurface: {
        backgroundColor: tokens.surfaceContainerLowest,
        ...ambientShadow,
    },
    masterRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    masterIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    masterContent: {
        flex: 1,
        gap: 2,
    },
    masterTitle: {
        fontFamily: FontFamily.semiBold,
        fontSize: 17,
    },
    masterDesc: {
        fontFamily: FontFamily.regular,
        fontSize: 13,
    },
    enableButton: {
        borderRadius: 9999,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
        backgroundColor: Colors.primary,
    },
    enableButtonText: {
        fontFamily: FontFamily.semiBold,
        color: tokens.textInverse,
        fontSize: 15,
    },
    manageButton: {
        borderRadius: 9999,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
        backgroundColor: tokens.surfaceContainerLowest,
    },
    manageButtonText: {
        fontFamily: FontFamily.semiBold,
        fontSize: 14,
    },
    prefList: {
        gap: 10,
    },
    prefRow: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
    },
    prefRowSurface: {
        backgroundColor: tokens.surfaceContainerLowest,
        borderColor: tokens.borderDefault,
        ...ambientShadow,
    },
    prefIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    prefContent: {
        flex: 1,
        gap: 2,
    },
    prefLabel: {
        fontFamily: FontFamily.semiBold,
        fontSize: 15,
    },
    prefLabelEnabled: {
        color: tokens.textPrimary,
    },
    prefLabelDisabled: {
        color: tokens.textPlaceholder,
    },
    prefDesc: {
        fontFamily: FontFamily.regular,
        fontSize: 12,
    },
    prefDescMuted: {
        color: tokens.textTertiary,
    },
    disabledNote: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        backgroundColor: tokens.warningBg,
        borderRadius: 16,
        padding: 12,
        marginTop: 16,
        ...ambientShadow,
    },
    disabledNoteText: {
        fontFamily: FontFamily.regular,
        fontSize: 13,
        flex: 1,
    },
});
