import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { CheckCircle, XCircle, MapPin, Clock, User } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Report } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ReportDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  report: Report | null;
  /** Show respond button if the viewer is the relevant lecturer */
  canRespond?: boolean;
  onRespondPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReportDetailBottomSheet: React.FC<ReportDetailBottomSheetProps> = ({
  visible,
  onClose,
  report,
  canRespond = false,
  onRespondPress,
}) => {
  if (!report) return null;

  const HeldIcon = report.held ? CheckCircle : XCircle;
  const heldColor = report.held ? colors.primary : colors.danger;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Report Details"
      subtitle={`${report.session.course.code} · ${report.session.date}`}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Session info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Session</Text>
          <View style={styles.infoRow}>
            <MapPin size={14} color={colors.textSubtle} />
            <Text style={styles.infoText}>{report.session.venue.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={14} color={colors.textSubtle} />
            <Text style={styles.infoText}>
              {report.session.startTime} – {report.session.endTime}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <User size={14} color={colors.textSubtle} />
            <Text style={styles.infoText}>
              {report.session.lecturers.map((l) => l.name).join(', ')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Report content */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Report</Text>

          <View style={styles.heldRow}>
            <HeldIcon size={16} color={heldColor} />
            <Text style={[styles.heldText, { color: heldColor }]}>
              {report.held ? 'Lecture was held' : 'Lecture was not held'}
            </Text>
          </View>

          <Text style={styles.reasonText}>{report.reason}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reported by</Text>
            <Text style={styles.metaValue}>{report.submittedBy}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reported at</Text>
            <Text style={styles.metaValue}>{formatDateTime(report.reportedAt)}</Text>
          </View>
        </View>

        {/* Lecturer response */}
        {report.lecturerResponse ? (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Lecturer Response</Text>
              <View style={styles.responseCard}>
                <Text style={styles.responseText}>{report.lecturerResponse}</Text>
                {report.respondedAt ? (
                  <Text style={styles.respondedAt}>
                    {formatDateTime(report.respondedAt)}
                  </Text>
                ) : null}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Badge variant="secondary">Awaiting lecturer response</Badge>
            </View>
          </>
        )}

        {canRespond && !report.lecturerResponse ? (
          <Button
            variant="primary"
            size="lg"
            onPress={onRespondPress}
            style={styles.respondBtn}
          >
            Respond to Report
          </Button>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  heldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  heldText: {
    fontSize: 14,
    fontWeight: '700',
  },
  reasonText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  responseCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  responseText: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
    marginBottom: 6,
  },
  respondedAt: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  respondBtn: {
    marginTop: 16,
  },
});
