import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppDarkTheme, setAppDefaultFont, colors } from '@/theme';
import { toastConfig } from '@/components/ui/ToastConfig';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

// Keep the splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error if already prevented */
});

function NavigationGate() {
  const { isAuthenticated, requiresPasswordReset, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (isAuthenticated) {
      if (requiresPasswordReset) {
        // Force redirect to reset password screen
        if (segments[1] !== 'reset-password') {
          router.replace('/(auth)/reset-password');
        }
      } else if (inAuthGroup || !segments[0]) {
        // Authenticated user with valid reset status sent straight to home page
        router.replace('/(tabs)');
      }
    } else if (!isAuthenticated && inTabsGroup) {
      // Unauthenticated user trying to access tabs -> send to login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, requiresPasswordReset, isLoading, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textMain,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Source: require('../../assets/fonts/source-sans-pro-v14-latin-700.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppDefaultFont('Source');
      SplashScreen.hideAsync().catch(() => {
        /* ignore error */
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={AppDarkTheme}>
          <StatusBar style="light" backgroundColor={colors.background} />
          <NavigationGate />
          <Toast config={toastConfig} />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

