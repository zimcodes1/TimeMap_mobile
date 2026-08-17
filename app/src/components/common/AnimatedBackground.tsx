import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import {
  Bell,
  Clock,
  Calendar,
  MapPin,
  Megaphone,
  Users,
  ClipboardCheck,
  BookOpen,
  Flag,
  Book,
  GraduationCap,
  Timer,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import Logo from './Logo';

interface IconNodeConfig {
  Icon: React.ElementType;
  angleDeg: number;
  highlight?: boolean;
}

export const AnimatedBackground: React.FC = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Compute responsive radii based on screen dimensions
  const baseDim = Math.min(windowWidth, windowHeight);
  const innerRadius = Math.max(65, Math.min(baseDim * 0.18, 95));
  const middleRadius = Math.max(125, Math.min(baseDim * 0.35, 175));
  const outerRadius = Math.max(185, Math.min(baseDim * 0.52, 255));

  // Animation drivers
  const innerAnim = useRef(new Animated.Value(0)).current;
  const middleAnim = useRef(new Animated.Value(0)).current;
  const outerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous rotation for Inner Orbit (Clockwise, 32s)
    const innerLoop = Animated.loop(
      Animated.timing(innerAnim, {
        toValue: 1,
        duration: 32000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Continuous rotation for Middle Orbit (Counter-clockwise, 44s)
    const middleLoop = Animated.loop(
      Animated.timing(middleAnim, {
        toValue: 1,
        duration: 44000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Continuous rotation for Outer Orbit (Clockwise, 58s)
    const outerLoop = Animated.loop(
      Animated.timing(outerAnim, {
        toValue: 1,
        duration: 58000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Gentle pulsing for the center core
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    innerLoop.start();
    middleLoop.start();
    outerLoop.start();
    pulseLoop.start();

    return () => {
      innerLoop.stop();
      middleLoop.stop();
      outerLoop.stop();
      pulseLoop.stop();
    };
  }, [innerAnim, middleAnim, outerAnim, pulseAnim]);

  // Rotations
  const innerSpin = innerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const innerCounterSpin = innerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const middleSpin = middleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const middleCounterSpin = middleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const outerSpin = outerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const outerCounterSpin = outerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  // Icon nodes definitions
  const innerIcons: IconNodeConfig[] = [
    { Icon: Calendar, angleDeg: 270, highlight: true }, // top
    { Icon: MapPin, angleDeg: 35 },
    { Icon: BookOpen, angleDeg: 160 },
    { Icon: Clock, angleDeg: 220 },
  ];

  const middleIcons: IconNodeConfig[] = [
    { Icon: Bell, angleDeg: 290, highlight: true },
    { Icon: Timer, angleDeg: 45 },
    { Icon: Megaphone, angleDeg: 125 },
    { Icon: Users, angleDeg: 195 },
    { Icon: ClipboardCheck, angleDeg: 240 },
  ];

  const outerIcons: IconNodeConfig[] = [
    { Icon: Book, angleDeg: 315 },
    { Icon: GraduationCap, angleDeg: 75, highlight: true },
    { Icon: Flag, angleDeg: 180 },
  ];

  // Helper to render nodes on orbit circumference
  const renderOrbitNodes = (
    nodes: IconNodeConfig[],
    radius: number,
    counterSpinAnim: Animated.AnimatedInterpolation<string | number>
  ) => {
    return nodes.map((node, index) => {
      const rad = (node.angleDeg * Math.PI) / 180;
      const x = radius * Math.cos(rad);
      const y = radius * Math.sin(rad);

      return (
        <View
          key={index}
          style={[
            styles.nodePositioner,
            {
              transform: [{ translateX: x }, { translateY: y }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconBubble,
              node.highlight && styles.iconBubbleHighlight,
              { transform: [{ rotate: counterSpinAnim }] },
            ]}
          >
            <node.Icon
              size={18}
              color={node.highlight ? colors.primary : colors.textMuted}
            />
          </Animated.View>
        </View>
      );
    });
  };

  // Decorative dots along orbit lines
  const renderOrbitDots = (radius: number, angles: number[]) => {
    return angles.map((angleDeg, idx) => {
      const rad = (angleDeg * Math.PI) / 180;
      const x = radius * Math.cos(rad);
      const y = radius * Math.sin(rad);
      return (
        <View
          key={idx}
          style={[
            styles.sparkleDot,
            { transform: [{ translateX: x }, { translateY: y }] },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>

      {/* Orbit Canvas Container centered in the upper portion */}
      <View style={styles.orbitCenter}>

        {/* ── Outer Orbit Ring (Circumference) ────────────────────── */}
        <View
          style={[
            styles.orbitLine,
            {
              width: outerRadius * 2,
              height: outerRadius * 2,
              borderRadius: outerRadius,
              borderColor: 'rgba(255, 255, 255, 0.04)',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orbitLayer,
            {
              width: outerRadius * 2,
              height: outerRadius * 2,
              transform: [{ rotate: outerSpin }],
            },
          ]}
        >
          {renderOrbitNodes(outerIcons, outerRadius, outerCounterSpin)}
          {renderOrbitDots(outerRadius, [20, 130, 230])}
        </Animated.View>

        {/* ── Middle Orbit Ring (Circumference) ───────────────────── */}
        <View
          style={[
            styles.orbitLine,
            {
              width: middleRadius * 2,
              height: middleRadius * 2,
              borderRadius: middleRadius,
              borderColor: 'rgba(255, 255, 255, 0.06)',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orbitLayer,
            {
              width: middleRadius * 2,
              height: middleRadius * 2,
              transform: [{ rotate: middleSpin }],
            },
          ]}
        >
          {renderOrbitNodes(middleIcons, middleRadius, middleCounterSpin)}
          {renderOrbitDots(middleRadius, [90, 160, 330])}
        </Animated.View>

        {/* ── Inner Orbit Ring (Circumference) ────────────────────── */}
        <View
          style={[
            styles.orbitLine,
            {
              width: innerRadius * 2,
              height: innerRadius * 2,
              borderRadius: innerRadius,
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orbitLayer,
            {
              width: innerRadius * 2,
              height: innerRadius * 2,
              transform: [{ rotate: innerSpin }],
            },
          ]}
        >
          {renderOrbitNodes(innerIcons, innerRadius, innerCounterSpin)}
          {renderOrbitDots(innerRadius, [100, 300])}
        </Animated.View>

        {/* ── Central Sparkle Core ────────────────────────────────── */}
        <Animated.View
          style={[
            styles.centerCore,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.centerGlowRing}>
            <Logo size={32}></Logo>
          </View>
        </Animated.View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  orbitCenter: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitLine: {
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  orbitLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodePositioner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  iconBubbleHighlight: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.primaryMuted,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sparkleDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  centerCore: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGlowRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
