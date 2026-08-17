import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Zap, Calendar, Bell } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/ui/Button';
import { AnimatedBackground } from '@/components/common/AnimatedBackground';

export interface WelcomeScreenProps {
  onLoginPress: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginPress }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  // Float-in animation driver
  const slideAnim = useRef(new Animated.Value(90)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      {/* ── Orbital Background ───────────────────────────────────── */}
      <AnimatedBackground />

      {/* ── Floating Bottom Sheet Overlay ───────────────────────── */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.floatingSheet,
              {
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >

            {/* Brand Row */}
            <View style={styles.brandRow}>
              <Image
                source={require('../../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>NSUK TimeMap</Text>
              </View>
            </View>

            {/* Headline & Description */}
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
              Your Smart Timetable
            </Text>
            <Text style={styles.subtitle}>
              Real-time schedule updates and instant venue change notifications.
            </Text>

            {/* Feature Pills */}
            <View style={styles.featureRow}>
              <View style={styles.featureChip}>
                <Zap size={13} color={colors.primary} />
                <Text style={styles.featureChipText}>Live Shifts</Text>
              </View>
              <View style={styles.featureChip}>
                <Calendar size={13} color={colors.info} />
                <Text style={styles.featureChipText}>Smart Agenda</Text>
              </View>
              <View style={styles.featureChip}>
                <Bell size={13} color={colors.warning} />
                <Text style={styles.featureChipText}>Instant Alerts</Text>
              </View>
            </View>

            {/* Main Action Button */}
            <View style={styles.actionContainer}>
              <Button
                variant="primary"
                size="lg"
                onPress={onLoginPress}
                rightIcon={<ArrowRight size={18} color={colors.primaryForeground} />}
              >
                Get Started
              </Button>
            </View>

            {/* Secondary Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Need help accessing your account?{' '}
                <Text style={styles.footerLink}>Contact Admin</Text>
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  floatingSheet: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textMain,
    lineHeight: 32,
    marginBottom: 8,
    marginTop: 10,
  },
  titleSmall: {
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
  },
  actionContainer: {
    marginBottom: 14,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  footerLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
