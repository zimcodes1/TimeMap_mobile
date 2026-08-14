import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { loginSchema, LoginSchema } from '@/lib/validation/auth';

export default function LoginRoute() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { control, handleSubmit } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      // Simulate/Execute login API request
      console.log('Logging in with:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back to TimeMap!',
      });

      // Navigate to main app index or dashboard
      router.replace('/');
    } catch (error: any) {
      const errorMsg =
        error?.message || 'Invalid credentials. Please check your Staff ID and password.';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <LoginScreen
      control={control}
      isLoading={isLoading}
      onSubmit={onSubmit}
      onNavigateToForgotPassword={() => router.push('/(auth)/forgot-password')}
    />
  );
}
