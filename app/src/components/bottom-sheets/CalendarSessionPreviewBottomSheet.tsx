import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapPin, Clock, User, ArrowRight, GraduationCap, Users } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Session, SessionStatus } from '@/types';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<SessionStatus, 'primary' | 'warning' | 'info' | 'danger' | 'secondary'> = {
  scheduled: 'primary',
  shifted:   'warning',
  postponed: 'info',
  cancelled: 'danger',
  held:      'primary',
  not_held:  'danger',
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: 'Scheduled',
  shifted:   'Shifted',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
  held:      'Held',
  not_held:  'Not Held',
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CalendarSessionPreviewBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  session: Session | null;
  onViewDetails: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CalendarSessionPreviewBottomSheet: React.FC<CalendarSessionPreviewBottomSheetProps> = ({
  visible,
  onClose,
  session,
  onViewDetails,
}) => {
  if (!session) return null;
  const isExam = Boolean(session.isExam);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={session.course.code}
      subtitle={isExam ? `${session.course.title} · Examination` : session.course.title}
    >
      <View style={styles.badgeRow}>
        {isExam ? (
          <Badge variant="info" style={styles.examBadge}>
            {session.examType ? `Exam · ${session.examType.toUpperCase()}` : 'Examination Sitting'}
          </Badge>
        ) : (
          <Badge variant={STATUS_VARIANT[session.status]}>
            {STATUS_LABEL[session.status]}
          </Badge>
        )}
      </View>

      <View style={styles.infoList}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Clock size={15} color={colors.textSubtle} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>
              {session.startTime} – {session.endTime}
              {isExam && session.durationMinutes ? ` (${session.durationMinutes} mins)` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <MapPin size={15} color={colors.textSubtle} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Venue</Text>
            <Text style={styles.infoValue}>{session.venue.name}</Text>
            {session.venue.building ? (
              <Text style={styles.infoSubValue}>{session.venue.building}</Text>
            ) : null}
            {isExam && session.venuesList && session.venuesList.length > 1 ? (
              <View style={styles.venuesListWrapper}>
                {session.venuesList.map((v, i) => (
                  <Text key={`${v.venueName}-${i}`} style={styles.venueItemText}>
                    • {v.venueName} {v.turns && v.turns > 1 ? `(${v.turns} turns)` : ''} {v.students ? `[${v.students} students]` : ''}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        {isExam && session.candidatesCount ? (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Users size={15} color={colors.textSubtle} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Registered Candidates</Text>
              <Text style={styles.infoValue}>{session.candidatesCount} Students</Text>
            </View>
          </View>
        ) : null}

        {!isExam && session.lecturers.length > 0 ? (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <User size={15} color={colors.textSubtle} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Lecturer(s)</Text>
              {session.lecturers.map((l) => (
                <Text key={l.id} style={styles.infoValue}>{l.name}</Text>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {isExam ? (
        <Button
          variant="secondary"
          size="lg"
          onPress={onClose}
          style={styles.detailsBtn}
        >
          Dismiss
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight size={18} color="#fff" />}
          onPress={() => { onClose(); setTimeout(onViewDetails, 180); }}
          style={styles.detailsBtn}
        >
          View Full Details
        </Button>
      )}
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badgeRow: {
    marginBottom: 16,
  },
  examBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  venuesListWrapper: {
    marginTop: 6,
    gap: 3,
  },
  venueItemText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  infoList: {
    gap: 14,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  infoSubValue: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  detailsBtn: {
    marginBottom: 4,
  },
});
