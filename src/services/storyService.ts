import axiosClient from '../api/axiosClient';
import type {
  Story,
  GenerateStoryRequest,
  GenerateStoryResponse,
  StoryFeedFilter,
  StoryTemplate,
  StoryComment,
  StoryStats,
} from '../types/story';

// Import mock data
import { 
  mockStories, 
  mockStats, 
  mockTemplates, 
  generateMockStory,
  delay 
} from './mockStoryData';

/**
 * Story Service - Handles all story-related API calls
 * 
 * Set USE_MOCK_DATA=true in localStorage or .env to use mock data for testing
 */

// Check if using mock data
const USE_MOCK_DATA = 
  localStorage.getItem('USE_MOCK_DATA') === 'true' || 
  import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Generate AI story
export const generateStory = async (
  request: GenerateStoryRequest
): Promise<GenerateStoryResponse> => {
  if (USE_MOCK_DATA) {
    await delay(3000); // Simulate AI generation time
    return generateMockStory(
      request.characterName,
      request.prompt.genre,
      request.prompt.mood
    );
  }
  const response = await axiosClient.post('/api/stories/generate', request);
  return response.data;
};

// Save story (draft or publish)
export const saveStory = async (story: Partial<Story>): Promise<Story> => {
  const response = await axiosClient.post('/api/stories', story);
  return response.data;
};

// Get story by ID
export const getStoryById = async (storyId: string): Promise<Story> => {
  const response = await axiosClient.get(`/api/stories/${storyId}`);
  return response.data;
};

// Get user's stories
export const getUserStories = async (userId?: string): Promise<Story[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return mockStories;
  }
  const endpoint = userId ? `/api/stories/user/${userId}` : '/api/stories/my-stories';
  const response = await axiosClient.get(endpoint);
  return response.data;
};

// Get story feed
export const getStoryFeed = async (
  filter?: StoryFeedFilter,
  page: number = 1,
  limit: number = 10
): Promise<{ stories: Story[]; total: number; page: number; totalPages: number }> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      stories: mockStories,
      total: mockStories.length,
      page: 1,
      totalPages: 1
    };
  }
  const response = await axiosClient.get('/api/stories/feed', {
    params: { ...filter, page, limit },
  });
  return response.data;
};

// Get featured stories
export const getFeaturedStories = async (): Promise<Story[]> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return mockStories.filter(s => s.isFeatured);
  }
  const response = await axiosClient.get('/api/stories/featured');
  return response.data;
};

// Get story templates
export const getStoryTemplates = async (): Promise<StoryTemplate[]> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return mockTemplates;
  }
  const response = await axiosClient.get('/api/stories/templates');
  return response.data;
};

// Update story
export const updateStory = async (
  storyId: string,
  updates: Partial<Story>
): Promise<Story> => {
  const response = await axiosClient.put(`/api/stories/${storyId}`, updates);
  return response.data;
};

// Delete story
export const deleteStory = async (storyId: string): Promise<void> => {
  await axiosClient.delete(`/api/stories/${storyId}`);
};

// Like/unlike story
export const toggleLikeStory = async (storyId: string): Promise<Story> => {
  const response = await axiosClient.post(`/api/stories/${storyId}/like`);
  return response.data;
};

// Add comment to story
export const addComment = async (
  storyId: string,
  content: string
): Promise<StoryComment> => {
  const response = await axiosClient.post(`/api/stories/${storyId}/comments`, {
    content,
  });
  return response.data;
};

// Delete comment
export const deleteComment = async (
  storyId: string,
  commentId: string
): Promise<void> => {
  await axiosClient.delete(`/api/stories/${storyId}/comments/${commentId}`);
};

// Increment view count
export const incrementViews = async (storyId: string): Promise<void> => {
  await axiosClient.post(`/api/stories/${storyId}/view`);
};

// Share story
export const shareStory = async (storyId: string): Promise<void> => {
  await axiosClient.post(`/api/stories/${storyId}/share`);
};

// Get user story stats
export const getUserStoryStats = async (): Promise<StoryStats> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return mockStats;
  }
  const response = await axiosClient.get('/api/stories/stats');
  return response.data;
};

// Generate story image (AI)
export const generateStoryImage = async (
  prompt: string,
  style?: string
): Promise<{ imageUrl: string }> => {
  const response = await axiosClient.post('/api/stories/generate-image', {
    prompt,
    style,
  });
  return response.data;
};

// Regenerate story section
export const regenerateSection = async (
  storyId: string,
  sectionIndex: number,
  prompt?: string
): Promise<{ content: string }> => {
  const response = await axiosClient.post(`/api/stories/${storyId}/regenerate`, {
    sectionIndex,
    prompt,
  });
  return response.data;
};
