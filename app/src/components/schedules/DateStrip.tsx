import React, { useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

function buildDays(centreDate: Date, range = 14): Date[] {
  const days: Date[] = [];
  for (let i = -3; i < range - 3; i++) {
    const d = new Date(centreDate);
    d.setDate(centreDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fmtDate(d: Date) {
  return d.toISOString().split('T')[0];
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DateStripProps {
  selectedDate: string;       // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  /** Show a dot under dates that have sessions */
  activeDates?: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onDateSelect,
  activeDates = [],
}) => {
  const today = new Date();
  const days = buildDays(today);
  const scrollRef = useRef<ScrollView>(null);
  const activeSet = new Set(activeDates);

  // Scroll so today's pill is roughly centred on mount
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 3 * 72, animated: false });
    }, 80);
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* Month label */}
      <Text style={styles.monthLabel}>
        {MONTH_LABELS[today.getMonth()]} {today.getFullYear()}
      </Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => {
          const dateStr = fmtDate(day);
          const isSelected = dateStr === selectedDate;
          const isToday = isSameDay(day, today);
          const hasSession = activeSet.has(dateStr);

          return (
            <Pressable
              key={dateStr}
              onPress={() => onDateSelect(dateStr)}
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
                isToday && !isSelected && styles.pillToday,
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.textSelected,
                  isToday && !isSelected && styles.textToday,
                ]}
              >
                {DAY_LABELS[day.getDay()]}
              </Text>
              <Text
                style={[
                  styles.dateNum,
                  isSelected && styles.textSelected,
                  isToday && !isSelected && styles.textToday,
                ]}
              >
                {day.getDate()}
              </Text>
              {hasSession && (
                <View style={[styles.dot, isSelected && styles.dotSelected]} />
              )}
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
  monthLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  pill: {
    width: 52,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillToday: {
    borderColor: colors.primary,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSubtle,
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMain,
  },
  textSelected: {
    color: '#ffffff',
  },
  textToday: {
    color: colors.primary,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
