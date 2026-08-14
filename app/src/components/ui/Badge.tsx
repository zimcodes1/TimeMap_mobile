import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  style,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'secondary':
        return { bg: colors.surfaceRaised, text: colors.textMuted, border: colors.border };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: colors.danger, border: 'rgba(239, 68, 68, 0.3)' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: colors.warning, border: 'rgba(245, 158, 11, 0.3)' };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: colors.info, border: 'rgba(59, 130, 246, 0.3)' };
      case 'primary':
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.primary, border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const themeConfig = getBadgeStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: themeConfig.bg, borderColor: themeConfig.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: themeConfig.text }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
