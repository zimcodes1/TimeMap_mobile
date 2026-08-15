import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Eye, FileText, Calendar } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Session } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SessionQuickActionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  session: Session | null;
  isClassRep: boolean;
  onViewDetails: () => void;
  onSubmitReport: () => void;
}

// ─── Action row component (internal) ─────────────────────────────────────────

interface ActionRowProps {
  Icon: React.ElementType;
  iconColor?: string;
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
}

const ActionRow: React.FC<ActionRowProps> = ({
  Icon,
  iconColor,
  label,
  description,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
  >
    <View style={[styles.iconBox, iconColor ? { backgroundColor: `${iconColor}18` } : {}]}>
      <Icon size={20} color={iconColor ?? colors.textMuted} />
    </View>
    <View style={styles.actionText}>
      <Text style={styles.actionLabel}>{label}</Text>
      {description ? <Text style={styles.actionDesc}>{description}</Text> : null}
    </View>
  </Pressable>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const SessionQuickActionsBottomSheet: React.FC<SessionQuickActionsBottomSheetProps> = ({
  visible,
  onClose,
  session,
  isClassRep,
  onViewDetails,
  onSubmitReport,
}) => {
  const reportWindowOpen = session?.reportWindowOpen && !session?.reportId;
  const alreadyReported = !!session?.reportId;

  const handleViewDetails = () => {
    onClose();
    setTimeout(onViewDetails, 180);
  };

  const handleSubmitReport = () => {
    onClose();
    setTimeout(onSubmitReport, 180);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={session?.course.code ?? 'Session Actions'}
      subtitle={session ? `${session.date} · ${session.startTime}–${session.endTime}` : undefined}
    >
      <View style={styles.list}>
        <ActionRow
          Icon={Eye}
          iconColor={colors.info}
          label="View Session Details"
          description="See full session info and report history"
          onPress={handleViewDetails}
        />

        {isClassRep && reportWindowOpen ? (
          <ActionRow
            Icon={FileText}
            iconColor={colors.primary}
            label="Submit Report"
            description="Window is open — report this session now"
            onPress={handleSubmitReport}
          />
        ) : null}

        {alreadyReported ? (
          <View style={styles.disabledRow}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.primary}18` }]}>
              <FileText size={20} color={colors.primary} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Report Submitted</Text>
              <Text style={styles.actionDesc}>You already reported this session</Text>
            </View>
          </View>
        ) : null}

        <ActionRow
          Icon={Calendar}
          iconColor={colors.textSubtle}
          label="Add to Calendar"
          description="Coming soon"
          onPress={() => {}}
        />
      </View>
    </BottomSheet>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    gap: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
  },
  disabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    opacity: 0.5,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    flexShrink: 0,
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  actionDesc: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
    marginTop: 1,
  },
});
