import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import {
  CalendarDays,
  CalendarX,
  FilterX,
  WifiOff,
  AlertCircle,
  LucideIcon,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/ui/Button';

export type EmptyStateVariant =
  | 'empty_schedule'
  | 'filter_empty'
  | 'offline'
  | 'error'
  | 'loading';

export interface EmptyStateViewProps {
  variant: EmptyStateVariant;
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}

const VARIANT_CONFIG: Record<
  EmptyStateVariant,
  { icon: LucideIcon; title: string; subtitle: string; iconColor: string }
> = {
  empty_schedule: {
    icon: CalendarDays,
    title: 'No Sessions Today',
    subtitle: 'There are no lecture sessions scheduled for this day.',
    iconColor: colors.textSubtle,
  },
  filter_empty: {
    icon: FilterX,
    title: 'No Matches Found',
    subtitle: 'No sessions match your currently selected status filter.',
    iconColor: colors.textMuted,
  },
  offline: {
    icon: WifiOff,
    title: 'Viewing Offline Schedule',
    subtitle: 'No network connection. Displaying schedule from local cache.',
    iconColor: colors.warning,
  },
  error: {
    icon: AlertCircle,
    title: 'Unable to Load Schedule',
    subtitle: 'A network or server error occurred. Please check your connection.',
    iconColor: colors.danger,
  },
  loading: {
    icon: CalendarX,
    title: 'Syncing Schedule…',
    subtitle: 'Fetching your latest timetable updates.',
    iconColor: colors.primary,
  },
};

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  variant,
  title,
  subtitle,
  onRetry,
}) => {
  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;
  const displayTitle = title ?? config.title;
  const displaySubtitle = subtitle ?? config.subtitle;

  if (variant === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <IconComponent size={32} color={config.iconColor} />
      </View>
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.subtitle}>{displaySubtitle}</Text>
      {onRetry && variant === 'error' ? (
        <Button variant="secondary" size="sm" onPress={onRetry} style={styles.retryBtn} fullWidth={false}>
          Tap to Retry
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSubtle,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 16,
  },
});
