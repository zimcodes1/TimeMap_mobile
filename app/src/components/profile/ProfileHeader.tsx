import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Badge } from '@/components/ui/Badge';
import { UserProfile, UserRole } from '@/types';

// ─── Role → badge config ─────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; variant: 'primary' | 'info' | 'warning' | 'secondary' }
> = {
  student:    { label: 'Student',    variant: 'secondary' },
  class_rep:  { label: 'Class Rep',  variant: 'primary' },
  lecturer:   { label: 'Lecturer',   variant: 'info' },
  admin:      { label: 'Admin',      variant: 'warning' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProfileHeaderProps {
  profile: UserProfile;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const roleConfig = ROLE_CONFIG[profile.role];
  const identifier = profile.matricNumber ?? profile.staffId ?? '—';

  return (
    <View style={styles.container}>
      {/* Avatar circle */}
      <View style={styles.avatarRing}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(profile.fullName)}</Text>
        </View>
      </View>

      {/* Name & role */}
      <Text style={styles.name}>{profile.fullName}</Text>
      <View style={styles.badgeRow}>
        <Badge variant={roleConfig.variant}>{roleConfig.label}</Badge>
      </View>

      {/* ID / matric */}
      <Text style={styles.identifier}>{identifier}</Text>

      {/* Department / level */}
      <View style={styles.deptRow}>
        <Text style={styles.dept}>{profile.department}</Text>
        {profile.level ? (
          <>
            <View style={styles.dot} />
            <Text style={styles.dept}>{profile.level}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 3,
    marginBottom: 14,
  },
  avatar: {
    flex: 1,
    borderRadius: 42,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    marginBottom: 8,
  },
  identifier: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dept: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
});
