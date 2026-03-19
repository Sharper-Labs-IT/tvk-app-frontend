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

// Helper to normalize story data (handle _id vs id, etc.)
const normalizeStory = (input: any): Story => {
  if (!input) return input;
  // Handle if story is wrapped in an object like { story: {...} } or { data: {...} }
  const data = input.story || input.data || input;
  
  // Prefer scenes_with_urls if available (contains signed URLs)
  const sourceScenes = (data.scenes_with_urls && data.scenes_with_urls.length > 0) 
    ? data.scenes_with_urls 
    : data.scenes;
  
  return {
    ...data,
    id: data.id || data._id,
    likes: data.likes !== undefined ? data.likes : (data.likes_count || 0),
    likes_count: data.likes_count !== undefined ? data.likes_count : (data.likes || 0),
    comments_count: data.comments_count !== undefined ? data.comments_count : (data.comments?.length || 0),
    // Ensure consistent image URL access
    cover_image_url: data.cover_image_url || data.cover_image,
    // Ensure scenes have consistent structure and use signed URLs if available
    scenes: sourceScenes?.map((scene: any) => ({
      ...scene,
      id: scene.id || scene._id,
      imageUrl: scene.imageUrl || scene.image_url || scene.image?.previewUrl || scene.image?.path,
    })) || [],
    scenes_with_urls: data.scenes_with_urls || [],
  };
};

/**
 * Save story (Step 2 after generation)
 * This publishes or drafts a generated story to the database
 */
export const saveStory = async (storyData: SaveStoryRequest): Promise<SaveStoryResponse> => {
  const response = await axiosClient.post('/stories/', storyData);
  // Ensure we return the full response body as expected by the type, but normalize the story inside
  const result = response.data;
  if (result.story) {
    result.story = normalizeStory(result.story);
  } else if (result.data) {
    // If response structure is different
    // result.data = normalizeStory(result.data);
  }
  return result;
};

/**
 * Get story by ID
 * Fetches fresh data including updated image URLs
 */
export const getStoryById = async (storyId: string): Promise<Story> => {
  const response = await axiosClient.get(`/stories/${storyId}`);
  // Robustly handle different response structures (unwrapped vs wrapped in data/story)
  const rawStory = response.data?.data?.story || response.data?.data || response.data?.story || response.data;
  
  if (!rawStory) {
    throw new Error('Story could not be found');
  }
  return normalizeStory(rawStory);
};

/**
 * Get user's stories (both drafts and published)
 */
export const getUserStories = async (): Promise<Story[]> => {
  const endpoint = '/stories/my-stories';
  const response = await axiosClient.get(endpoint);
  // Robustly handle different response structures
  const rawStories = response.data?.data?.stories || response.data?.data || response.data?.stories || response.data || [];
  
  return Array.isArray(rawStories) ? rawStories.map(normalizeStory) : [];
};

/**
 * Get featured stories
 */
export const getFeaturedStories = async (): Promise<Story[]> => {
  const response = await axiosClient.get('/stories/featured');
  const rawStories = response.data?.data || response.data?.featured || response.data || [];
  return Array.isArray(rawStories) ? rawStories.map(normalizeStory) : [];
};

/**
 * Get story statistics
 */
export const getStoryStats = async (): Promise<StoryStats> => {
  const response = await axiosClient.get('/stories/stats');
  return response.data;
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

/**
 * Share a story
 */
export const shareStory = async (storyId: string): Promise<void> => {
  await axiosClient.post(`/stories/${storyId}/share`);
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
      sortBy: filter?.sortBy || 'popular',
      limit: filter?.limit || 10,
      searchQuery: filter?.searchQuery,
      page: filter?.page || 1, // Ensure page is passed
    },
  });
  
  const result = response.data;
  
  // Normalize stories if present
  if (result.data && Array.isArray(result.data.stories)) {
    result.data.stories = result.data.stories.map(normalizeStory);
  }
  
  return result;
};

// =================================
// User Statistics
// =================================

/**
 * Get user's story statistics including quota information
 */
export const getUserStoryStats = getStoryStats;


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
