import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { SessionStatus } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { key: SessionStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'shifted',   label: 'Shifted' },
  { key: 'postponed', label: 'Postponed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'held',      label: 'Held' },
  { key: 'not_held',  label: 'Not Held' },
];

export interface ScheduleFilterValues {
  status: SessionStatus | 'all';
  courseId: string | null;
}

export interface ScheduleFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  initialValues: ScheduleFilterValues;
  courses?: { id: string; code: string; title: string }[];
  onApply: (values: ScheduleFilterValues) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ScheduleFilterBottomSheet: React.FC<ScheduleFilterBottomSheetProps> = ({
  visible,
  onClose,
  initialValues,
  courses = [],
  onApply,
}) => {
  const [status, setStatus] = useState<SessionStatus | 'all'>(initialValues.status);
  const [courseId, setCourseId] = useState<string | null>(initialValues.courseId);

  const handleApply = () => {
    onApply({ status, courseId });
    onClose();
  };

  const handleReset = () => {
    setStatus('all');
    setCourseId(null);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Schedule">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status filter */}
        <Text style={styles.groupLabel}>Status</Text>
        <View style={styles.chipWrap}>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = status === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setStatus(opt.key)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Course filter */}
        {courses.length > 0 ? (
          <>
            <Text style={[styles.groupLabel, { marginTop: 16 }]}>Course</Text>
            <View style={styles.chipWrap}>
              <Pressable
                onPress={() => setCourseId(null)}
                style={[styles.chip, courseId === null && styles.chipActive]}
              >
                <Text style={[styles.chipText, courseId === null && styles.chipTextActive]}>
                  All Courses
                </Text>
              </Pressable>
              {courses.map((c) => {
                const isActive = courseId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCourseId(c.id)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {c.code}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="primary" size="lg" onPress={handleApply}>
            Apply Filters
          </Button>
          <Button variant="ghost" size="md" onPress={handleReset}>
            Reset
          </Button>
        </View>
      </ScrollView>
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
