// Define the structure of the data the frontend sends to the backend

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
  // This must match the backend's 'password_confirmation' requirement for the 'confirmed' rule
  password_confirmation: string;
}

// 3. User object structure (from successful login response)
export interface IUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  is_verified: boolean;
  status: 'active' | 'inactive';
  // Add other user fields as needed
}

// 4. Login Success Response
export interface ILoginResponse {
  token: string;
  user: IUser;
}

// 5. Signup Success Response
export interface ISignupResponse {
  message: string;
  user_id: number;
}

// 6. Verification Payload
export interface IVerifyOtpPayload {
  user_id: number;
  otp: string;
}
