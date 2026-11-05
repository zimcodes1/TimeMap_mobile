import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Session } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CancelLectureBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  session: Session | null;
  onConfirmCancel: (reason: string) => void;
  isCancelling?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CancelLectureBottomSheet: React.FC<CancelLectureBottomSheetProps> = ({
  visible,
  onClose,
  session,
  onConfirmCancel,
  isCancelling = false,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visible) {
      setReason('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (isCancelling) return;
    onConfirmCancel(reason.trim() || 'Cancelled by lecturer');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Cancel Lecture"
      subtitle={session ? `${session.course.code} · ${session.date}` : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Warning Banner */}
        <View style={styles.warningBox}>
          <AlertTriangle size={20} color={colors.danger} />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Are you sure?</Text>
            <Text style={styles.warningBody}>
              Cancelling this lecture will update its status to Cancelled and immediately notify enrolled students and class reps.
            </Text>
          </View>
        </View>

        {/* Reason field */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Reason for cancellation (optional)</Text>
          <TextInput
            style={styles.textarea}
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. Lecturer unavailable, departmental meeting…"
            placeholderTextColor={colors.textSubtle}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isCancelling}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            variant="danger"
            size="lg"
            onPress={handleConfirm}
            isLoading={isCancelling}
            disabled={isCancelling}
          >
            Confirm Cancellation
          </Button>
          <Button
            variant="ghost"
            size="md"
            onPress={onClose}
            disabled={isCancelling}
            style={styles.cancelBtn}
          >
            Keep Lecture
          </Button>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: `${colors.danger}15`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  warningTextContainer: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  warningBody: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  section: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMain,
    marginBottom: 8,
  },
  textarea: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    color: colors.textMain,
    fontSize: 13,
    minHeight: 70,
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    marginTop: 2,
  },
});
