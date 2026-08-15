import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Report } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LecturerResponseBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  report: Report | null;
  /**
   * TODO(api-wiring): replace with POST /api/reporting/reports/{id}/respond/
   */
  onSubmit: (payload: { reportId: string; responseText: string }) => void;
  isSubmitting?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LecturerResponseBottomSheet: React.FC<LecturerResponseBottomSheetProps> = ({
  visible,
  onClose,
  report,
  onSubmit,
  isSubmitting = false,
}) => {
  const [responseText, setResponseText] = useState('');

  const handleSubmit = () => {
    if (!report) return;
    onSubmit({ reportId: report.id, responseText });
  };

  const canSubmit = responseText.trim().length >= 5 && !isSubmitting;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Respond to Report"
      subtitle={report ? `${report.session.course.code} · ${report.session.date}` : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {report ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Report Summary</Text>
            <Text style={styles.summaryValue}>
              {report.held ? '✓ Held' : '✗ Not Held'} — {report.reason}
            </Text>
            <Text style={styles.repLabel}>
              Submitted by {report.submittedBy}
            </Text>
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>Your Response</Text>
        <TextInput
          style={styles.textarea}
          value={responseText}
          onChangeText={setResponseText}
          placeholder="Provide your clarification or dispute…"
          placeholderTextColor={colors.textSubtle}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        {responseText.trim().length > 0 && responseText.trim().length < 5 ? (
          <Text style={styles.errorText}>At least 5 characters required.</Text>
        ) : null}

        <View style={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            Submit Response
          </Button>
          <Button variant="ghost" size="md" onPress={onClose}>
            Cancel
          </Button>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textMain,
    fontWeight: '600',
    marginBottom: 4,
  },
  repLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  textarea: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    color: colors.textMain,
    fontSize: 14,
    fontFamily: 'Source',
    minHeight: 120,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '600',
  },
  actions: {
    marginTop: 20,
    gap: 8,
  },
});
