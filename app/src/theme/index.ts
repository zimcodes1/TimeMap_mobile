import { DarkTheme as NavigationDarkTheme, Theme } from '@react-navigation/native';
import { colors } from './colors';

export const AppDarkTheme: Theme = {
  ...NavigationDarkTheme,
  dark: true,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textMain,
    border: colors.border,
    notification: colors.primary,
  },
};

export * from './colors';
export * from './typography';
