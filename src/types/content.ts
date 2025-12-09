// match App/Models/Category (inferred)
export interface ICategory {
  id: number;
  name: string;
  // created_at etc are usually not needed for the dropdown
}

// match App/Models/Content
export interface IContent {
  id: number;
  category_id: number;
  title: string;
  description?: string; // nullable in backend
  type: 'image' | 'video' | 'file' | 'post';
  file_path?: string; // internal path
  file_url?: string; // This is what the controller adds: Storage::disk('s3')->url(...)
  is_premium: boolean | 0 | 1; // Backend might send 0/1 or true/false
  created_by: number;
  created_at: string;
  updated_at: string;
  // Relation loaded via with('category')
  category?: ICategory;
}

// match Laravel Pagination Response
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

// Payload for creating new content
export interface ICreateContentPayload {
  category_id: string; // We send as string from form, backend handles conversion
  title: string;
  description: string;
  type: string;
  is_premium: boolean;
  file: File | null; // The actual file object
}
