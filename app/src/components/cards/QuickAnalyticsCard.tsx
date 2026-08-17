import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, TrendingUp } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { HoldRateRing } from '@/components/common/HoldRateRing';
import { AnalyticsSummary } from '@/types';

export interface QuickAnalyticsCardProps {
  summary?: AnalyticsSummary;
  onPress: () => void;
}

export const QuickAnalyticsCard: React.FC<QuickAnalyticsCardProps> = ({
  summary,
  onPress,
}) => {
  const holdRate = summary?.holdRatePercentage ?? 83.3;
  const heldCount = summary?.heldCount ?? 10;
  const totalSessions = summary?.totalSessions ?? 12;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Left content */}
      <View style={styles.content}>
        <View style={styles.tagRow}>
          <TrendingUp size={14} color="rgba(255,255,255,0.9)" />
          <Text style={styles.tagText}>Lecture Hold Rate</Text>
        </View>
        <Text style={styles.headline}>{Math.round(holdRate)}% Hold Rate</Text>
        <Text style={styles.subtext}>
          {heldCount} of {totalSessions} scheduled lectures held
        </Text>
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>View Detailed Analytics</Text>
          <ChevronRight size={14} color="#ffffff" />
        </View>
      </View>

      {/* Right side ring */}
      <View style={styles.ringWrapper}>
        <HoldRateRing
          percentage={holdRate}
          size={74}
          strokeWidth={7}
          color="#ffffff"
          bgStrokeColor="rgba(255,255,255,0.25)"
          textColor="#ffffff"
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  subtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
