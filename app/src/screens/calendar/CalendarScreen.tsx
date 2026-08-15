import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
} from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { ScheduleAgendaList } from '@/components/schedules/ScheduleAgendaList';
import { ScheduleFilterBottomSheet, ScheduleFilterValues } from '@/components/bottom-sheets/ScheduleFilterBottomSheet';
import { CalendarSessionPreviewBottomSheet } from '@/components/bottom-sheets/CalendarSessionPreviewBottomSheet';
import { Session } from '@/types';
import { MOCK_SESSIONS } from '@/constants/mockData';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CalendarScreenProps {
  onNavigateToSession: (sessionId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onNavigateToSession }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [previewSession, setPreviewSession] = useState<Session | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<ScheduleFilterValues>({
    status: 'all',
    courseId: null,
  });

  const sessions = useMemo(() => {
    let result = [...MOCK_SESSIONS];

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
  }, [filters, searchQuery]);

  const courses = useMemo(
    () => [...new Map(MOCK_SESSIONS.map((s) => [s.course.id, s.course])).values()],
    []
  );

  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) + (filters.courseId ? 1 : 0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // TODO(api-wiring): refetch session list
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Your full term schedule</Text>
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
            sessions={sessions}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
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
