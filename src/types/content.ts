import type { IUser } from './auth';

// 1. Category Interface
export interface ICategory {
  id: number;
  name: string;
}

// 2. Content Approval Status
export type ContentStatus = 'pending' | 'approved' | 'rejected';

// 3. Reaction Types (From PDF Page 22)
export type ReactionType = 'like' | 'heart' | 'fire' | 'clap' | 'star';
export type CommentReactionType = 'like' | 'heart';

// 4. Reaction Summary Interface
export interface IReactionSummary {
  [key: string]: number;
}

// 5. Comment Interface
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

// 6. Main Content Interface
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
  user?: IUser;

  // --- MODERATION FIELDS ---
  status?: ContentStatus;
  approval_status?: ContentStatus; // Backend uses this field name
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  approved_by?: number | null; // Backend uses this field name
  reviewed_at?: string | null;
  approved_at?: string | null; // Backend uses this field name

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

// 7. Pagination Response Wrapper
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

// 8. Pending Contents Response (Admin)
export interface IPendingContentResponse {
  pending_contents: {
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

// 9. Create Payload
export interface ICreateContentPayload {
  category_id: string;
  title: string;
  description: string;
  type: string;
  is_premium: boolean;
  file: File | null;
}

// 10. Generic Paginated Response
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

// 11. Update Payload
export interface IUpdateContentPayload {
  id: number;
  category_id?: string;
  title?: string;
  description?: string;
  type?: string;
  is_premium?: boolean;
  file?: File | null;
}

// 12. Rejection Payload
export interface IRejectContentPayload {
  reason?: string;
}

// 13. My Content Response
export interface IMyContentResponse {
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
