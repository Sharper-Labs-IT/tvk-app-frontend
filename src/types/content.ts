import type { IUser } from './auth';

// 1. Category Interface
export interface ICategory {
  id: number;
  name: string;
}

// 2. Reaction Types (From PDF Page 22)
export type ReactionType = 'like' | 'heart' | 'fire' | 'clap' | 'star';
export type CommentReactionType = 'like' | 'heart';

// 3. Reaction Summary Interface
export interface IReactionSummary {
  [key: string]: number;
}

// 4. Comment Interface
export interface IComment {
  id: number;
  content_id: number;
  user_id: number;
  parent_id: number | null;
  comment: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  user: IUser;
  replies?: IComment[];
  // Backend sends an array of reactions for comments (Page 10), but we often map this to a count or boolean in UI
  reactions?: any[];
  reactions_count?: number;
  user_reaction?: CommentReactionType | null;
}

// 5. Main Content Interface
export interface IContent {
  id: number;
  category_id: number;
  title: string;
  description?: string | null;
  type: 'image' | 'video' | 'file' | 'post';
  file_path?: string;
  file_url?: string;
  is_premium: boolean | 0 | 1;
  created_by: number;
  created_at: string;
  updated_at: string;
  category?: ICategory;

  // --- NEW INTERACTION FIELDS ---
  // These match the optional fields returned by the Updated Content Endpoints (Page 21 & 24)
  comments_enabled?: boolean;
  reactions_enabled?: boolean;
  reactions_count?: number;
  comments_count?: number;
  user_reaction?: ReactionType | null;
  reactions_summary?: IReactionSummary;
  comments?: IComment[];
}

// 6. Pagination Response Wrapper
export interface IContentResponse {
  contents: {
    current_page: number;
    data: IContent[];
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

// 7. Create Payload
export interface ICreateContentPayload {
  category_id: string;
  title: string;
  description: string;
  type: string;
  is_premium: boolean;
  file: File | null;
}

// 8. Generic Paginated Response
export interface IPaginatedResponse<T> {
  contents: {
    current_page: number;
    data: T[];
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

// 9. Update Payload
export interface IUpdateContentPayload {
  id: number;
  category_id?: string;
  title?: string;
  description?: string;
  type?: string;
  is_premium?: boolean;
  file?: File | null;
}
