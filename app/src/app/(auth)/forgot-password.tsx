import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { forgotPasswordSchema, ForgotPasswordSchema } from '@/lib/validation/auth';

export default function ForgotPasswordRoute() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { control, handleSubmit } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      console.log('Sending reset code to:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Toast.show({
        type: 'success',
        text1: 'Code Sent',
        text2: 'If an account exists, instructions have been sent.',
      });

      router.push('/(auth)/reset-password');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: error?.message || 'Failed to send reset code.',
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <ForgotPasswordScreen
      control={control}
      isLoading={isLoading}
      onSubmit={onSubmit}
      onNavigateToLogin={() => router.replace('/(auth)/login')}
    />
  );
}
