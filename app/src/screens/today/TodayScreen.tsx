import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { DateStrip } from '@/components/schedules/DateStrip';
import { StatusFilterChips } from '@/components/schedules/StatusFilterChips';
import { ScheduleAgendaList } from '@/components/schedules/ScheduleAgendaList';
import { SessionQuickActionsBottomSheet } from '@/components/bottom-sheets/SessionQuickActionsBottomSheet';
import { SubmitReportBottomSheet } from '@/components/bottom-sheets/SubmitReportBottomSheet';
import { Session, SessionStatus } from '@/types';
import { MOCK_SESSIONS, MOCK_PROFILE } from '@/constants/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function greetingFor(name: string): string {
  const hr = new Date().getHours();
  const salutation = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = name.split(' ')[0];
  return `${salutation}, ${firstName}`;
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TodayScreenProps {
  onNavigateToSession: (sessionId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TodayScreen: React.FC<TodayScreenProps> = ({ onNavigateToSession }) => {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [submitReportVisible, setSubmitReportVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeDates = useMemo(
    () => [...new Set(MOCK_SESSIONS.map((s) => s.date))],
    []
  );

  const filteredSessions = useMemo(() => {
    const dateFiltered = MOCK_SESSIONS.filter((s) => s.date === selectedDate);
    if (statusFilter === 'all') return dateFiltered;
    return dateFiltered.filter((s) => s.status === statusFilter);
  }, [selectedDate, statusFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // TODO(api-wiring): refetch sessions for selectedDate
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleMorePress = (session: Session) => {
    setSelectedSession(session);
    setQuickActionsVisible(true);
  };

  const handleSubmitReport = (payload: { lectureSession: string; held: boolean; reason: string }) => {
    // TODO(api-wiring): call POST /api/reporting/reports/
    console.log('Submit report:', payload);
    setSubmitReportVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greetingFor(MOCK_PROFILE.fullName)}</Text>
            <Text style={styles.dateLabel}>{formatDateDisplay(selectedDate)}</Text>
          </View>
          <Pressable style={styles.filterBtn} onPress={() => {}}>
            <SlidersHorizontal size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Date strip */}
        <View style={styles.dateStripWrapper}>
          <DateStrip
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            activeDates={activeDates}
          />
        </View>

        {/* Status filters */}
        <View style={styles.filterChipsWrapper}>
          <StatusFilterChips selected={statusFilter} onSelect={setStatusFilter} />
        </View>

        {/* Sessions list */}
        <View style={styles.listWrapper}>
          <ScheduleAgendaList
            sessions={filteredSessions}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onSessionPress={(s) => onNavigateToSession(s.id)}
            onSessionMorePress={handleMorePress}
            emptyMessage={`No ${statusFilter === 'all' ? '' : statusFilter + ' '}sessions for this day.`}
          />
        </View>
      </View>

      {/* Quick actions sheet */}
      <SessionQuickActionsBottomSheet
        visible={quickActionsVisible}
        onClose={() => setQuickActionsVisible(false)}
        session={selectedSession}
        isClassRep={MOCK_PROFILE.isClassRep}
        onViewDetails={() => selectedSession && onNavigateToSession(selectedSession.id)}
        onSubmitReport={() => setSubmitReportVisible(true)}
      />

      {/* Submit report sheet */}
      <SubmitReportBottomSheet
        visible={submitReportVisible}
        onClose={() => setSubmitReportVisible(false)}
        session={selectedSession}
        onSubmit={handleSubmitReport}
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
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dateStripWrapper: {
    marginBottom: 12,
  },
  filterChipsWrapper: {
    marginBottom: 14,
  },
  listWrapper: {
    flex: 1,
  },
});
