import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'flat' | 'raised' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'flat',
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'raised':
        return styles.raised;
      case 'outlined':
        return styles.outlined;
      case 'flat':
      default:
        return styles.flat;
    }
  };

  return (
    <View style={[styles.base, getVariantStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
  },
  flat: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  raised: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
