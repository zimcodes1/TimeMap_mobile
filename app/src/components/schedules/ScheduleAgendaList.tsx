import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { CalendarX } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Session } from '@/types';
import { SessionCard } from '@/components/cards/SessionCard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function groupByDate(sessions: Session[]): Record<string, Session[]> {
  return sessions.reduce<Record<string, Session[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
}

function formatDateHeading(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const same = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (same(d, today)) return 'Today';
  if (same(d, tomorrow)) return 'Tomorrow';
  if (same(d, yesterday)) return 'Yesterday';
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ScheduleAgendaListProps {
  sessions: Session[];
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSessionPress?: (session: Session) => void;
  onSessionMorePress?: (session: Session) => void;
  emptyMessage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ScheduleAgendaList: React.FC<ScheduleAgendaListProps> = ({
  sessions,
  isLoading = false,
  isError = false,
  onRefresh,
  isRefreshing = false,
  onSessionPress,
  onSessionMorePress,
  emptyMessage = 'No sessions for this day.',
}) => {
  if (isLoading) {
    return (
      <View style={styles.centreState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Loading sessions…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centreState}>
        <CalendarX size={40} color={colors.danger} />
        <Text style={styles.stateText}>Failed to load sessions.</Text>
        <Text style={styles.stateSubtext}>Pull down to try again.</Text>
      </View>
    );
  }

  const sorted = [...sessions].sort((a, b) =>
    `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
  );

  const grouped = groupByDate(sorted);
  const dateKeys = Object.keys(grouped).sort();

  if (dateKeys.length === 0) {
    return (
      <View style={styles.centreState}>
        <CalendarX size={40} color={colors.textSubtle} />
        <Text style={styles.stateText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      contentContainerStyle={styles.scrollContent}
    >
      {dateKeys.map((dateKey) => (
        <View key={dateKey} style={styles.group}>
          {/* Date heading */}
          <View style={styles.dateHeading}>
            <View style={styles.dateLine} />
            <Text style={styles.dateLabel}>{formatDateHeading(dateKey)}</Text>
            <View style={styles.dateLine} />
          </View>

          {/* Session cards */}
          {grouped[dateKey].map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => onSessionPress?.(session)}
              onMorePress={onSessionMorePress ? () => onSessionMorePress(session) : undefined}
              isHighlighted={session.status === 'scheduled' && session.date === new Date().toISOString().split('T')[0]}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  centreState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  stateText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  stateSubtext: {
    fontSize: 13,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  group: {
    marginBottom: 4,
  },
  dateHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
