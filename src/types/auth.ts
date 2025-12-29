// src/types/auth.ts

// 1. Login Request Payload
export interface ILoginPayload {
  email: string;
  password: string;
}

// 2. Signup Request Payload - UPDATED
// Matches the new form fields and backend validation
export interface ISignupPayload {
  first_name: string;
  surname: string;
  email: string;
  mobile: string;
  country: string;
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
  name: string; // Backend still returns combined 'name' for display

  // MERGE FIX: Kept 'development' version because 'nickname_changes' is required
  // for the Profile page logic (free nickname change calculation).
  nickname?: string; // Display name (shown instead of username)
  nickname_changes?: number; // Track how many times nickname has been changed

  email: string;
  mobile?: string;
  is_verified: boolean;
  status?: 'active' | 'inactive' | string;
  coins?: number;
  membership_type?: 'free' | 'premium' | 'vip';
  membership_tier?: 'free' | 'super_fan' | string;

  // Added country here as optional, so if you need to display it later, it's available in the type
  country?: string;

  // Roles can now be objects (Old) OR strings (New Backend)
  roles?: (IRole | string)[];

  // Images (backend sends 'avatar', but we normalize to avatar_url for consistency)
  avatar_url?: string | null;
  avatar?: string | null; // Legacy field from backend

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
