import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  SlidersHorizontal,
  WifiOff,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HoldRateRing } from '@/components/common/HoldRateRing';
import { EmptyStateView } from '@/components/common/EmptyStateView';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';

type DatePreset = '7d' | '30d' | 'term' | 'all';

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'term', label: 'This Term' },
  { id: 'all', label: 'All Time' },
];

export const AnalyticsScreen: React.FC = () => {
  const { user } = useAuth();
  const isClassRep = Boolean(user?.isClassRep);
  const role = user?.role ?? 'student';

  const [preset, setPreset] = useState<DatePreset>('30d');
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);

  // Compute date params based on preset
  const dateParams = useMemo(() => {
    const end = new Date();
    const start = new Date();
    if (preset === '7d') {
      start.setDate(end.getDate() - 7);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    }
    if (preset === '30d') {
      start.setDate(end.getDate() - 30);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    }
    if (preset === 'term') {
      start.setMonth(end.getMonth() - 3);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    }
    return {};
  }, [preset]);

  const {
    analytics,
    isLoading,
    isRefreshing,
    isError,
    isOffline,
    refetch,
  } = useAnalytics({
    ...dateParams,
    courseId: selectedCourseId,
  });

  const summary = analytics?.summary;
  const courseBreakdown = analytics?.courseBreakdown ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>
              {role === 'lecturer' ? 'Lecturer Performance' : isClassRep ? 'Class Hold Rate Overview' : 'Lecture Analytics'}
            </Text>
          </View>
          {isOffline ? (
            <View style={styles.offlinePill}>
              <WifiOff size={12} color={colors.warning} />
              <Text style={styles.offlinePillText}>Offline</Text>
            </View>
          ) : null}
        </View>

        {/* Date presets */}
        <View style={styles.presetRow}>
          {PRESETS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setPreset(p.id)}
              style={[styles.presetChip, preset === p.id && styles.presetChipActive]}
            >
              <Text style={[styles.presetText, preset === p.id && styles.presetTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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
            <EmptyStateView variant="loading" title="Calculating Analytics…" />
          ) : isError ? (
            <EmptyStateView variant="error" onRetry={refetch} />
          ) : (
            <>
              {/* Hero Hold Rate Card */}
              <Card variant="flat" style={styles.heroCard}>
                <View style={styles.heroRingContainer}>
                  <HoldRateRing
                    percentage={summary?.holdRatePercentage ?? 0}
                    size={110}
                    strokeWidth={10}
                    color={colors.primary}
                    bgStrokeColor={colors.surfaceRaised}
                    textColor={colors.textMain}
                  />
                  <View style={styles.heroTextWrapper}>
                    <Text style={styles.heroLabel}>Overall Hold Rate</Text>
                    <Text style={styles.heroSub}>
                      {summary?.heldCount ?? 0} of {summary?.totalSessions ?? 0} sessions held
                    </Text>
                  </View>
                </View>
              </Card>

              {/* 4 Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <View style={styles.metricIconWrapper}>
                    <Calendar size={16} color={colors.info} />
                  </View>
                  <Text style={styles.metricValue}>{summary?.totalSessions ?? 0}</Text>
                  <Text style={styles.metricLabel}>Total Sessions</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconWrapper, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <CheckCircle2 size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.metricValue}>{summary?.heldCount ?? 0}</Text>
                  <Text style={styles.metricLabel}>Held</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconWrapper, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                    <XCircle size={16} color={colors.danger} />
                  </View>
                  <Text style={styles.metricValue}>{summary?.notHeldCount ?? 0}</Text>
                  <Text style={styles.metricLabel}>Not Held</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconWrapper, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                    <AlertTriangle size={16} color={colors.warning} />
                  </View>
                  <Text style={styles.metricValue}>{summary?.cancelledCount ?? 0}</Text>
                  <Text style={styles.metricLabel}>Cancelled</Text>
                </View>
              </View>

              {/* Course breakdown section */}
              <View style={styles.breakdownHeader}>
                <Text style={styles.sectionTitle}>Course Breakdown</Text>
                {selectedCourseId ? (
                  <Pressable onPress={() => setSelectedCourseId(undefined)}>
                    <Text style={styles.clearFilter}>Clear Filter</Text>
                  </Pressable>
                ) : null}
              </View>

              {courseBreakdown.length === 0 ? (
                <Card variant="outlined" style={styles.emptyBreakdown}>
                  <Text style={styles.emptyBreakdownText}>No course data available for selected period.</Text>
                </Card>
              ) : (
                courseBreakdown.map((item) => {
                  const isSelected = selectedCourseId === item.courseId;
                  const rate = Math.round(item.holdRatePercentage);
                  return (
                    <Pressable
                      key={item.courseId}
                      onPress={() =>
                        setSelectedCourseId(isSelected ? undefined : item.courseId)
                      }
                    >
                      <Card
                        variant={isSelected ? 'raised' : 'flat'}
                        style={[styles.courseCard, isSelected && styles.courseCardActive]}
                      >
                        <View style={styles.courseHeader}>
                          <View>
                            <Text style={styles.courseCode}>{item.courseCode}</Text>
                            <Text style={styles.courseTitle}>{item.courseTitle}</Text>
                          </View>
                          <Badge variant={rate >= 80 ? 'primary' : rate >= 50 ? 'warning' : 'danger'}>
                            {rate}% Hold Rate
                          </Badge>
                        </View>

                        {/* Animated progress bar */}
                        <View style={styles.progressBarBg}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${rate}%`,
                                backgroundColor: rate >= 80 ? colors.primary : rate >= 50 ? colors.warning : colors.danger,
                              },
                            ]}
                          />
                        </View>

                        <View style={styles.courseFooter}>
                          <Text style={styles.courseFooterText}>
                            {item.heldCount} held · {item.notHeldCount} missed · {item.cancelledCount} cancelled
                          </Text>
                          <Text style={styles.courseTotalText}>
                            {item.totalSessions} total
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

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
  subtitle: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '600',
    marginTop: 2,
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
    marginTop: 4,
  },
  offlinePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  presetTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroCard: {
    marginBottom: 16,
    padding: 20,
  },
  heroRingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'flex-start',
  },
  metricIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  clearFilter: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyBreakdown: {
    padding: 20,
    alignItems: 'center',
  },
  emptyBreakdownText: {
    fontSize: 13,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  courseCard: {
    marginBottom: 10,
  },
  courseCardActive: {
    borderColor: colors.primary,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 2,
  },
  courseTitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseFooterText: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  courseTotalText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
