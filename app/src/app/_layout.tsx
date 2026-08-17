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

function isMobileRoleAllowed(user: any): boolean {
  if (!user) return false;
  return (
    user.role === 'student' ||
    user.role === 'class_rep' ||
    user.role === 'lecturer' ||
    Boolean(user.isClassRep)
  );
}

function NavigationGate() {
  const { isAuthenticated, user, requiresPasswordReset, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const currentSubRoute = segments[1];

    if (isAuthenticated) {
      if (!isMobileRoleAllowed(user)) {
        // Authenticated user with non-mobile role (e.g. admin) -> redirect to unauthorized-role screen
        if (currentSubRoute !== 'unauthorized-role') {
          router.replace('/(auth)/unauthorized-role');
        }
      } else if (requiresPasswordReset) {
        // Force redirect to reset password screen
        if (currentSubRoute !== 'reset-password') {
          router.replace('/(auth)/reset-password');
        }
      } else if (inAuthGroup || !segments[0]) {
        // Authenticated user with valid reset status sent straight to home page
        router.replace('/(tabs)');
      }
    } else if (!isAuthenticated && (inTabsGroup || currentSubRoute === 'unauthorized-role')) {
      // Unauthenticated user trying to access tabs -> send to login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, user, requiresPasswordReset, isLoading, segments, router]);

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

