import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { loginSchema, LoginSchema } from '@/lib/validation/auth';
import { useAuth } from '@/context/AuthContext';

export default function LoginRoute() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

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
      await login({
        identifier: data.id,
        password: data.password,
      });
      // Navigation is handled automatically by NavigationGate in _layout.tsx based on requiresPasswordReset status
    } catch (error: any) {
      const errorMsg =
        error?.message || 'Invalid credentials. Please check your Staff ID/Matric number and password.';
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

