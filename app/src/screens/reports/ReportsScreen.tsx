import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Clock } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { ReportCard } from '@/components/cards/ReportCard';
import { SessionCard } from '@/components/cards/SessionCard';
import { SubmitReportBottomSheet } from '@/components/bottom-sheets/SubmitReportBottomSheet';
import { ReportDetailBottomSheet } from '@/components/bottom-sheets/ReportDetailBottomSheet';
import { LecturerResponseBottomSheet } from '@/components/bottom-sheets/LecturerResponseBottomSheet';
import { RoleHelpBottomSheet } from '@/components/bottom-sheets/RoleHelpBottomSheet';
import { EmptyStateView } from '@/components/common/EmptyStateView';
import { Report, Session } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useReports, useSubmitReport, useRespondReport } from '@/hooks/useReports';
import { useTodaySessions } from '@/hooks/useSchedules';
import { WifiOff } from 'lucide-react-native';

// ─── Segmented tabs ────────────────────────────────────────────────────────────

type ClassRepTab = 'to_report' | 'submitted';
type LecturerTab = 'needs_response' | 'all';

// ─── Shared empty state ────────────────────────────────────────────────────────

const EmptyState: React.FC<{ icon: React.ElementType; message: string; sub?: string }> = ({
  icon: Icon,
  message,
  sub,
}) => (
  <View style={styles.emptyState}>
    <Icon size={40} color={colors.textSubtle} />
    <Text style={styles.emptyText}>{message}</Text>
    {sub ? <Text style={styles.emptySub}>{sub}</Text> : null}
  </View>
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ReportsScreenProps {
  onNavigateToSession: (sessionId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onNavigateToSession }) => {
  const { user } = useAuth();
  const isClassRep = Boolean(user?.isClassRep);
  const isLecturer = user?.role === 'lecturer';

  const {
    reports,
    isLoading: isLoadingReports,
    isRefreshing: isRefreshingReports,
    isError: isErrorReports,
    isOffline: isOfflineReports,
    refetch: refetchReports,
  } = useReports();

  const todayStr = new Date().toISOString().split('T')[0];
  const { allSessions } = useTodaySessions(todayStr, 'all', { canViewPast: true });

  const submitReportMutation = useSubmitReport();
  const respondReportMutation = useRespondReport();

  const [classRepTab, setClassRepTab] = useState<ClassRepTab>('to_report');
  const [lecturerTab, setLecturerTab] = useState<LecturerTab>('needs_response');
  const [roleHelpVisible, setRoleHelpVisible] = useState(false);

  // Bottom sheet state
  const [submitReportSession, setSubmitReportSession] = useState<Session | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportDetailVisible, setReportDetailVisible] = useState(false);
  const [lecturerResponseVisible, setLecturerResponseVisible] = useState(false);

  const handleRefresh = () => {
    refetchReports();
  };

  const handleSubmitReport = (payload: { lectureSession: string; held: boolean; reason: string }) => {
    submitReportMutation.mutate(payload, {
      onSuccess: () => {
        setSubmitReportSession(null);
      },
    });
  };

  const handleLecturerResponse = (payload: { reportId: string; responseText: string }) => {
    respondReportMutation.mutate(payload, {
      onSuccess: () => {
        setLecturerResponseVisible(false);
      },
    });
  };

  const lecturerPendingReports = useMemo(
    () => reports.filter((r) => r.status === 'pending'),
    [reports]
  );

  const toReportSessions = useMemo(
    () => allSessions.filter((s) => s.reportWindowOpen && !s.reportId),
    [allSessions]
  );

  // ─── Student (non-rep) view ───────────────────────────────────────────────

  if (!isClassRep && !isLecturer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Reports</Text>
          </View>
          <EmptyState
            icon={FileText}
            message="Reports are for class reps"
            sub="You can view session details from the Today or Calendar tab."
          />
          <Pressable onPress={() => setRoleHelpVisible(true)} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>Why can't I submit reports?</Text>
          </Pressable>
          <RoleHelpBottomSheet visible={roleHelpVisible} onClose={() => setRoleHelpVisible(false)} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Lecturer view ────────────────────────────────────────────────────────

  if (isLecturer) {
    const displayedReports =
      lecturerTab === 'needs_response' ? lecturerPendingReports : reports;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Reports</Text>
              <Text style={styles.subtitle}>Manage class rep reports</Text>
            </View>
            {isOfflineReports ? (
              <View style={styles.offlinePill}>
                <WifiOff size={12} color={colors.warning} />
                <Text style={styles.offlinePillText}>Offline</Text>
              </View>
            ) : null}
          </View>

          {/* Segmented tabs */}
          <View style={styles.segmentRow}>
            {(['needs_response', 'all'] as LecturerTab[]).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setLecturerTab(tab)}
                style={[styles.segment, lecturerTab === tab && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, lecturerTab === tab && styles.segmentTextActive]}>
                  {tab === 'needs_response' ? 'Needs Response' : 'All Reports'}
                </Text>
                {tab === 'needs_response' && lecturerPendingReports.length > 0 ? (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{lecturerPendingReports.length}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshingReports}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {isLoadingReports ? (
              <EmptyStateView variant="loading" />
            ) : isErrorReports ? (
              <EmptyStateView variant="error" onRetry={handleRefresh} />
            ) : displayedReports.length === 0 ? (
              <EmptyState icon={FileText} message="No reports here" />
            ) : (
              displayedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPress={() => {
                    setSelectedReport(report);
                    setReportDetailVisible(true);
                  }}
                />
              ))
            )}
          </ScrollView>
        </View>

        <ReportDetailBottomSheet
          visible={reportDetailVisible}
          onClose={() => setReportDetailVisible(false)}
          report={selectedReport}
          canRespond={isLecturer && selectedReport?.status === 'pending'}
          onRespondPress={() => {
            setReportDetailVisible(false);
            setTimeout(() => setLecturerResponseVisible(true), 250);
          }}
        />

        <LecturerResponseBottomSheet
          visible={lecturerResponseVisible}
          onClose={() => setLecturerResponseVisible(false)}
          report={selectedReport}
          onSubmit={handleLecturerResponse}
        />
      </SafeAreaView>
    );
  }

  // ─── Class rep view ───────────────────────────────────────────────────────

  const toReport = toReportSessions;
  const submitted = reports;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reports</Text>
            <Text style={styles.subtitle}>Class rep reporting dashboard</Text>
          </View>
          {isOfflineReports ? (
            <View style={styles.offlinePill}>
              <WifiOff size={12} color={colors.warning} />
              <Text style={styles.offlinePillText}>Offline</Text>
            </View>
          ) : null}
        </View>

        {/* Segmented tabs */}
        <View style={styles.segmentRow}>
          {(['to_report', 'submitted'] as ClassRepTab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setClassRepTab(tab)}
              style={[styles.segment, classRepTab === tab && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, classRepTab === tab && styles.segmentTextActive]}>
                {tab === 'to_report' ? 'To Report' : 'Submitted'}
              </Text>
              {tab === 'to_report' && toReport.length > 0 ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{toReport.length}</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingReports}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {isLoadingReports ? (
            <EmptyStateView variant="loading" />
          ) : isErrorReports ? (
            <EmptyStateView variant="error" onRetry={handleRefresh} />
          ) : classRepTab === 'to_report' ? (
            toReport.length === 0 ? (
              <EmptyState
                icon={Clock}
                message="No sessions to report"
                sub="Sessions with open reporting windows will appear here."
              />
            ) : (
              toReport.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onPress={() => setSubmitReportSession(session)}
                  isHighlighted
                />
              ))
            )
          ) : submitted.length === 0 ? (
            <EmptyState icon={FileText} message="No submitted reports yet" />
          ) : (
            submitted.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onPress={() => {
                  setSelectedReport(report);
                  setReportDetailVisible(true);
                }}
              />
            ))
          )}
        </ScrollView>
      </View>

      <SubmitReportBottomSheet
        visible={!!submitReportSession}
        onClose={() => setSubmitReportSession(null)}
        session={submitReportSession}
        onSubmit={handleSubmitReport}
      />

      <ReportDetailBottomSheet
        visible={reportDetailVisible}
        onClose={() => setReportDetailVisible(false)}
        report={selectedReport}
        canRespond={false}
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
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSubtle,
  },
  segmentTextActive: {
    color: colors.textMain,
  },
  tabBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSubtle,
    textAlign: 'center',
    fontWeight: '600',
  },
  helpLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  helpLinkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});
