import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Badge } from '@/components/ui/Badge';
import { Report } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ReportCardProps {
  report: Report;
  onPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReportCard: React.FC<ReportCardProps> = ({ report, onPress }) => {
  const HeldIcon = report.held ? CheckCircle : XCircle;
  const heldColor = report.held ? colors.primary : colors.danger;

  const statusVariant =
    report.status === 'responded'
      ? 'primary'
      : report.status === 'disputed'
      ? 'warning'
      : 'secondary';

  const statusLabel =
    report.status === 'responded'
      ? 'Responded'
      : report.status === 'disputed'
      ? 'Disputed'
      : 'Pending';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.courseRow}>
          <Text style={styles.courseCode}>{report.session.course.code}</Text>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </View>
        <Text style={styles.time}>{formatRelativeTime(report.reportedAt)}</Text>
      </View>

      {/* Course title + date */}
      <Text style={styles.courseTitle} numberOfLines={1}>
        {report.session.course.title}
      </Text>
      <Text style={styles.sessionDate}>
        {report.session.date} · {report.session.startTime}–{report.session.endTime}
      </Text>

      {/* Held status */}
      <View style={styles.heldRow}>
        <HeldIcon size={14} color={heldColor} />
        <Text style={[styles.heldText, { color: heldColor }]}>
          {report.held ? 'Held' : 'Not Held'}
        </Text>
      </View>

      {/* Reason snippet */}
      <Text style={styles.reason} numberOfLines={2}>
        {report.reason}
      </Text>

      {/* Lecturer response snippet */}
      {report.lecturerResponse ? (
        <View style={styles.responseRow}>
          <MessageSquare size={12} color={colors.textSubtle} />
          <Text style={styles.responseText} numberOfLines={1}>
            {report.lecturerResponse}
          </Text>
        </View>
      ) : (
        <View style={styles.responseRow}>
          <Clock size={12} color={colors.textSubtle} />
          <Text style={styles.pendingText}>Awaiting lecturer response</Text>
        </View>
      )}
    </Pressable>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.88,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  courseCode: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  time: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
    marginBottom: 10,
  },
  heldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  heldText: {
    fontSize: 13,
    fontWeight: '700',
  },
  reason: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  responseText: {
    fontSize: 12,
    color: colors.textSubtle,
    flex: 1,
    fontWeight: '600',
  },
  pendingText: {
    fontSize: 12,
    color: colors.textSubtle,
    fontStyle: 'italic',
    fontWeight: '600',
  },
});
