import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/ui/Button';
import { MOCK_NOTIFICATIONS } from '@/constants/mockData';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface NotificationResolverScreenProps {
  notificationId: string;
  onBack: () => void;
  onNavigateToSession: (sessionId: string) => void;
  onNavigateToReport: (reportId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationResolverScreen: React.FC<NotificationResolverScreenProps> = ({
  notificationId,
  onBack,
  onNavigateToSession,
  onNavigateToReport,
}) => {
  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);

  useEffect(() => {
    if (!notification) return;

    // TODO(api-wiring): POST /api/notifications/inbox/{id}/read/
    // Mark as read then resolve
    const timer = setTimeout(() => {
      if (notification.relatedModel === 'LectureSession' && notification.relatedId) {
        onNavigateToSession(notification.relatedId);
      } else if (notification.relatedModel === 'ClassRepReport' && notification.relatedId) {
        onNavigateToReport(notification.relatedId);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // If there's no related record or the model is unsupported, show fallback
  const hasDeepLink =
    notification?.relatedModel &&
    notification?.relatedId &&
    (notification.relatedModel === 'LectureSession' ||
     notification.relatedModel === 'ClassRepReport');

  if (!notification) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textMain} />
          </Pressable>
          <View style={styles.centreState}>
            <AlertTriangle size={40} color={colors.danger} />
            <Text style={styles.stateTitle}>Notification not found</Text>
            <Text style={styles.stateBody}>
              This notification may have been deleted or is no longer accessible.
            </Text>
            <Button variant="secondary" size="md" onPress={onBack} style={styles.backButtonBottom} fullWidth={false}>
              Go Back
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (hasDeepLink) {
    // Auto-resolving — show loading while we redirect
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.centreState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateTitle}>Opening…</Text>
            <Text style={styles.stateBody}>{notification.title}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Unsupported deep-link — show notification content as fallback
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textMain} />
          </Pressable>
          <Text style={styles.navTitle}>Notification</Text>
          <View style={styles.navSpacer} />
        </View>

        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackTitle}>{notification.title}</Text>
          <Text style={styles.fallbackBody}>{notification.body}</Text>
          <Button variant="secondary" size="md" onPress={onBack} fullWidth={false}>
            Go Back
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.textMain },
  navSpacer: { width: 36 },
  centreState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 12,
  },
  stateTitle: { fontSize: 18, fontWeight: '700', color: colors.textMain, textAlign: 'center' },
  stateBody: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, fontWeight: '600' },
  backButtonBottom: { marginTop: 8 },
  fallbackContent: {
    flex: 1, padding: 24, gap: 12,
  },
  fallbackTitle: { fontSize: 20, fontWeight: '700', color: colors.textMain, marginBottom: 4 },
  fallbackBody: { fontSize: 15, color: colors.textMuted, lineHeight: 22, fontWeight: '600', flex: 1 },
});
