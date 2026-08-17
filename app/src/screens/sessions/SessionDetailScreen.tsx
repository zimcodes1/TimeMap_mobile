import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Timer,
  Lock,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ReportCard } from '@/components/cards/ReportCard';
import { EmptyStateView } from '@/components/common/EmptyStateView';
import { SubmitReportBottomSheet } from '@/components/bottom-sheets/SubmitReportBottomSheet';
import { ReportDetailBottomSheet } from '@/components/bottom-sheets/ReportDetailBottomSheet';
import { LecturerResponseBottomSheet } from '@/components/bottom-sheets/LecturerResponseBottomSheet';
import { Session, SessionStatus, Report } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useSessionDetail } from '@/hooks/useSchedules';
import { useReports, useSubmitReport, useRespondReport } from '@/hooks/useReports';
import { WifiOff } from 'lucide-react-native';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<SessionStatus, 'primary' | 'warning' | 'info' | 'danger' | 'secondary'> = {
  scheduled: 'primary', shifted: 'warning', postponed: 'info',
  cancelled: 'danger',  held: 'primary',    not_held: 'danger',
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: 'Scheduled', shifted: 'Shifted', postponed: 'Postponed',
  cancelled: 'Cancelled', held: 'Held',       not_held: 'Not Held',
};

// ─── Reporting window banner ──────────────────────────────────────────────────

const ReportWindowBanner: React.FC<{
  session: Session;
  isClassRep: boolean;
  onSubmitReport: () => void;
}> = ({ session, isClassRep, onSubmitReport }) => {
  if (!isClassRep) {
    return (
      <Card variant="outlined" style={styles.banner}>
        <View style={styles.bannerRow}>
          <Lock size={16} color={colors.textSubtle} />
          <Text style={styles.bannerMuted}>Report submission is for class reps only.</Text>
        </View>
      </Card>
    );
  }

  if (session.reportId) {
    return (
      <Card variant="outlined" style={[styles.banner, styles.bannerSuccess]}>
        <View style={styles.bannerRow}>
          <CheckCircle2 size={16} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.primary }]}>Report submitted for this session.</Text>
        </View>
      </Card>
    );
  }

  if (session.reportWindowOpen) {
    return (
      <Card variant="outlined" style={[styles.banner, styles.bannerWarning]}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerRow}>
            <Timer size={16} color={colors.warning} />
            <Text style={[styles.bannerText, { color: colors.warning }]}>Reporting window is open</Text>
          </View>
          <Button variant="primary" size="sm" onPress={onSubmitReport} style={styles.reportBtn} fullWidth={false}>
            Submit Report
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="outlined" style={[styles.banner, styles.bannerMutedBg]}>
      <View style={styles.bannerRow}>
        <AlertCircle size={16} color={colors.textSubtle} />
        <Text style={styles.bannerMuted}>Reporting window has expired.</Text>
      </View>
    </Card>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SessionDetailScreenProps {
  sessionId: string;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SessionDetailScreen: React.FC<SessionDetailScreenProps> = ({
  sessionId,
  onBack,
}) => {
  const { user } = useAuth();
  const isClassRep = Boolean(user?.isClassRep);
  const isLecturer = user?.role === 'lecturer';

  const { session, isLoading, isError, isOffline } = useSessionDetail(sessionId);
  const { reports } = useReports();
  const submitReportMutation = useSubmitReport();
  const respondReportMutation = useRespondReport();

  const relatedReports: Report[] = useMemo(
    () => reports.filter((r) => r.session.id === sessionId),
    [reports, sessionId]
  );

  const [submitVisible, setSubmitVisible] = useState(false);
  const [reportDetailVisible, setReportDetailVisible] = useState(false);
  const [lecturerResponseVisible, setLecturerResponseVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textMain} />
          </Pressable>
          <EmptyStateView variant="loading" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textMain} />
          </Pressable>
          <View style={styles.notFound}>
            <AlertCircle size={40} color={colors.textSubtle} />
            <Text style={styles.notFoundText}>Session details unavailable</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitReport = (payload: { lectureSession: string; held: boolean; reason: string }) => {
    submitReportMutation.mutate(payload, {
      onSuccess: () => {
        setSubmitVisible(false);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textMain} />
          </Pressable>
          <Text style={styles.navTitle}>Session Details</Text>
          <View style={styles.navSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header card */}
          <Card variant="flat" style={styles.headerCard}>
            <View style={styles.courseRow}>
              <Text style={styles.courseCode}>{session.course.code}</Text>
              <Badge variant={STATUS_VARIANT[session.status]}>
                {STATUS_LABEL[session.status]}
              </Badge>
            </View>
            <Text style={styles.courseTitle}>{session.course.title}</Text>
            {session.course.department ? (
              <Text style={styles.dept}>{session.course.department}</Text>
            ) : null}
          </Card>

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <View style={styles.infoIcon}>
                <Clock size={16} color={colors.primary} />
              </View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{session.startTime} – {session.endTime}</Text>
              <Text style={styles.infoSub}>{session.date}</Text>
            </View>

            <View style={[styles.infoCell, styles.infoCellBorder]}>
              <View style={styles.infoIcon}>
                <MapPin size={16} color={colors.info} />
              </View>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{session.venue.name}</Text>
              {session.venue.building ? (
                <Text style={styles.infoSub}>{session.venue.building}</Text>
              ) : null}
            </View>
          </View>

          {/* Lecturers */}
          {session.lecturers.length > 0 ? (
            <Card variant="flat" style={styles.lecturerCard}>
              <View style={styles.lecturerHeader}>
                <User size={14} color={colors.textSubtle} />
                <Text style={styles.lecturerHeaderText}>Lecturer(s)</Text>
              </View>
              {session.lecturers.map((l) => (
                <View key={l.id} style={styles.lecturerRow}>
                  <View style={styles.lecturerAvatar}>
                    <Text style={styles.lecturerInitial}>{l.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.lecturerName}>{l.name}</Text>
                    <Text style={styles.lecturerStaffId}>{l.staffId}</Text>
                  </View>
                </View>
              ))}
            </Card>
          ) : null}

          {/* Reporting window banner */}
          <View style={styles.bannerWrapper}>
            <ReportWindowBanner
              session={session}
              isClassRep={isClassRep}
              onSubmitReport={() => setSubmitVisible(true)}
            />
          </View>

          {/* Report thread */}
          {relatedReports.length > 0 ? (
            <View style={styles.threadSection}>
              <Text style={styles.threadTitle}>Report Thread</Text>
              {relatedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPress={() => {
                    setSelectedReport(report);
                    setReportDetailVisible(true);
                  }}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* Bottom sheets */}
      <SubmitReportBottomSheet
        visible={submitVisible}
        onClose={() => setSubmitVisible(false)}
        session={session}
        onSubmit={handleSubmitReport}
      />

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
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  navSpacer: { width: 36 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerCard: { marginBottom: 14 },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  courseCode: { fontSize: 20, fontWeight: '700', color: colors.textMain },
  courseTitle: { fontSize: 15, color: colors.textMuted, fontWeight: '600', marginBottom: 4 },
  dept: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  infoCell: { flex: 1, padding: 16, gap: 3 },
  infoCellBorder: { borderLeftWidth: 1, borderLeftColor: colors.border },
  infoIcon: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  infoLabel: { fontSize: 10, color: colors.textSubtle, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: colors.textMain, fontWeight: '700' },
  infoSub: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  lecturerCard: { marginBottom: 14 },
  lecturerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  lecturerHeaderText: { fontSize: 12, color: colors.textSubtle, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  lecturerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  lecturerAvatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
  },
  lecturerInitial: { fontSize: 15, fontWeight: '700', color: colors.primary },
  lecturerName: { fontSize: 14, fontWeight: '600', color: colors.textMain },
  lecturerStaffId: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  bannerWrapper: { marginBottom: 16 },
  banner: { padding: 12 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerContent: { gap: 10 },
  bannerText: { fontSize: 14, fontWeight: '600' },
  bannerMuted: { fontSize: 13, color: colors.textSubtle, fontWeight: '600' },
  bannerSuccess: { borderColor: 'rgba(16,185,129,0.3)' },
  bannerWarning: { borderColor: 'rgba(245,158,11,0.3)' },
  bannerMutedBg: {},
  reportBtn: { alignSelf: 'flex-start' },
  threadSection: { marginTop: 4 },
  threadTitle: {
    fontSize: 12, fontWeight: '700', color: colors.textSubtle,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10,
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
});
