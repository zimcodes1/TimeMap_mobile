import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Info, GraduationCap, FileText, Bell } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RoleHelpBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Info row (internal) ─────────────────────────────────────────────────────

const InfoRow: React.FC<{ Icon: React.ElementType; text: string }> = ({ Icon, text }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Icon size={16} color={colors.info} />
    </View>
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const RoleHelpBottomSheet: React.FC<RoleHelpBottomSheetProps> = ({
  visible,
  onClose,
}) => {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="About Reporting"
      subtitle="Why can't I submit a report?"
    >
      <View style={styles.iconCircle}>
        <Info size={28} color={colors.info} />
      </View>

      <Text style={styles.lead}>
        Lecture report submission is only available to <Text style={styles.bold}>Class Representatives</Text>.
      </Text>

      <View style={styles.itemList}>
        <InfoRow
          Icon={GraduationCap}
          text="Students can view their timetable and session details, but cannot submit reports."
        />
        <InfoRow
          Icon={FileText}
          text="Only the designated class rep for a course can file a held/not-held report during the open window."
        />
        <InfoRow
          Icon={Bell}
          text="You'll still receive notifications about schedule changes and report outcomes."
        />
      </View>

      <Text style={styles.footer}>
        If you believe you should have class rep access, contact your department or the admin portal.
      </Text>

      <Button variant="secondary" size="lg" onPress={onClose} style={styles.closeBtn}>
        Got it
      </Button>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59,130,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  lead: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  bold: {
    color: colors.textMain,
    fontWeight: '700',
  },
  itemList: {
    gap: 14,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  infoText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    flex: 1,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
    fontWeight: '600',
  },
  closeBtn: {
    marginBottom: 4,
  },
});
