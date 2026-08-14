import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { FONT_FAMILY } from '@/theme/typography';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'muted';
  color?: string;
  weight?: '400' | '600' | '700' | 'bold';
  children?: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  weight,
  style,
  children,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'caption':
        return styles.caption;
      case 'muted':
        return styles.muted;
      case 'body':
      default:
        return styles.body;
    }
  };

  const customStyle = [
    styles.defaultFont,
    getVariantStyle(),
    color ? { color } : null,
    weight ? { fontWeight: weight } : null,
    style,
  ];

  return (
    <RNText style={customStyle} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: FONT_FAMILY.Source,
    color: colors.textMain,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textMain,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
  },
  body: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
  },
  caption: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  muted: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
