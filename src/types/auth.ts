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

// --- NEW HELPERS FOR DASHBOARD (Backend V2 Support) ---

export interface IMembershipPlan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
}

export interface IMembership {
  id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  plan?: IMembershipPlan;
}

export interface IBadge {
  id: number;
  name: string;
  icon?: string;
  points_required: number;
}

export interface IGameParticipation {
  id: number;
  game_id: number;
  score: number;
  coins: number;
  status: string;
  game?: {
    id: number;
    name: string;
    is_premium: number;
  };
}

// Trophies can be an array or an object grouped by tier
export interface ITrophies {
  [tier: string]: any[];
}

// --- OLD HELPERS (Kept for compatibility) ---

export interface ISubscriptionDetails {
  plan_name: string;
  status: 'active' | 'expired' | 'cancelled';
  end_date: string;
}

export interface IUserStats {
  points: number;
  games_played: number;
  rank: number;
}

export interface IRole {
  id: number;
  name: string;
}

// --- CORE TYPES ---

// UPDATED IUser: Support for both Old and New Backend Structures
export interface IUser {
  id: number;
  name: string;
  nickname?: string; // Display name (shown instead of username)
  email: string;
  mobile: string;
  is_verified: boolean;
  status: 'active' | 'inactive';
  roles?: IRole[]; // Added roles array
  coins?: number; // Added coins
  membership_type?: 'free' | 'premium' | 'vip'; // Frontend field
  membership_tier?: 'free' | 'super_fan'; // Backend field

  mobile?: string;

  // Images
  avatar_url?: string | null;
  avatar?: string | null;

  created_at?: string;
  last_login_at?: string;
  email_verified_at?: string | null;
  status?: string;

  // ⚠️ CRITICAL UPDATE: Roles can now be objects (Old) OR strings (New Backend)
  // We allow both types here so your app doesn't crash if data format changes.
  roles: (IRole | string)[];

  // --- OPTIONAL FIELDS (Old Dashboard Logic) ---
  subscription?: ISubscriptionDetails;
  stats?: IUserStats;

  // --- NEW FIELDS (New Backend Logic) ---
  // These match the new 'me()' response from your Controller
  membership_tier?: string;
  membership?: IMembership | null;
  points?: number;
  badges?: IBadge[];
  game_participation?: IGameParticipation[];
  trophies?: ITrophies | any[];
}

// 4. Login Success Response
export interface ILoginResponse {
  token?: string;
  user?: IUser;
  two_factor_required?: boolean;
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
