import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, MapPin, Clock } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LecturerResponseBottomSheet } from '@/components/bottom-sheets/LecturerResponseBottomSheet';
import { Report } from '@/types';
import { MOCK_REPORTS, MOCK_PROFILE } from '@/constants/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ReportDetailScreenProps {
  reportId: string;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReportDetailScreen: React.FC<ReportDetailScreenProps> = ({
  reportId,
  onBack,
}) => {
  const profile = MOCK_PROFILE;
  const report: Report | undefined = useMemo(
    () => MOCK_REPORTS.find((r) => r.id === reportId),
    [reportId]
  );

  const [lecturerResponseVisible, setLecturerResponseVisible] = useState(false);

  if (!report) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textMain} />
          </Pressable>
          <View style={styles.notFound}>
            <AlertCircle size={40} color={colors.textSubtle} />
            <Text style={styles.notFoundText}>Report not found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const HeldIcon = report.held ? CheckCircle : XCircle;
  const heldColor = report.held ? colors.primary : colors.danger;

  const statusVariant =
    report.status === 'responded' ? 'primary' :
    report.status === 'disputed'  ? 'warning' : 'secondary';

  const canRespond =
    profile.role === 'lecturer' &&
    !report.lecturerResponse;

  const handleLecturerResponse = (payload: { reportId: string; responseText: string }) => {
    // TODO(api-wiring): POST /api/reporting/reports/{id}/respond/
    console.log('Response submitted:', payload);
    setLecturerResponseVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textMain} />
          </Pressable>
          <Text style={styles.navTitle}>Report Detail</Text>
          <View style={styles.navSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Course / session header */}
          <Card variant="flat" style={styles.headerCard}>
            <View style={styles.courseRow}>
              <Text style={styles.courseCode}>{report.session.course.code}</Text>
              <Badge variant={statusVariant}>
                {report.status === 'responded' ? 'Responded' :
                 report.status === 'disputed'  ? 'Disputed'  : 'Pending'}
              </Badge>
            </View>
            <Text style={styles.courseTitle}>{report.session.course.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={13} color={colors.textSubtle} />
                <Text style={styles.metaText}>
                  {report.session.date} · {report.session.startTime}–{report.session.endTime}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={13} color={colors.textSubtle} />
                <Text style={styles.metaText}>{report.session.venue.name}</Text>
              </View>
            </View>
          </Card>

          {/* Report content */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Report</Text>

            {/* Held status */}
            <View style={styles.heldRow}>
              <HeldIcon size={18} color={heldColor} />
              <Text style={[styles.heldText, { color: heldColor }]}>
                {report.held ? 'Lecture was held' : 'Lecture was not held'}
              </Text>
            </View>

            {/* Reason */}
            <Text style={styles.reason}>{report.reason}</Text>

            {/* Meta */}
            <View style={styles.reportMeta}>
              <View style={styles.reportMetaRow}>
                <Text style={styles.reportMetaLabel}>Reported by</Text>
                <Text style={styles.reportMetaValue}>{report.submittedBy}</Text>
              </View>
              <View style={styles.reportMetaRow}>
                <Text style={styles.reportMetaLabel}>Reported at</Text>
                <Text style={styles.reportMetaValue}>{formatDateTime(report.reportedAt)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Lecturer response */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Lecturer Response</Text>

            {report.lecturerResponse ? (
              <Card variant="raised">
                <Text style={styles.responseText}>{report.lecturerResponse}</Text>
                {report.respondedAt ? (
                  <Text style={styles.respondedAt}>{formatDateTime(report.respondedAt)}</Text>
                ) : null}
              </Card>
            ) : (
              <View style={styles.noResponse}>
                <AlertCircle size={20} color={colors.textSubtle} />
                <Text style={styles.noResponseText}>Awaiting lecturer response</Text>
              </View>
            )}

            {canRespond ? (
              <Button
                variant="primary"
                size="lg"
                onPress={() => setLecturerResponseVisible(true)}
                style={styles.respondBtn}
              >
                Respond to This Report
              </Button>
            ) : null}
          </View>
        </ScrollView>
      </View>

      <LecturerResponseBottomSheet
        visible={lecturerResponseVisible}
        onClose={() => setLecturerResponseVisible(false)}
        report={report}
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.textMain },
  navSpacer: { width: 36 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerCard: { marginBottom: 20 },
  courseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  courseCode: { fontSize: 20, fontWeight: '700', color: colors.textMain },
  courseTitle: { fontSize: 14, color: colors.textMuted, fontWeight: '600', marginBottom: 10 },
  metaRow: { gap: 5 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  section: { marginBottom: 6 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textSubtle,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12,
  },
  heldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  heldText: { fontSize: 16, fontWeight: '700' },
  reason: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 14, fontWeight: '600' },
  reportMeta: { backgroundColor: colors.surfaceRaised, borderRadius: 12, padding: 12, gap: 6 },
  reportMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  reportMetaLabel: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  reportMetaValue: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  responseText: { fontSize: 14, color: colors.textMain, lineHeight: 20, marginBottom: 8 },
  respondedAt: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  noResponse: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: colors.surfaceRaised, borderRadius: 12 },
  noResponseText: { fontSize: 14, color: colors.textSubtle, fontWeight: '600' },
  respondBtn: { marginTop: 14 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
});
