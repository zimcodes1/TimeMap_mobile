import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Bell, CheckCheck } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { NotificationCard } from '@/components/cards/NotificationCard';
import { NotificationDetailBottomSheet } from '@/components/bottom-sheets/NotificationDetailBottomSheet';
import { NotificationFilterBottomSheet, NotificationFilterValues } from '@/components/bottom-sheets/NotificationFilterBottomSheet';
import { Notification } from '@/types';
import { MOCK_NOTIFICATIONS, MOCK_UNREAD_COUNT } from '@/constants/mockData';

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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(MOCK_UNREAD_COUNT);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filters, setFilters] = useState<NotificationFilterValues>({
    type: 'all',
    unreadOnly: false,
  });

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    // TODO(api-wiring): GET /api/notifications/inbox/
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read locally
    // TODO(api-wiring): POST /api/notifications/inbox/{id}/read/
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setSelectedNotification(notification);
  };

  const handleMarkAllRead = () => {
    // TODO(api-wiring): POST /api/notifications/inbox/mark-all-read/
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {displayedNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={40} color={colors.textSubtle} />
              <Text style={styles.emptyText}>
                {filters.unreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </Text>
            </View>
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
