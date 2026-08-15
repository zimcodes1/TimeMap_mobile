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
  const [held, setHeld] = useState(true);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!session) return;
    onSubmit({ lectureSession: session.id, held, reason });
  };

  const canSubmit = reason.trim().length >= 5 && !isSubmitting;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Submit Report"
      subtitle={session ? `${session.course.code} · ${session.date}` : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Held toggle */}
        <View style={styles.section}>
          <Toggle
            value={held}
            onValueChange={setHeld}
            label="Lecture was held"
            description="Turn off if the lecturer did not show up."
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Reason / Notes</Text>
          <TextInput
            style={styles.textarea}
            value={reason}
            onChangeText={setReason}
            placeholder="Describe what happened during this session…"
            placeholderTextColor={colors.textSubtle}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {reason.trim().length > 0 && reason.trim().length < 5 ? (
            <Text style={styles.errorText}>At least 5 characters required.</Text>
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
          <Button variant="ghost" size="md" onPress={onClose} style={styles.cancelBtn}>
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
    minHeight: 100,
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
  cancelBtn: {
    marginTop: 2,
  },
});
