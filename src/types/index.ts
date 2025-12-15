// src/types/index.ts

export interface IRole {
  id: number;
  name: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  avatar_url?: string | null; // From your PHP S3 logic
  roles: IRole[];
  created_at: string;
  is_verified: boolean;
  status: 'active' | 'banned';
}

export interface IApiResponse<T> {
  message?: string;
  error?: string;
  data: T;
}
