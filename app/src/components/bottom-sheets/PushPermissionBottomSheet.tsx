import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bell, Shield, Zap } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PushPermissionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /**
   * TODO(api-wiring): trigger expo-notifications.requestPermissionsAsync(),
   * then register token via POST /api/notifications/devices/.
   */
  onEnable: () => void;
  isEnabling?: boolean;
}

// ─── Benefit row (internal) ──────────────────────────────────────────────────

const BenefitRow: React.FC<{ Icon: React.ElementType; text: string }> = ({ Icon, text }) => (
  <View style={styles.benefitRow}>
    <View style={styles.benefitIcon}>
      <Icon size={16} color={colors.primary} />
    </View>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const PushPermissionBottomSheet: React.FC<PushPermissionBottomSheetProps> = ({
  visible,
  onClose,
  onEnable,
  isEnabling = false,
}) => {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Stay in the Loop"
      subtitle="Enable push notifications to get real-time updates."
    >
      {/* Illustration area */}
      <View style={styles.illustrationArea}>
        <View style={styles.bellCircle}>
          <Bell size={36} color={colors.primary} />
        </View>
      </View>

      {/* Benefits */}
      <View style={styles.benefits}>
        <BenefitRow
          Icon={Zap}
          text="Instant alerts when a session is shifted, postponed, or cancelled."
        />
        <BenefitRow
          Icon={Bell}
          text="Reminders when the class-rep report window is about to close."
        />
        <BenefitRow
          Icon={Shield}
          text="Notifications stay local — no unnecessary data is shared."
        />
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          onPress={onEnable}
          isLoading={isEnabling}
        >
          Enable Notifications
        </Button>
        <Button variant="ghost" size="md" onPress={onClose}>
          Maybe Later
        </Button>
      </View>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  illustrationArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  bellCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefits: {
    gap: 14,
    marginVertical: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  benefitText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    flex: 1,
    fontWeight: '600',
  },
  actions: {
    gap: 8,
  },
});
