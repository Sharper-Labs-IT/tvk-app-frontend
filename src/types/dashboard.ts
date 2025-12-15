// Generic structure for Laravel Pagination
export interface LaravelPagination<T> {
  current_page: number;
  data: T[];
  total: number;
  last_page: number;
}

// 1. User Structure (based on AuthController)
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string; // ISO Date string
  status: 'active' | 'banned';
}

// 2. Content Structure (based on ContentController)
export interface Content {
  id: number;
  title: string;
  type: string;
  created_at: string;
}

// 3. Game Structure (Assumed based on routes)
export interface Game {
  id: number;
  name: string;
  created_at: string;
}

// 4. Combined Activity Item for the UI
export interface ActivityItem {
  id: string; // Unique ID (e.g., "user-1" or "content-5")
  message: string;
  time: string;
  type: 'user' | 'content' | 'game';
}

export interface DashboardData {
  totalMembers: number;
  totalPosts: number;
  totalGames: number;
  recentActivities: ActivityItem[];
}
