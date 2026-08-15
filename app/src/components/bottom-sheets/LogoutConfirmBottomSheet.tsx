import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LogOut, AlertTriangle } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LogoutConfirmBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /**
   * TODO(api-wiring): clear expo-secure-store tokens and auth context,
   * then deactivate push token via POST /api/notifications/devices/deactivate/.
   */
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LogoutConfirmBottomSheet: React.FC<LogoutConfirmBottomSheetProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoggingOut = false,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <AlertTriangle size={28} color={colors.danger} />
        </View>

        {/* Copy */}
        <Text style={styles.title}>Log out?</Text>
        <Text style={styles.description}>
          You'll be signed out of your TimeMap account on this device. Your schedule data will
          reload when you log back in.
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            variant="danger"
            size="lg"
            leftIcon={<LogOut size={18} color="#fff" />}
            onPress={onConfirm}
            isLoading={isLoggingOut}
          >
            Log Out
          </Button>
          <Button variant="ghost" size="md" onPress={onClose} disabled={isLoggingOut}>
            Cancel
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(239,68,68,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: 24,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: 8,
  },
});
