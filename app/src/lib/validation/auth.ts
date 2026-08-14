import { z } from 'zod';

export const loginSchema = z.object({
  id: z.string().min(1, 'Identifier (Staff ID / Matric Number) is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email or Staff ID is required'),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
