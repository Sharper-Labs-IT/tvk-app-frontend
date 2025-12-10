// src/types/content.ts

// 1. Category Interface
export interface ICategory {
  id: number;
  name: string;
}

// 2. Main Content Interface
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
}

// 3. Pagination Response Wrapper (Fixed missing export)
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

// 4. Create Payload
export interface ICreateContentPayload {
  category_id: string;
  title: string;
  description: string;
  type: string;
  is_premium: boolean;
  file: File | null;
}

// 5. Generic Paginated Response (Keeping this for Admin backward compatibility)
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
