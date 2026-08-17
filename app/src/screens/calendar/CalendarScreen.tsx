import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  PanResponder,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  SlidersHorizontal,
  WifiOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { MonthCalendarGrid } from '@/components/schedules/MonthCalendarGrid';
import { ScheduleAgendaList } from '@/components/schedules/ScheduleAgendaList';
import { ScheduleFilterBottomSheet, ScheduleFilterValues } from '@/components/bottom-sheets/ScheduleFilterBottomSheet';
import { CalendarSessionPreviewBottomSheet } from '@/components/bottom-sheets/CalendarSessionPreviewBottomSheet';
import { Session } from '@/types';
import { useAllSchedules } from '@/hooks/useSchedules';

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDateHeaderLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const same =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const formatted = d.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return same ? `Today · ${formatted}` : formatted;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CalendarScreenProps {
  onNavigateToSession: (sessionId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onNavigateToSession }) => {
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [previewSession, setPreviewSession] = useState<Session | null>(null);
  const [filters, setFilters] = useState<ScheduleFilterValues>({
    status: 'all',
    courseId: null,
  });

  const {
    sessions: rawSessions,
    isLoading,
    isRefreshing,
    isError,
    isOffline,
    refetch,
  } = useAllSchedules();

  // Filter all sessions by course & status filters and search query
  const filteredSessions = useMemo(() => {
    let result = [...rawSessions];

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((s) => s.status === filters.status);
    }

    // Course filter
    if (filters.courseId) {
      result = result.filter((s) => s.course.id === filters.courseId);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.course.code.toLowerCase().includes(q) ||
          s.course.title.toLowerCase().includes(q) ||
          s.venue.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [rawSessions, filters, searchQuery]);

  // Day specific sessions for the selected date
  const selectedDaySessions = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredSessions;
    }
    return filteredSessions.filter((s) => s.date === selectedDate);
  }, [filteredSessions, selectedDate, searchQuery]);

  const courses = useMemo(
    () => [...new Map(rawSessions.map((s) => [s.course.id, s.course])).values()],
    [rawSessions]
  );

  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) + (filters.courseId ? 1 : 0);

  // Day navigation actions
  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  // PanResponder for day list horizontal swipe (Swipe left -> next day, Swipe right -> prev day)
  const daySwipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          handleNextDay();
        } else if (gestureState.dx > 50) {
          handlePrevDay();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>Semester schedule & month grid</Text>
          </View>
          {isOffline ? (
            <View style={styles.offlinePill}>
              <WifiOff size={12} color={colors.warning} />
              <Text style={styles.offlinePillText}>Offline</Text>
            </View>
          ) : null}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Standalone Month Calendar Grid */}
          <MonthCalendarGrid
            sessions={filteredSessions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Search + filter bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchWrapper}>
              <Search size={16} color={colors.textSubtle} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search course, venue…"
                placeholderTextColor={colors.textSubtle}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
            <Pressable
              onPress={() => setFilterVisible(true)}
              style={({ pressed }) => [
                styles.filterBtn,
                activeFilterCount > 0 && styles.filterBtnActive,
                pressed && styles.filterBtnPressed,
              ]}
            >
              <SlidersHorizontal
                size={18}
                color={activeFilterCount > 0 ? colors.primary : colors.textMuted}
              />
              {activeFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          {/* Day Schedule Header & Navigation Controls */}
          {!searchQuery.trim() ? (
            <View style={styles.dayNavHeader}>
              <Pressable onPress={handlePrevDay} style={styles.dayArrowBtn} hitSlop={12}>
                <ChevronLeft size={18} color={colors.textMain} />
              </Pressable>
              <Text style={styles.dayNavTitle}>{formatDateHeaderLabel(selectedDate)}</Text>
              <Pressable onPress={handleNextDay} style={styles.dayArrowBtn} hitSlop={12}>
                <ChevronRight size={18} color={colors.textMain} />
              </Pressable>
            </View>
          ) : null}

          {/* Day Schedule Agenda Display with Horizontal Swipe gesture support */}
          <View style={styles.agendaWrapper} {...daySwipeResponder.panHandlers}>
            <ScheduleAgendaList
              sessions={selectedDaySessions}
              isLoading={isLoading}
              isError={isError}
              isRefreshing={isRefreshing}
              onRefresh={refetch}
              onSessionPress={(s) => {
                setPreviewSession(s);
              }}
              emptyMessage={
                searchQuery.trim()
                  ? 'No sessions match your search query.'
                  : 'No sessions scheduled for this date.'
              }
            />
          </View>
        </ScrollView>
      </View>

      {/* Filter sheet */}
      <ScheduleFilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        initialValues={filters}
        courses={courses}
        onApply={setFilters}
      />

      {/* Preview sheet */}
      <CalendarSessionPreviewBottomSheet
        visible={!!previewSession}
        onClose={() => setPreviewSession(null)}
        session={previewSession}
        onViewDetails={() => previewSession && onNavigateToSession(previewSession.id)}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '600',
    marginTop: 2,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    marginTop: 4,
  },
  offlinePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textMain,
    fontSize: 14,
    fontFamily: 'Source',
    height: '100%',
    paddingVertical: 0,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  filterBtnPressed: {
    opacity: 0.8,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  dayNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayNavTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  agendaWrapper: {
    minHeight: 200,
  },
});
