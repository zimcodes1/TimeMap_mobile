import React from 'react';
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
import { Mail } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { ForgotPasswordSchema } from '@/lib/validation/auth';

export interface ForgotPasswordScreenProps {
  onSubmit: () => void;
  isLoading: boolean;
  control: Control<ForgotPasswordSchema>;
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onSubmit,
  isLoading,
  control,
  onNavigateToLogin,
}) => {
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
            <Text style={styles.title}>Forgot Your Password?</Text>
            <Text style={styles.subtitle}>
              Provide your email or Staff ID to get a reset code.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <FormField<ForgotPasswordSchema>
              name="email"
              control={control}
              render={({ value, onChange, onBlur, error }) => (
                <Input
                  label="Email or Staff ID"
                  placeholder="example@gmail.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error}
                  leftIcon={<Mail size={18} color={colors.textSubtle} />}
                  keyboardType="email-address"
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
                Send Code
              </Button>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember Password?{' '}
              <Text style={styles.linkText} onPress={onNavigateToLogin}>
                Login to your account
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
  submitContainer: {
    marginTop: 16,
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
