import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface HoldRateRingProps {
  percentage: number;         // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgStrokeColor?: string;
  textColor?: string;
  showText?: boolean;
}

export const HoldRateRing: React.FC<HoldRateRingProps> = ({
  percentage,
  size = 80,
  strokeWidth = 8,
  color = colors.primary,
  bgStrokeColor = 'rgba(255,255,255,0.18)',
  textColor = '#ffffff',
  showText = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validPercentage = Math.min(100, Math.max(0, percentage));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: validPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [validPercentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={bgStrokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      {showText && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={styles.textWrapper}>
            <Text style={[styles.percentageText, { color: textColor, fontSize: size * 0.22 }]}>
              {Math.round(validPercentage)}%
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontWeight: '800',
    textAlign: 'center',
  },
});
