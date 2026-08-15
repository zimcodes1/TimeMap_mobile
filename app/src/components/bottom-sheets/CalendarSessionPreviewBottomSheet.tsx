import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapPin, Clock, User, ArrowRight } from 'lucide-react-native';
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

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={session.course.code}
      subtitle={session.course.title}
    >
      <View style={styles.badgeRow}>
        <Badge variant={STATUS_VARIANT[session.status]}>
          {STATUS_LABEL[session.status]}
        </Badge>
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
          </View>
        </View>

        {session.lecturers.length > 0 ? (
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

      <Button
        variant="primary"
        size="lg"
        rightIcon={<ArrowRight size={18} color="#fff" />}
        onPress={() => { onClose(); setTimeout(onViewDetails, 180); }}
        style={styles.detailsBtn}
      >
        View Full Details
      </Button>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badgeRow: {
    marginBottom: 16,
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
