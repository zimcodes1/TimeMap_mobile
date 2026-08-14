import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { AppDarkTheme, setAppDefaultFont, colors } from '@/theme';
import { toastConfig } from '@/components/ui/ToastConfig';

// Keep the splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error if already prevented */
});

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
    <ThemeProvider value={AppDarkTheme}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textMain,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}
