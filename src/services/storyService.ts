import axiosClient from '../api/axiosClient';
import type {
  Story,
  SaveStoryRequest,
  SaveStoryResponse,
  StoryFeedFilter,
  StoryFeedResponse,
  StoryStats,
} from '../types/story';

/**
 * Story Service - Main CRUD operations for stories
 * 
 * This service handles:
 * - Saving stories after generation
 * - Fetching story feeds
 * - Managing user stories
 * - Updating and deleting stories
 */

// =================================
// Story CRUD Operations
// =================================

/**
 * Save story (Step 2 after generation)
 * This publishes or drafts a generated story to the database
 */
export const saveStory = async (storyData: SaveStoryRequest): Promise<SaveStoryResponse> => {
  const response = await axiosClient.post('/stories/', storyData);
  // Ensure we return the full response body as expected by the type
  return response.data;
};

/**
 * Get story by ID
 * Fetches fresh data including updated image URLs
 */
export const getStoryById = async (storyId: string): Promise<Story> => {
  const response = await axiosClient.get(`/stories/${storyId}`);
  // Robustly handle different response structures (unwrapped vs wrapped in data/story)
  const story = response.data?.data || response.data?.story || response.data;
  
  if (!story) {
    throw new Error('Story could not be found');
  }
  return story;
};

/**
 * Get user's stories (both drafts and published)
 */
export const getUserStories = async (userId?: string): Promise<Story[]> => {
  const endpoint = userId ? `/stories/user/${userId}` : '/stories/my-stories';
  const response = await axiosClient.get(endpoint);
  // Robustly handle different response structures
  return response.data?.data || response.data?.stories || response.data || [];
};

/**
 * Update an existing story
 */
export const updateStory = async (
  storyId: string,
  updates: Partial<SaveStoryRequest>
): Promise<Story> => {
  const response = await axiosClient.put(`/stories/${storyId}`, updates);
  return response.data.data;
};

/**
 * Delete a story
 */
export const deleteStory = async (storyId: string): Promise<void> => {
  await axiosClient.delete(`/stories/${storyId}`);
};



// =================================
// Story Feed & Discovery
// =================================

/**
 * Get story feed with filtering and pagination
 */
export const getStoryFeed = async (
  filter?: StoryFeedFilter
): Promise<StoryFeedResponse> => {
  const response = await axiosClient.get('/stories/feed', {
    params: {
      genre: filter?.genre,
      sort_by: filter?.sort_by || 'recent',
      search: filter?.search,
      user_id: filter?.user_id,
      page: filter?.page || 1,
      limit: filter?.limit || 10,
    },
  });
  return response.data;
};

/**
 * Get featured stories
 */
export const getFeaturedStories = async (): Promise<Story[]> => {
  const response = await axiosClient.get('/stories/featured');
  return response.data.data;
};

// =================================
// User Statistics
// =================================

/**
 * Get user's story statistics including quota information
 */
export const getUserStoryStats = async (): Promise<StoryStats> => {
  const response = await axiosClient.get('/stories/stats');
  // API returns raw JSON object, not wrapped in data property
  return response.data;
};

// =================================
// Image URL Refresh
// =================================

/**
 * Refresh image URLs for a story (handles S3 URL expiry)
 * Call this when displaying stories older than 5 hours
 */
export const refreshStoryImages = async (storyId: string): Promise<Story> => {
  return getStoryById(storyId); // Backend returns fresh signed URLs
};
