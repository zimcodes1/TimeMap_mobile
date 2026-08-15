import React from 'react';
import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { SessionStatus } from '@/types';

// ─── Filter option shape ───────────────────────────────────────────────────────

interface FilterChip {
  key: SessionStatus | 'all';
  label: string;
}

export const STATUS_FILTERS: FilterChip[] = [
  { key: 'all',       label: 'All' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'shifted',   label: 'Shifted' },
  { key: 'postponed', label: 'Postponed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'held',      label: 'Held' },
  { key: 'not_held',  label: 'Not Held' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StatusFilterChipsProps {
  selected: SessionStatus | 'all';
  onSelect: (status: SessionStatus | 'all') => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StatusFilterChips: React.FC<StatusFilterChipsProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STATUS_FILTERS.map((chip) => {
          const isActive = selected === chip.key;
          return (
            <Pressable
              key={chip.key}
              onPress={() => onSelect(chip.key)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
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
});
