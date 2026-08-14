import React from 'react';
import { View, Switch as RNSwitch, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.container,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {label || description ? (
        <View style={styles.textContainer}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      ) : null}

      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.surfaceRaised,
          true: colors.primary,
        }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.surfaceRaised}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
