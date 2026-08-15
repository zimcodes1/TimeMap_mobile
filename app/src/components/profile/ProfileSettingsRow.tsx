import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProfileSettingsRowProps {
  /** Icon element from lucide-react-native */
  icon: React.ReactNode;
  label: string;
  description?: string;
  /** Rendered on the right side instead of a chevron */
  rightElement?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  /** If true, renders as a static row (no press feedback, no chevron) */
  isStatic?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProfileSettingsRow: React.FC<ProfileSettingsRowProps> = ({
  icon,
  label,
  description,
  rightElement,
  onPress,
  destructive = false,
  isStatic = false,
}) => {
  const labelColor = destructive ? colors.danger : colors.textMain;

  const inner = (
    <View style={styles.inner}>
      <View style={[styles.iconBox, destructive && styles.iconBoxDestructive]}>
        {icon}
      </View>
      <View style={styles.labelGroup}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {rightElement ?? (
          isStatic ? null : <ChevronRight size={18} color={colors.textSubtle} />
        )}
      </View>
    </View>
  );

  if (isStatic || !onPress) {
    return <View style={styles.row}>{inner}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {inner}
    </Pressable>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxDestructive: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  labelGroup: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 1,
    fontWeight: '600',
  },
  right: {
    flexShrink: 0,
  },
});
