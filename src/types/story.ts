// Story Types and Interfaces

// =================================
// Enums and Types
// =================================

export type StoryGenre = 
  | 'adventure'
  | 'action'
  | 'romance'
  | 'sci-fi'
  | 'fantasy'
  | 'mystery'
  | 'horror'
  | 'comedy'
  | 'drama';

export type StoryMood = 
  | 'epic'
  | 'lighthearted'
  | 'dark'
  | 'inspirational'
  | 'suspenseful'
  | 'romantic'
  | 'humorous';

export type StoryLength = 
  | 'short' // ~500 words
  | 'medium' // ~1000 words
  | 'long'; // ~2000 words

export type StoryStatus = 'draft' | 'published';

export type SortOption = 'recent' | 'popular' | 'trending' | 'featured';

// Story Generation State Machine
export type GenerationState = 
  | 'IDLE'
  | 'GENERATING'
  | 'SUCCESS'
  | 'SAVING'
  | 'PUBLISHED'
  | 'ERROR';

// =================================
// Core Story Interfaces
// =================================

export interface StoryPrompt {
  genre: StoryGenre;
  mood: StoryMood;
  length: StoryLength;
  theme?: string;
  customPrompt?: string;
}

export interface Story {
  characterName: string;
  id: string;
  user_id: string;
  userName?: string; // Mapped from user_name
  user_name: string; // From backend
  userAvatar?: string; // Mapped from user_avatar
  user_avatar?: string; // From backend
  title: string;
  content: string;
  genre: StoryGenre;
  mood: StoryMood;
  length: StoryLength;
  character_name: string;
  character_traits?: string[];
  character_background?: string;
  cover_image?: string;
  cover_image_url?: string; // Full URL from backend
  coverImage?: { // Nested cover image object from backend
    path: string;
    previewUrl: string;
  };
  scenes?: StoryScene[];
  scenes_with_urls?: StoryScene[]; // Backend response with full URLs
  tags: string[];
  likes: number; // From backend
  likes_count?: number; // Frontend alias
  liked_by?: any[]; // From backend
  liked_by_user?: boolean;
  comments: any[]; // From backend
  comments_count?: number;
  views: number;
  shares: number;
  status: StoryStatus;
  is_public: boolean;
  is_featured: boolean;
  estimated_read_time?: number; // in minutes
  created_at: string;
  updated_at: string;
}

export interface StoryScene {
  id?: string;
  scene_number?: number; // snake_case from backend
  sceneNumber?: number; // camelCase from backend
  title: string;
  content: string;
  image_url?: string; // snake_case from backend
  imageUrl?: string; // camelCase from backend
  image?: { // Nested image object from backend
    path: string;
    previewUrl: string;
  };
  image_prompt?: string; // snake_case from backend
  imagePrompt?: string; // camelCase from backend
}

export interface StoryComment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  genre: StoryGenre;
  mood: StoryMood;
  prompt_template: string;
  thumbnail: string;
  popularity: number;
}

// =================================
// Request/Response Interfaces
// =================================

export interface GenerateStoryRequest {
  characterName: string;
  characterTraits?: string[];
  characterBackground?: string;
  prompt: {
    genre: StoryGenre;
    mood: StoryMood;
    length: StoryLength;
    theme?: string;
    customPrompt?: string;
  };
  includeImages?: boolean;
}

export interface GenerateStoryResponse {
  success: boolean;
  data: {
    story: Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
    scenes: StoryScene[];
    estimated_read_time: number;
  };
  message?: string;
}

export interface SaveStoryRequest {
  title: string;
  content: string;
  genre: StoryGenre;
  mood: StoryMood;
  length: StoryLength;
  character_name: string;
  character_traits?: string[];
  character_background?: string;
  cover_image?: string;
  scenes?: StoryScene[];
  tags?: string[];
  status: StoryStatus;
  is_public: boolean;
}

export interface SaveStoryResponse {
  success: boolean;
  data: Story;
  message: string;
}

export interface StoryFeedFilter {
  genre?: StoryGenre;
  sort_by?: SortOption;
  search?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

export interface StoryFeedResponse {
  success: boolean;
  data: {
    stories: Story[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_more: boolean;
    };
  };
}

export interface StoryStats {
  total_stories: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  favorite_genre: StoryGenre;
  stories_this_month: number;
  avg_read_time: number;
  remaining_quota: number;
  quota_resets_at?: string;
}

export interface StoryQuota {
  remaining: number;
  limit: number;
  resets_at: string;
}

// =================================
// API Error Responses
// =================================

export interface StoryAPIError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error_code?: string;
}

export interface RateLimitError extends StoryAPIError {
  error_code: 'RATE_LIMIT_EXCEEDED';
  remaining_quota: number;
  resets_at: string;
}

// =================================
// UI State Interfaces
// =================================

export interface GenerationProgress {
  state: GenerationState;
  stage: string;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // in seconds
  message: string;
}

export interface StoryFormData {
  character_name: string;
  character_traits: string[];
  character_background: string;
  genre: StoryGenre;
  mood: StoryMood;
  length: StoryLength;
  theme?: string;
  custom_prompt?: string;
  include_images: boolean;
}
