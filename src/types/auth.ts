// src/types/auth.ts

// 1. Login Request Payload
export interface ILoginPayload {
  email: string;
  password: string;
}

// 2. Signup Request Payload
export interface ISignupPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
}

// 3. User & Role Structure
export interface IRole {
  id: number;
  name: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  is_verified: boolean;
  status: 'active' | 'inactive';
  roles?: IRole[]; // Added roles array
  coins?: number; // Added coins
  membership_type?: 'free' | 'premium' | 'vip'; // Frontend field
  membership_tier?: 'free' | 'super_fan'; // Backend field
  // Add other user fields as needed
}

// 4. Login Success Response (Modified for 2FA)
export interface ILoginResponse {
  token?: string; // Optional because 2FA response won't have it
  user?: IUser; // Optional because 2FA response won't have it
  two_factor_required?: boolean; // NEW: Detection flag
  message?: string;
}

// 5. Signup Success Response
export interface ISignupResponse {
  message: string;
  user_id: number;
}

// 6. Verification Payloads
export interface IVerifyOtpPayload {
  user_id: number;
  otp: string;
}

// NEW: Admin 2FA Payload
export interface IVerifyAdmin2FaPayload {
  email: string;
  otp: string;
}

// 7. Resend OTP Payload
export interface IResendOtpPayload {
  user_id?: number;
  email?: string;
}

// 8. Forgot Password Request Payload
export interface IForgotPasswordPayload {
  email: string;
}

// 9. Reset Password Request Payload
export interface IResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

// 10. Generic Message Response
export interface IMessageResponse {
  message: string;
}
