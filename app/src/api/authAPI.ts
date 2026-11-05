import { apiClient } from './apiClient';
import { UserProfile } from '@/types';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface BackendUser {
  id: number;
  identifier: string;
  role: 'student' | 'class_rep' | 'lecturer' | 'admin';
  requires_password_reset: boolean;
  is_active: boolean;
}

export interface BackendProfile {
  id: number;
  matric_number?: string;
  staff_id?: string;
  full_name: string;
  department: string | number;
  program?: string;
  program_name?: string;
  program_code?: string;
  level?: number | string;
  is_class_rep?: boolean;
  email: string;
}

export interface LoginResponse {
  user: BackendUser;
  tokens: {
    access: string;
    refresh: string;
  };
  requires_password_reset: boolean;
  profile: BackendProfile;
}

export interface PasswordResetPayload {
  new_password: string;
}

export interface StudentSignupPayload {
  matric_number: string;
  full_name: string;
  email: string;
  faculty?: number;
  department: number;
  program: number;
  level: number;
  password: string;
}

export interface HierarchyOption {
  id: number;
  name: string;
  code: string;
}

export interface DepartmentOption extends HierarchyOption {
  faculty_id: number;
}

export interface ProgramOption extends HierarchyOption {
  department_id: number;
  max_level: number;
  is_default?: boolean;
}

export interface RegistrationOptionsResponse {
  faculties: HierarchyOption[];
  departments: DepartmentOption[];
  programs: ProgramOption[];
}

export interface PasswordResetResponse {
  detail: string;
}

export interface ProfileResponse {
  user: BackendUser;
  profile: BackendProfile;
}

/**
 * Mapper helper to transform backend user/profile format into mobile UserProfile model
 */
export function mapBackendToUserProfile(
  user: BackendUser,
  profile: BackendProfile,
  requiresPasswordResetOverride?: boolean
): UserProfile {
  const isClassRep = profile.is_class_rep ?? (user.role === 'class_rep');
  const levelStr = profile.level ? `${profile.level}L` : undefined;
  const programStr = profile.program_name ?? (typeof profile.program === 'string' ? profile.program : undefined);

  return {
    id: String(user.id),
    fullName: profile.full_name,
    matricNumber: profile.matric_number,
    staffId: profile.staff_id,
    email: profile.email,
    role: isClassRep ? 'class_rep' : user.role,
    isClassRep: Boolean(isClassRep),
    department: String(profile.department),
    program: programStr,
    level: levelStr,
    requiresPasswordReset: requiresPasswordResetOverride ?? user.requires_password_reset,
    pushEnabled: true,
  };
}

export const authAPI = {
  /**
   * Authenticate user with identifier and password
   * POST /api/auth/login/
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  /**
   * Register a new student account
   * POST /api/auth/signup/
   */
  async signup(payload: StudentSignupPayload): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  /**
   * Fetch faculties, departments, and programs for registration
   * GET /api/auth/registration-options/
   */
  async getRegistrationOptions(): Promise<RegistrationOptionsResponse> {
    return apiClient<RegistrationOptionsResponse>('/auth/registration-options/', {
      method: 'GET',
      skipAuth: true,
    });
  },

  /**
   * Perform mandatory first-time password reset
   * POST /api/auth/password-reset/
   */
  async passwordReset(payload: PasswordResetPayload): Promise<PasswordResetResponse> {
    return apiClient<PasswordResetResponse>('/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch current authenticated user profile
   * GET /api/auth/profile/
   */
  async getProfile(): Promise<ProfileResponse> {
    return apiClient<ProfileResponse>('/auth/profile/', {
      method: 'GET',
    });
  },

  /**
   * Refresh JWT access token
   * POST /api/auth/token/refresh/
   */
  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    return apiClient<{ access: string }>('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
      skipAuth: true,
    });
  },
};
