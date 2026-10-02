import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Bell, CalendarClock, FileText, MessageCircle,
  Clock, ShieldCheck, ShieldX, Info, ExternalLink,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Notification, NotificationType } from '@/types';

const DEFAULT_CONFIG = {
  Icon: Bell,
  accent: colors.primary,
  label: 'Notification',
};

const TYPE_CONFIG: Record<
  string,
  { Icon: React.ElementType; accent: string; label: string }
> = {
  schedule_change:       { Icon: CalendarClock,  accent: colors.info,       label: 'Schedule Change' },
  session_shifted:       { Icon: CalendarClock,  accent: colors.info,       label: 'Session Shifted' },
  session_cancelled:     { Icon: CalendarClock,  accent: colors.danger,     label: 'Session Cancelled' },
  reporting_window_open: { Icon: Clock,          accent: colors.warning,    label: 'Reporting Window Open' },
  window_reminder:       { Icon: Clock,          accent: colors.warning,    label: 'Window Reminder' },
  session_unreported:    { Icon: Bell,            accent: colors.danger,     label: 'Unreported Session' },
  report_submitted:      { Icon: FileText,        accent: colors.primary,    label: 'Report Submitted' },
  report_responded:      { Icon: MessageCircle,   accent: colors.primary,    label: 'Report Response' },
  discrepancy_submitted: { Icon: FileText,        accent: colors.warning,    label: 'Discrepancy Submitted' },
  discrepancy_approved:  { Icon: ShieldCheck,     accent: colors.primary,    label: 'Request Approved' },
  discrepancy_rejected:  { Icon: ShieldX,         accent: colors.danger,     label: 'Request Rejected' },
  general:               { Icon: Info,            accent: colors.textSubtle, label: 'General' },
};

function formatDateTime(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-NG', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface NotificationDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  notification: Notification | null;
  /**
   * Called when user taps the CTA to navigate to the related record.
   * TODO(api-wiring): mark notification as read before navigating.
   */
  onNavigateToRelated?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationDetailBottomSheet: React.FC<NotificationDetailBottomSheetProps> = ({
  visible,
  onClose,
  notification,
  onNavigateToRelated,
}) => {
  if (!notification) return null;

  const config = (notification.type && TYPE_CONFIG[notification.type]) || DEFAULT_CONFIG;
  const Icon = config.Icon || Bell;
  const accent = config.accent || colors.primary;
  const label = config.label || 'Notification';
  const hasRelated = !!notification.relatedModel && !!notification.relatedId;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Notification">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Icon + type */}
        <View style={styles.topSection}>
          <View style={[styles.iconCircle, { backgroundColor: `${accent}20` }]}>
            <Icon size={26} color={accent} />
          </View>
          <View style={[styles.typePill, { borderColor: `${accent}40`, backgroundColor: `${accent}15` }]}>
            <Text style={[styles.typePillText, { color: accent }]}>{label}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{notification.title}</Text>

        {/* Body */}
        <Text style={styles.body}>{notification.body}</Text>

        {/* Timestamp */}
        <View style={styles.timestampRow}>
          <Clock size={13} color={colors.textSubtle} />
          <Text style={styles.timestamp}>{formatDateTime(notification.createdAt)}</Text>
        </View>

        {/* CTA */}
        {hasRelated && onNavigateToRelated ? (
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ExternalLink size={16} color="#fff" />}
            onPress={() => { onClose(); setTimeout(onNavigateToRelated!, 180); }}
            style={styles.ctaBtn}
          >
            View Related{' '}
            {notification.relatedModel === 'LectureSession' ? 'Session' :
             notification.relatedModel === 'ClassRepReport' ? 'Report' : 'Details'}
          </Button>
        ) : null}

        <Button variant="ghost" size="md" onPress={onClose} style={styles.closeBtn}>
          Dismiss
        </Button>
      </ScrollView>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 14,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  ctaBtn: {
    marginBottom: 8,
  },
  closeBtn: {
    marginBottom: 4,
  },
});
