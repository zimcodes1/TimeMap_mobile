import React from 'react';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { colors } from '@/theme/colors';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.primary,
        borderLeftWidth: 5,
        borderRadius: 12,
        height: 64,
        borderColor: colors.border,
        borderWidth: 1,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: colors.textMain,
        fontFamily: 'Source',
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
        fontFamily: 'Source',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.danger,
        borderLeftWidth: 5,
        borderRadius: 12,
        height: 64,
        borderColor: colors.border,
        borderWidth: 1,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: colors.textMain,
        fontFamily: 'Source',
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
        fontFamily: 'Source',
      }}
    />
  ),
};
