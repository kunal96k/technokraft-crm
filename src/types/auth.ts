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
  isSuperAdmin?: boolean;
  reportingManager?: string;
  status: string;
  crmAccess: boolean;
  isAccountLocked?: boolean;
  forcePasswordReset?: boolean;
  workStatus: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  loginTime?: string;
  logoutTime?: string;
  joiningDate?: string;
  personalEmail?: string;
  dateOfBirth?: string;
  gender?: string;
  employmentType?: string;
  todayAttendanceStatus?: string;
  todayWorkingTime?: string;
  baseWorkingMinutes?: number;
  todayBreakTime?: string;
  permissions: string[];
  allowedModules?: string[];
  shiftStartTime?: string;
  shiftEndTime?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  personalEmail?: string;
  gender?: string;
  dateOfBirth?: string;
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

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  emailMasked?: string;
  username?: string;
  resetToken?: string;
  expiresAt?: string;
}

export interface VerifyOtpPayload {
  emailOrUsername: string;
  otp: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword?: string;
  emailOrUsername?: string;
}
