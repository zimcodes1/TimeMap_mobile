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

export const studentRegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    matricNumber: z.string().min(3, 'Matric number is required'),
    email: z.string().email('Please enter a valid email address'),
    facultyId: z.number({ message: 'Please select a faculty' }).min(1, 'Please select a faculty'),
    departmentId: z.number({ message: 'Please select a department' }).min(1, 'Please select a department'),
    programId: z.number({ message: 'Please select a program' }).min(1, 'Please select a program'),
    level: z.number({ message: 'Please select your level' }).min(100, 'Please select your level'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type StudentRegisterSchema = z.infer<typeof studentRegisterSchema>;

