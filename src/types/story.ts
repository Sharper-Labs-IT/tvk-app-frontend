// Story Types and Interfaces

export interface StoryPrompt {
  genre: StoryGenre;
  mood: StoryMood;
  length: StoryLength;
  theme?: string;
  customPrompt?: string;
}

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

export interface Story {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  genre: StoryGenre;
  mood: StoryMood;
  length: StoryLength;
  characterName: string; // VJ character name
  characterAvatar?: string;
  coverImage?: string;
  scenes?: StoryScene[];
  tags: string[];
  likes: number;
  likedBy: string[];
  comments: StoryComment[];
  views: number;
  shares: number;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryScene {
  id: string;
  sceneNumber: number;
  title: string;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface StoryComment {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  genre: StoryGenre;
  promptTemplate: string;
  thumbnail: string;
  popularity: number;
}

export interface GenerateStoryRequest {
  prompt: StoryPrompt;
  characterName: string;
  characterTraits?: string[];
  characterBackground?: string;
  includeImages?: boolean;
}

export interface GenerateStoryResponse {
  story: Story;
  scenes: StoryScene[];
  estimatedReadTime: number;
}

export interface StoryFeedFilter {
  genre?: StoryGenre;
  sortBy?: 'recent' | 'popular' | 'trending' | 'featured';
  searchQuery?: string;
  userId?: string;
}

export interface StoryStats {
  totalStories: number;
  totalViews: number;
  totalLikes: number;
  favoriteGenre: StoryGenre;
  storiesThisMonth: number;
  avgReadTime: number;
}
