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
import { IdCard, Lock, Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { LoginSchema } from '@/lib/validation/auth';

export interface LoginScreenProps {
  onSubmit: () => void;
  isLoading: boolean;
  control: Control<LoginSchema>;
  onNavigateToForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSubmit,
  isLoading,
  control,
  onNavigateToForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);

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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your TimeMap account</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <FormField<LoginSchema>
              name="id"
              control={control}
              render={({ value, onChange, onBlur, error }) => (
                <Input
                  label="Identifier"
                  placeholder="Staff ID or Matric Number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error}
                  leftIcon={<IdCard size={18} color={colors.textSubtle} />}
                  autoCapitalize="none"
                />
              )}
            />

            <FormField<LoginSchema>
              name="password"
              control={control}
              render={({ value, onChange, onBlur, error }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error}
                  leftIcon={<Lock size={18} color={colors.textSubtle} />}
                  rightIcon={
                    <Pressable
                      onPress={() => setShowPassword((prev) => !prev)}
                      hitSlop={8}
                    >
                      {showPassword ? (
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

            {/* Forgot Password Link */}
            <View style={styles.forgotRow}>
              <Pressable onPress={onNavigateToForgotPassword} hitSlop={8}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <Button
                variant="primary"
                size="lg"
                isLoading={isLoading}
                onPress={onSubmit}
              >
                Sign in
              </Button>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.contactText}>Contact your administrator</Text>
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
    marginBottom: 24,
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
  form: {
    marginBottom: 24,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  submitContainer: {
    marginTop: 4,
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
  contactText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
