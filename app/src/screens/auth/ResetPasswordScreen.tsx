import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Control } from 'react-hook-form';
import { Lock, Eye, EyeOff, User } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { ResetPasswordSchema } from '@/lib/validation/auth';

export interface ResetPasswordScreenProps {
  onSubmit: () => void;
  isLoading: boolean;
  control: Control<ResetPasswordSchema>;
  userIdentifier?: string;
  onNavigateToLogin: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  onSubmit,
  isLoading,
  control,
  userIdentifier = 'User',
  onNavigateToLogin,
}) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Top Brand Logo & App Name */}
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>NSUK TimeMap</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Set a new password for your account.</Text>
          </View>

          {/* Account Identifier Card */}
          <Card variant="raised" style={styles.userCard}>
            <View style={styles.userAvatar}>
              <User size={16} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userLabel}>Account Identifier</Text>
              <Text style={styles.userIdentifierText}>{userIdentifier}</Text>
            </View>
          </Card>

          {/* Form Fields */}
          <View style={styles.form}>
            <FormField<ResetPasswordSchema>
              name="newPassword"
              control={control}
              render={({ value, onChange, onBlur, error }) => (
                <Input
                  label="New Password"
                  placeholder="••••••••"
                  secureTextEntry={!showNewPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error}
                  leftIcon={<Lock size={18} color={colors.textSubtle} />}
                  rightIcon={
                    <Pressable
                      onPress={() => setShowNewPassword((prev) => !prev)}
                      hitSlop={8}
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} color={colors.textMuted} />
                      ) : (
                        <Eye size={18} color={colors.textMuted} />
                      )}
                    </Pressable>
                  }
                  autoCapitalize="none"
                />
              )}
            />

            <FormField<ResetPasswordSchema>
              name="confirmPassword"
              control={control}
              render={({ value, onChange, onBlur, error }) => (
                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  secureTextEntry={!showConfirmPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error}
                  leftIcon={<Lock size={18} color={colors.textSubtle} />}
                  rightIcon={
                    <Pressable
                      onPress={() => setShowConfirmPassword((prev) => !prev)}
                      hitSlop={8}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} color={colors.textMuted} />
                      ) : (
                        <Eye size={18} color={colors.textMuted} />
                      )}
                    </Pressable>
                  }
                  autoCapitalize="none"
                />
              )}
            />

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <Button
                variant="primary"
                size="lg"
                isLoading={isLoading}
                onPress={onSubmit}
              >
                Reset Password
              </Button>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Not your account?{' '}
              <Text style={styles.linkText} onPress={onNavigateToLogin}>
                Back to login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  userIdentifierText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  form: {
    marginBottom: 24,
  },
  submitContainer: {
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
