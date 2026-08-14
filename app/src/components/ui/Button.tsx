import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  children,
  style,
  ...props
}) => {
  const isButtonDisabled = disabled || isLoading;

  const getVariantContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'ghost':
        return styles.ghostContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getVariantTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'danger':
        return styles.dangerText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeContainerStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smContainer;
      case 'lg':
        return styles.lgContainer;
      case 'md':
      default:
        return styles.mdContainer;
    }
  };

  const getSizeTextStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smText;
      case 'lg':
        return styles.lgText;
      case 'md':
      default:
        return styles.mdText;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isButtonDisabled}
      style={[
        styles.baseContainer,
        getVariantContainerStyle(),
        getSizeContainerStyle(),
        fullWidth ? styles.fullWidth : null,
        isButtonDisabled ? styles.disabledContainer : null,
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#ffffff' : colors.primary}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text style={[getVariantTextStyle(), getSizeTextStyle()]}>
            {children}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Variants Container
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.surfaceRaised,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: colors.danger,
  },

  // Variants Text
  primaryText: {
    color: colors.primaryForeground,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.textMain,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.textMain,
    fontWeight: '600',
  },
  ghostText: {
    color: colors.primary,
    fontWeight: '600',
  },
  dangerText: {
    color: colors.dangerForeground,
    fontWeight: '700',
  },

  // Sizes Container
  smContainer: {
    height: 38,
    paddingHorizontal: 14,
  },
  mdContainer: {
    height: 48,
    paddingHorizontal: 20,
  },
  lgContainer: {
    height: 54,
    paddingHorizontal: 24,
  },

  // Sizes Text
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 16,
  },
});
