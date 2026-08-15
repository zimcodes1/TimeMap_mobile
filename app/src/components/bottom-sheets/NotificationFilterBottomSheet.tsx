import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { NotificationType } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { key: NotificationType | 'all'; label: string }[] = [
  { key: 'all',                 label: 'All Types' },
  { key: 'schedule_change',     label: 'Schedule' },
  { key: 'report_submitted',    label: 'Reports' },
  { key: 'report_responded',    label: 'Responses' },
  { key: 'window_reminder',     label: 'Reminders' },
  { key: 'session_unreported',  label: 'Alerts' },
  { key: 'discrepancy_approved',label: 'Approvals' },
  { key: 'discrepancy_rejected',label: 'Rejections' },
];

export interface NotificationFilterValues {
  type: NotificationType | 'all';
  unreadOnly: boolean;
}

export interface NotificationFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  initialValues: NotificationFilterValues;
  onApply: (values: NotificationFilterValues) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationFilterBottomSheet: React.FC<NotificationFilterBottomSheetProps> = ({
  visible,
  onClose,
  initialValues,
  onApply,
}) => {
  const [type, setType] = useState<NotificationType | 'all'>(initialValues.type);
  const [unreadOnly, setUnreadOnly] = useState(initialValues.unreadOnly);

  const handleApply = () => {
    onApply({ type, unreadOnly });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Notifications">
      {/* Type chips */}
      <Text style={styles.groupLabel}>Type</Text>
      <View style={styles.chipWrap}>
        {TYPE_OPTIONS.map((opt) => {
          const isActive = type === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setType(opt.key)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Unread toggle */}
      <Text style={[styles.groupLabel, { marginTop: 20 }]}>Read State</Text>
      <View style={styles.readToggleRow}>
        <Pressable
          onPress={() => setUnreadOnly(false)}
          style={[styles.chip, !unreadOnly && styles.chipActive]}
        >
          <Text style={[styles.chipText, !unreadOnly && styles.chipTextActive]}>All</Text>
        </Pressable>
        <Pressable
          onPress={() => setUnreadOnly(true)}
          style={[styles.chip, unreadOnly && styles.chipActive]}
        >
          <Text style={[styles.chipText, unreadOnly && styles.chipTextActive]}>Unread only</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Button variant="primary" size="lg" onPress={handleApply}>
          Apply
        </Button>
        <Button variant="ghost" size="md" onPress={() => { setType('all'); setUnreadOnly(false); }}>
          Reset
        </Button>
      </View>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  readToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
  },
  actions: {
    marginTop: 24,
    gap: 8,
  },
});
