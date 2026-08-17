import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { ScheduleAgendaList } from '@/components/schedules/ScheduleAgendaList';
import { ScheduleFilterBottomSheet, ScheduleFilterValues } from '@/components/bottom-sheets/ScheduleFilterBottomSheet';
import { CalendarSessionPreviewBottomSheet } from '@/components/bottom-sheets/CalendarSessionPreviewBottomSheet';
import { Session } from '@/types';
import { useAllSchedules } from '@/hooks/useSchedules';
import { WifiOff } from 'lucide-react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CalendarScreenProps {
  onNavigateToSession: (sessionId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onNavigateToSession }) => {
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

    // Search
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

  const courses = useMemo(
    () => [...new Map(rawSessions.map((s) => [s.course.id, s.course])).values()],
    [rawSessions]
  );

  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) + (filters.courseId ? 1 : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>Your full term schedule</Text>
          </View>
          {isOffline ? (
            <View style={styles.offlinePill}>
              <WifiOff size={12} color={colors.warning} />
              <Text style={styles.offlinePillText}>Offline</Text>
            </View>
          ) : null}
        </View>

        {/* Search + filter row */}
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

        {/* Session list */}
        <View style={styles.listWrapper}>
          <ScheduleAgendaList
            sessions={filteredSessions}
            isLoading={isLoading}
            isError={isError}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
            onSessionPress={(s) => {
              setPreviewSession(s);
            }}
            emptyMessage="No sessions match your filters."
          />
        </View>
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
  listWrapper: {
    flex: 1,
  },
});
