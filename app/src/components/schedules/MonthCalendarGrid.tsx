import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  PanResponder,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Session, SessionStatus } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getStatusColor(status: SessionStatus): string {
  switch (status) {
    case 'scheduled':
    case 'held':
      return colors.primary; // Green (#10B981)
    case 'not_held':
    case 'cancelled':
      return colors.danger;  // Red (#EF4444)
    case 'postponed':
      return colors.info;    // Blue (#3B82F6)
    case 'shifted':
      return colors.warning; // Orange (#F59E0B)
    default:
      return colors.primary;
  }
}

export interface DayGridCell {
  dateStr: string;      // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: Session[];
}

export interface MonthCalendarGridProps {
  sessions: Session[];
  selectedDate: string;  // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onMonthChange?: (year: number, month: number) => void;
}

export const MonthCalendarGrid: React.FC<MonthCalendarGridProps> = ({
  sessions,
  selectedDate,
  onSelectDate,
  onMonthChange,
}) => {
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  // Current view month/year state
  const [viewYear, setViewYear] = useState<number>(todayObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(todayObj.getMonth());

  // Bounded semester window: 3 months (previous month, current month, next month)
  const baseMonthIndex = useMemo(() => todayObj.getFullYear() * 12 + todayObj.getMonth(), []);
  const currentMonthIndex = viewYear * 12 + viewMonth;

  const canGoPrev = currentMonthIndex > baseMonthIndex - 1;
  const canGoNext = currentMonthIndex < baseMonthIndex + 1;

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    let newM = viewMonth - 1;
    let newY = viewYear;
    if (newM < 0) {
      newM = 11;
      newY -= 1;
    }
    setViewMonth(newM);
    setViewYear(newY);
    onMonthChange?.(newY, newM);
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    let newM = viewMonth + 1;
    let newY = viewYear;
    if (newM > 11) {
      newM = 0;
      newY += 1;
    }
    setViewMonth(newM);
    setViewYear(newY);
    onMonthChange?.(newY, newM);
  };

  // PanResponder for horizontal swipe gesture to change months
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 25 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          handleNextMonth();
        } else if (gestureState.dx > 50) {
          handlePrevMonth();
        }
      },
    })
  ).current;

  // Pre-index sessions by date for fast lookup
  const sessionsByDate = useMemo(() => {
    const map: Record<string, Session[]> = {};
    sessions.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [sessions]);

  // Compute 7-column grid layout for current view month
  const gridCells = useMemo<DayGridCell[]>(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    
    // First day of month: Mon=0, Tue=1, ..., Sun=6
    let firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    firstDayIndex = (firstDayIndex + 6) % 7;

    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const cells: DayGridCell[] = [];

    // Previous month padding cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const pMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const pYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        sessions: sessionsByDate[dateStr] || [],
      });
    }

    // Current month cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        sessions: sessionsByDate[dateStr] || [],
      });
    }

    // Next month padding cells to fill remaining row(s) to multiple of 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        sessions: sessionsByDate[dateStr] || [],
      });
    }

    return cells;
  }, [viewYear, viewMonth, sessionsByDate, todayStr]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Month Header Navigation */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={handlePrevMonth}
          disabled={!canGoPrev}
          style={({ pressed }) => [
            styles.arrowBtn,
            !canGoPrev && styles.arrowDisabled,
            pressed && canGoPrev && styles.arrowPressed,
          ]}
          hitSlop={12}
        >
          <ChevronLeft size={20} color={canGoPrev ? colors.textMain : colors.textMuted} />
        </Pressable>

        <Text style={styles.monthTitle}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>

        <Pressable
          onPress={handleNextMonth}
          disabled={!canGoNext}
          style={({ pressed }) => [
            styles.arrowBtn,
            !canGoNext && styles.arrowDisabled,
            pressed && canGoNext && styles.arrowPressed,
          ]}
          hitSlop={12}
        >
          <ChevronRight size={20} color={canGoNext ? colors.textMain : colors.textMuted} />
        </Pressable>
      </View>

      {/* Weekday Labels (Mon - Sun) */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {gridCells.map((cell) => {
          const isSelected = cell.dateStr === selectedDate;
          const displaySessions = cell.sessions.slice(0, 3); // Max 3 dots

          return (
            <Pressable
              key={cell.dateStr}
              onPress={() => onSelectDate(cell.dateStr)}
              style={({ pressed }) => [
                styles.dayCell,
                !cell.isCurrentMonth && styles.dayCellOutside,
                isSelected && styles.dayCellSelected,
                pressed && styles.dayCellPressed,
              ]}
            >
              {/* Day Number */}
              <View style={[styles.dayNumWrapper, cell.isToday && !isSelected && styles.todayNumWrapper]}>
                <Text
                  style={[
                    styles.dayNumText,
                    !cell.isCurrentMonth && styles.dayNumTextOutside,
                    cell.isToday && !isSelected && styles.todayNumText,
                    isSelected && styles.selectedNumText,
                  ]}
                >
                  {cell.dayNumber}
                </Text>
              </View>

              {/* Status Dots (Max 3) */}
              <View style={styles.dotsRow}>
                {displaySessions.map((s, idx) => (
                  <View
                    key={`${s.id}-${idx}`}
                    style={[
                      styles.dot,
                      { backgroundColor: getStatusColor(s.status) },
                    ]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  arrowPressed: {
    opacity: 0.7,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 columns
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
    paddingVertical: 2,
  },
  dayCellOutside: {
    opacity: 0.35,
  },
  dayCellSelected: {
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayCellPressed: {
    opacity: 0.8,
  },
  dayNumWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayNumWrapper: {
    backgroundColor: colors.primary,
  },
  dayNumText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
  dayNumTextOutside: {
    color: colors.textMuted,
  },
  todayNumText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  selectedNumText: {
    color: colors.primary,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 2,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
