// src/types/auth.ts

// 1. Login Request Payload
export interface ILoginPayload {
  email: string;
  password: string;
}

// 2. Signup Request Payload
export interface ISignupPayload {
  title?: string;
  first_name: string;
  surname: string;
  email: string;
  mobile: string;
  country: string;
  password: string;
  password_confirmation: string;
}

// --- DASHBOARD & MEMBERSHIP HELPERS ---

export interface IMembershipPlan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
}

export interface IMembership {
  auto_renew: boolean;
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

export interface ITrophies {
  [tier: string]: any[];
}

// --- LEGACY/COMPATIBILITY HELPERS ---

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

// --- CORE USER TYPE ---

export interface IUser {
  id: number;
  name: string;

  // Nickname logic for Profile page
  nickname?: string;
  nickname_changes?: number;

  email: string;
  mobile?: string;
  is_verified: boolean;
  status?: 'active' | 'inactive' | string;
  coins?: number;
  membership_type?: 'free' | 'premium' | 'vip';
  membership_tier?: 'free' | 'super_fan' | string;

  country?: string;
  roles?: (IRole | string)[];

  // --- IMAGES & AVATARS (Normalized for Backend) ---
  avatar_url?: string | null;
  avatar?: string | null;
  profile_photo_url?: string | null; // Added to fix Comment Section error
  image?: string | null; // Added for extra backend compatibility

  created_at?: string;
  last_login_at?: string;
  email_verified_at?: string | null;

  subscription?: ISubscriptionDetails;
  stats?: IUserStats;

  // Membership & Gamification
  membership?: IMembership | null;
  points?: number;
  badges?: IBadge[];
  game_participation?: IGameParticipation[];
  trophies?: ITrophies | any[];
}

// --- AUTH RESPONSE INTERFACES ---

export interface ILoginResponse {
  token?: string;
  user?: IUser;
  two_factor_required?: boolean;
  message?: string;
  is_first_login?: boolean;
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
