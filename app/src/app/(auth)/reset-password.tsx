import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';
import { resetPasswordSchema, ResetPasswordSchema } from '@/lib/validation/auth';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordRoute() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, resetPassword } = useAuth();

  const { control, handleSubmit } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      await resetPassword(data.newPassword);
      // Navigation is handled automatically by NavigationGate in _layout.tsx once requiresPasswordReset is updated
    } catch (error: any) {
      const errorMsg =
        error?.message || 'Failed to reset password. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  });

  const displayIdentifier =
    user?.matricNumber || user?.staffId || user?.email || 'User Account';

  return (
    <ResetPasswordScreen
      control={control}
      isLoading={isLoading}
      onSubmit={onSubmit}
      userIdentifier={displayIdentifier}
      onNavigateToLogin={() => router.replace('/(auth)/login')}
    />
  );
}

