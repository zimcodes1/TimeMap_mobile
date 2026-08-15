import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Bell,
  CalendarClock,
  FileText,
  MessageCircle,
  Clock,
  ShieldCheck,
  ShieldX,
  Info,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Notification, NotificationType } from '@/types';

// ─── Type → icon + accent mapping ────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { Icon: React.ElementType; accent: string; label: string }
> = {
  schedule_change:       { Icon: CalendarClock,  accent: colors.info,    label: 'Schedule' },
  report_submitted:      { Icon: FileText,        accent: colors.primary, label: 'Report' },
  report_responded:      { Icon: MessageCircle,   accent: colors.primary, label: 'Response' },
  window_reminder:       { Icon: Clock,           accent: colors.warning, label: 'Reminder' },
  session_unreported:    { Icon: Bell,            accent: colors.danger,  label: 'Alert' },
  discrepancy_approved:  { Icon: ShieldCheck,     accent: colors.primary, label: 'Approved' },
  discrepancy_rejected:  { Icon: ShieldX,         accent: colors.danger,  label: 'Rejected' },
  general:               { Icon: Info,            accent: colors.textSubtle, label: 'Info' },
};

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const config = TYPE_CONFIG[notification.type];
  const { Icon, accent, label } = config;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !notification.isRead && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      {/* Unread dot */}
      {!notification.isRead && <View style={styles.unreadDot} />}

      {/* Icon badge */}
      <View style={[styles.iconContainer, { backgroundColor: `${accent}20` }]}>
        <Icon size={18} color={accent} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.typePill, { borderColor: `${accent}40`, backgroundColor: `${accent}15` }]}>
            <Text style={[styles.typePillText, { color: accent }]}>{label}</Text>
          </View>
          <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginBottom: 10,
    position: 'relative',
  },
  unread: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  pressed: {
    opacity: 0.88,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 3,
  },
  body: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
