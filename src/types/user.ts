export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  nickname: string;
  avatar?: string;
  email_verified_at?: string;
  status: 'active' | 'banned' | 'inactive';
  roles: Role[];
  created_at: string;
}

export interface UserListResponse {
  users: {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}
