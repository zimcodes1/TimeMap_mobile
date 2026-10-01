import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Session } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SubmitReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  session: Session | null;
  /**
   * Called when the user submits.
   * TODO(api-wiring): replace with real POST /api/reporting/reports/ call.
   */
  onSubmit: (payload: { lectureSession: string; held: boolean; reason: string }) => void;
  isSubmitting?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SubmitReportBottomSheet: React.FC<SubmitReportBottomSheetProps> = ({
  visible,
  onClose,
  session,
  onSubmit,
  isSubmitting = false,
}) => {
  // Lecture held toggle is OFF by default
  const [held, setHeld] = useState(false);
  const [reason, setReason] = useState('');

  // Reset form when sheet opens
  React.useEffect(() => {
    if (visible) {
      setHeld(false);
      setReason('');
    }
  }, [visible]);

  // If held is true, reason is not required and disabled.
  // If held is false, reason is strictly required (min 5 chars).
  const canSubmit = !isSubmitting && (held || reason.trim().length >= 5);

  const handleSubmit = () => {
    if (!session || !canSubmit) return;
    const finalReason = held ? (reason.trim() || 'Lecture held as scheduled') : reason.trim();
    onSubmit({ lectureSession: session.id, held, reason: finalReason });
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Submit Report"
      subtitle={session ? `${session.course.code} · ${session.date}` : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Held toggle - default off */}
        <View style={styles.section}>
          <Toggle
            value={held}
            onValueChange={setHeld}
            label="Lecture was held"
            description={held ? "Session will be recorded as held." : "Turn on if the lecturer conducted the class."}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Reason / Notes */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Reason / Notes</Text>
            {!held ? (
              <Text style={styles.requiredBadge}>Required</Text>
            ) : (
              <Text style={styles.optionalBadge}>Disabled</Text>
            )}
          </View>

          <TextInput
            style={[
              styles.textarea,
              held && styles.textareaDisabled,
            ]}
            value={held ? '' : reason}
            onChangeText={setReason}
            editable={!held && !isSubmitting}
            placeholder={
              held
                ? 'Notes are disabled when lecture was held.'
                : 'Describe why the lecture was not held (e.g. lecturer absent, venue clash)…'
            }
            placeholderTextColor={colors.textSubtle}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {!held && reason.trim().length > 0 && reason.trim().length < 5 ? (
            <Text style={styles.errorText}>At least 5 characters required.</Text>
          ) : !held && reason.trim().length === 0 ? (
            <Text style={styles.hintText}>Please specify a reason why the lecture was not held.</Text>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            Submit Report
          </Button>
          <Button variant="ghost" size="md" onPress={onClose} style={styles.cancelBtn} disabled={isSubmitting}>
            Cancel
          </Button>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  requiredBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
  },
  optionalBadge: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSubtle,
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
    minHeight: 100,
  },
  textareaDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    opacity: 0.6,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 4,
  },
  actions: {
    marginTop: 20,
    gap: 8,
  },
  cancelBtn: {
    marginTop: 2,
  },
});
