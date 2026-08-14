import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';

export interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Input = forwardRef<RNTextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      style,
      onFocus,
      onBlur,
      editable = true,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.focusedBorder,
            !!error && styles.errorBorder,
            !editable && styles.disabledWrapper,
          ]}
        >
          {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

          <RNTextInput
            ref={ref}
            editable={editable}
            placeholderTextColor={colors.textSubtle}
            style={[
              styles.input,
              leftIcon ? styles.inputWithLeftIcon : null,
              rightIcon ? styles.inputWithRightIcon : null,
              style,
            ]}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />

          {rightIcon ? <View style={styles.rightIconContainer}>{rightIcon}</View> : null}
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    position: 'relative',
  },
  focusedBorder: {
    borderColor: colors.primary,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
  disabledWrapper: {
    opacity: 0.5,
    backgroundColor: colors.surfaceRaised,
  },
  input: {
    flex: 1,
    color: colors.textMain,
    fontSize: 15,
    fontFamily: 'Source',
    height: '100%',
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
