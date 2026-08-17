import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCheck, WifiOff } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { NotificationCard } from '@/components/cards/NotificationCard';
import { NotificationDetailBottomSheet } from '@/components/bottom-sheets/NotificationDetailBottomSheet';
import { NotificationFilterBottomSheet, NotificationFilterValues } from '@/components/bottom-sheets/NotificationFilterBottomSheet';
import { EmptyStateView } from '@/components/common/EmptyStateView';
import { Notification } from '@/types';
import {
  useNotificationsInbox,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface NotificationsScreenProps {
  onNavigateToSession: (sessionId: string) => void;
  onNavigateToReport: (reportId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onNavigateToSession,
  onNavigateToReport,
}) => {
  const {
    notifications,
    isLoading,
    isRefreshing,
    isError,
    isOffline,
    refetch,
  } = useNotificationsInbox();

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filters, setFilters] = useState<NotificationFilterValues>({
    type: 'all',
    unreadOnly: false,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const displayedNotifications = useMemo(() => {
    let result = [...notifications];
    if (filters.type !== 'all') {
      result = result.filter((n) => n.type === filters.type);
    }
    if (filters.unreadOnly) {
      result = result.filter((n) => !n.isRead);
    }
    return result;
  }, [notifications, filters]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleNavigateToRelated = (notification: Notification | null) => {
    if (!notification) return;
    if (notification.relatedModel === 'LectureSession' && notification.relatedId) {
      onNavigateToSession(notification.relatedId);
    } else if (notification.relatedModel === 'ClassRepReport' && notification.relatedId) {
      onNavigateToReport(notification.relatedId);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 ? (
              <Text style={styles.unreadLabel}>{unreadCount} unread</Text>
            ) : (
              <Text style={styles.unreadLabel}>All caught up</Text>
            )}
          </View>
          <View style={styles.headerActions}>
            {isOffline ? (
              <View style={styles.offlinePill}>
                <WifiOff size={12} color={colors.warning} />
                <Text style={styles.offlinePillText}>Offline</Text>
              </View>
            ) : null}
            {unreadCount > 0 ? (
              <Pressable onPress={handleMarkAllRead} style={styles.markAllBtn}>
                <CheckCheck size={16} color={colors.primary} />
                <Text style={styles.markAllText}>Mark all read</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => setFilterVisible(true)}
              style={[
                styles.filterBtn,
                (filters.type !== 'all' || filters.unreadOnly) && styles.filterBtnActive,
              ]}
            >
              <Bell size={18} color={
                (filters.type !== 'all' || filters.unreadOnly) ? colors.primary : colors.textMuted
              } />
            </Pressable>
          </View>
        </View>

        {/* All/Unread quick tabs */}
        <View style={styles.quickTabRow}>
          <Pressable
            onPress={() => setFilters((f) => ({ ...f, unreadOnly: false }))}
            style={[styles.quickTab, !filters.unreadOnly && styles.quickTabActive]}
          >
            <Text style={[styles.quickTabText, !filters.unreadOnly && styles.quickTabTextActive]}>
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilters((f) => ({ ...f, unreadOnly: true }))}
            style={[styles.quickTab, filters.unreadOnly && styles.quickTabActive]}
          >
            <Text style={[styles.quickTabText, filters.unreadOnly && styles.quickTabTextActive]}>
              Unread
            </Text>
            {unreadCount > 0 ? (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Notification list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={displayedNotifications.length === 0 ? styles.scrollContentEmpty : undefined}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {isLoading ? (
            <EmptyStateView variant="loading" />
          ) : isError ? (
            <EmptyStateView variant="error" onRetry={refetch} />
          ) : displayedNotifications.length === 0 ? (
            <EmptyStateView
              variant={filters.unreadOnly ? 'filter_empty' : 'empty_schedule'}
              title={filters.unreadOnly ? 'No Unread Notifications' : 'Inbox is Empty'}
              subtitle={
                filters.unreadOnly
                  ? 'You have read all your notifications.'
                  : 'You have no notifications at the moment.'
              }
            />
          ) : (
            displayedNotifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onPress={() => handleNotificationPress(n)}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Detail sheet */}
      <NotificationDetailBottomSheet
        visible={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
        onNavigateToRelated={() => handleNavigateToRelated(selectedNotification)}
      />

      {/* Filter sheet */}
      <NotificationFilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        initialValues={filters}
        onApply={setFilters}
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
  },
  unreadLabel: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
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
  },
  offlinePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  markAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  quickTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickTabActive: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: colors.primary,
  },
  quickTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  quickTabTextActive: {
    color: colors.primary,
  },
  countPill: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
