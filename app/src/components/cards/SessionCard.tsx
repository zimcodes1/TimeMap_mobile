import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  MapPin,
  Clock,
  MoreVertical,
  User,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Badge } from '@/components/ui/Badge';
import { Session, SessionStatus } from '@/types';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; variant: 'primary' | 'secondary' | 'warning' | 'danger' | 'info' }
> = {
  scheduled: { label: 'Scheduled', variant: 'primary' },
  shifted:    { label: 'Shifted',   variant: 'warning' },
  postponed:  { label: 'Postponed', variant: 'info' },
  cancelled:  { label: 'Cancelled', variant: 'danger' },
  held:       { label: 'Held',      variant: 'primary' },
  not_held:   { label: 'Not Held',  variant: 'danger' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SessionCardProps {
  session: Session;
  onPress?: () => void;
  onMorePress?: () => void;
  /** Highlight the card with a green left accent (e.g. current/upcoming session) */
  isHighlighted?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onPress,
  onMorePress,
  isHighlighted = false,
}) => {
  const { label, variant } = STATUS_CONFIG[session.status];
  const lecturerNames = session.lecturers.map((l) => l.name).join(', ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, isHighlighted && styles.highlighted, pressed && styles.pressed]}
    >
      {/* Left accent bar */}
      {isHighlighted && <View style={styles.accentBar} />}

      <View style={styles.body}>
        {/* Top row — course code + badge + overflow */}
        <View style={styles.topRow}>
          <View style={styles.courseInfo}>
            <Text style={styles.courseCode}>{session.course.code}</Text>
            <Badge variant={variant} style={styles.badge}>{label}</Badge>
          </View>
          {onMorePress ? (
            <Pressable onPress={onMorePress} hitSlop={12} style={styles.moreBtn}>
              <MoreVertical size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Course title */}
        <Text style={styles.courseTitle} numberOfLines={1}>
          {session.course.title}
        </Text>

        {/* Meta row — time + venue + lecturer */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={13} color={colors.textSubtle} />
            <Text style={styles.metaText}>
              {session.startTime} – {session.endTime}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <MapPin size={13} color={colors.textSubtle} />
            <Text style={styles.metaText} numberOfLines={1}>
              {session.venue.name}
            </Text>
          </View>

          {lecturerNames ? (
            <View style={styles.metaItem}>
              <User size={13} color={colors.textSubtle} />
              <Text style={styles.metaText} numberOfLines={1}>
                {lecturerNames}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Reporting window indicator */}
        {session.reportWindowOpen && !session.reportId ? (
          <View style={styles.windowBanner}>
            <Text style={styles.windowText}>⏳ Reporting window open</Text>
          </View>
        ) : session.reportId ? (
          <View style={[styles.windowBanner, styles.reportedBanner]}>
            <Text style={styles.reportedText}>✓ Report submitted</Text>
          </View>
        ) : null}
      </View>
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
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  highlighted: {
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
  accentBar: {
    width: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  courseInfo: {
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
  badge: {
    marginLeft: 6,
  },
  moreBtn: {
    padding: 4,
  },
  courseTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
  },
  metaRow: {
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  windowBanner: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    alignSelf: 'flex-start',
  },
  windowText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  reportedBanner: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  reportedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});
