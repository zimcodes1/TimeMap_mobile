import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { UserProfile } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AccountDetailsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

// ─── Detail row (internal) ────────────────────────────────────────────────────

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const AccountDetailsBottomSheet: React.FC<AccountDetailsBottomSheetProps> = ({
  visible,
  onClose,
  profile,
}) => {
  if (!profile) return null;

  const roleLabel =
    profile.role === 'class_rep'
      ? 'Class Representative'
      : profile.role === 'lecturer'
      ? 'Lecturer'
      : profile.role === 'admin'
      ? 'Admin'
      : 'Student';

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Account Details" subtitle="Your profile information">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {profile.fullName ? <DetailRow label="Full Name" value={profile.fullName} /> : null}
          {profile.email ? <DetailRow label="Email" value={profile.email} /> : null}
          {profile.matricNumber ? <DetailRow label="Matric Number" value={profile.matricNumber} /> : null}
          {profile.staffId ? <DetailRow label="Staff ID" value={profile.staffId} /> : null}
          <DetailRow label="Role" value={roleLabel} />
          <DetailRow label="Department" value={profile.department} />
          {profile.level ? <DetailRow label="Level" value={profile.level} /> : null}
        </View>

        <Text style={styles.note}>
          To update your profile details, contact your institution's administrator.
        </Text>
      </ScrollView>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: colors.textMain,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  note: {
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
    fontWeight: '600',
  },
});
