import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';
import { resetPasswordSchema, ResetPasswordSchema } from '@/lib/validation/auth';

export default function ResetPasswordRoute() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      console.log('Resetting password:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'Your password has been updated. Please sign in.',
      });

      router.replace('/(auth)/login');
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

  return (
    <ResetPasswordScreen
      control={control}
      isLoading={isLoading}
      onSubmit={onSubmit}
      userIdentifier="Staff / User Account"
      onNavigateToLogin={() => router.replace('/(auth)/login')}
    />
  );
}
