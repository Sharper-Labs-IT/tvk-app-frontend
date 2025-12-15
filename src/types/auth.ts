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

// --- NEW HELPERS FOR DASHBOARD ---

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
  icon?: string; // This is the field from DB (e.g. "icons/badges/new-member.png")
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

export interface IUser {
  id: number;
  name: string;
  nickname?: string;
  email: string;
  mobile?: string;
  is_verified: boolean;
  status?: 'active' | 'inactive' | string;
  coins?: number;
  membership_type?: 'free' | 'premium' | 'vip';
  membership_tier?: 'free' | 'super_fan' | string;

  // Roles can now be objects (Old) OR strings (New Backend)
  roles?: (IRole | string)[];

  // Images
  avatar_url?: string | null;
  avatar?: string | null;

  created_at?: string;
  last_login_at?: string;
  email_verified_at?: string | null;

  // --- OPTIONAL FIELDS ---
  subscription?: ISubscriptionDetails;
  stats?: IUserStats;

  // --- NEW FIELDS ---
  membership?: IMembership | null;
  points?: number;
  badges?: IBadge[];
  game_participation?: IGameParticipation[];
  trophies?: ITrophies | any[];
}

export interface ILoginResponse {
  token?: string;
  user?: IUser;
  two_factor_required?: boolean;
  message?: string;
}

export interface ISignupResponse {
  message: string;
  user_id: number;
}

export interface IVerifyOtpPayload {
  user_id: number;
  otp: string;
}

export interface IVerifyAdmin2FaPayload {
  email: string;
  otp: string;
}

export interface IResendOtpPayload {
  user_id?: number;
  email?: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface IMessageResponse {
  message: string;
}
