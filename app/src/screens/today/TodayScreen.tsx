import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { SlidersHorizontal, WifiOff } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { DateStrip } from '@/components/schedules/DateStrip';
import { StatusFilterChips } from '@/components/schedules/StatusFilterChips';
import { ScheduleAgendaList } from '@/components/schedules/ScheduleAgendaList';
import { SessionQuickActionsBottomSheet } from '@/components/bottom-sheets/SessionQuickActionsBottomSheet';
import { SubmitReportBottomSheet } from '@/components/bottom-sheets/SubmitReportBottomSheet';
import { Session, SessionStatus } from '@/types';
import { MOCK_SESSIONS, MOCK_PROFILE } from '@/constants/mockData';
import { useAuth } from '@/context/AuthContext';
import { useTodaySessions } from '@/hooks/useSchedules';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function greetingFor(name: string): string {
  const hr = new Date().getHours();
  const salutation = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = name ? name.split(' ')[0] : 'User';
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
  const { user } = useAuth();
  const profile = user ?? MOCK_PROFILE;

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [submitReportVisible, setSubmitReportVisible] = useState(false);

  const {
    sessions,
    allSessions,
    isLoading,
    isRefreshing,
    isError,
    isOffline,
    refetch,
  } = useTodaySessions(selectedDate, statusFilter);

  const activeDates = useMemo(() => {
    const dates = [...new Set([...allSessions, ...MOCK_SESSIONS].map((s) => s.date))];
    return dates;
  }, [allSessions]);

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
            <Text style={styles.greeting}>{greetingFor(profile.fullName)}</Text>
            <Text style={styles.dateLabel}>{formatDateDisplay(selectedDate)}</Text>
          </View>
          <View style={styles.headerRight}>
            {isOffline ? (
              <View style={styles.offlinePill}>
                <WifiOff size={12} color={colors.warning} />
                <Text style={styles.offlinePillText}>Offline</Text>
              </View>
            ) : null}
            <Pressable style={styles.filterBtn} onPress={() => {}}>
              <SlidersHorizontal size={20} color={colors.textMuted} />
            </Pressable>
          </View>
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
            sessions={sessions}
            isLoading={isLoading}
            isError={isError}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
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
        isClassRep={profile.isClassRep}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
