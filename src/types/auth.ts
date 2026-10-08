import { UserRole } from './navigation';

export interface AuthUser {
  id: string;
  employeeCode: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  phone?: string;
  avatar: string;
  profilePhoto?: string;
  department: string;
  role: string;
  accessRole: UserRole | string;
  reportingManager?: string;
  status: string;
  crmAccess: boolean;
  isAccountLocked?: boolean;
  forcePasswordReset?: boolean;
  workStatus: string;
  permissions: string[];
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  sessionId: string;
  tokenType: string;
  expiresAt: string;
  requirePasswordReset: boolean;
  user: AuthUser;
}

export interface ChangePasswordPayload {
  oldPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ForgotPasswordPayload {
  emailOrUsername: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}
