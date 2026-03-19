import axios from 'axios';
import axiosClient from '../api/axiosClient';
import type {
  GenerateStoryRequest,
  GenerateStoryResponse,
  StoryQuota,
  RateLimitError,
} from '../types/story';

/**
 * Story Generation Service - AI Story Generation Logic
 * 
 * This service handles:
 * - AI story generation (long-running requests)
 * - Rate limit checking
 * - Generation quota management
 * 
 * IMPORTANT: Story generation can take 2-7 minutes
 * The axios timeout is configured to 10 minutes to handle this
 */

// =================================
// Story Generation (Step 1)
// =================================

/**
 * Generate AI story using OpenAI GPT-4 and DALL-E 3
 * This is a LONG-RUNNING request (2-7 minutes)
 * 
 * Rate Limited: 10 stories per hour per user
 * 
 * @throws RateLimitError if user exceeded quota
 * @throws Error for other failures
 */
export const generateStory = async (
  request: GenerateStoryRequest,
  onProgress?: (progress: number, stage: string) => void
): Promise<GenerateStoryResponse> => {
  try {
    // Create a CancelToken for potential cancellation
    const source = axios.CancelToken.source();
    
    const response = await axiosClient.post('/stories/generate', request, {
      timeout: 600000, // 10 minutes
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted, 'Sending request...');
        }
      },
      cancelToken: source?.token,
    });
    
    // Backend returns story data directly, but frontend expects it wrapped
    // Check if response is already in expected format or needs transformation
    const rawData = response.data;
    

    // Check if already in expected format: { success, data: { story, scenes, estimated_read_time } }
    // Unwrap 'data' wrapper if present - common in Laravel resources
    let normalizedData = rawData;
    if (rawData.data && !rawData.story && !rawData.content) {
      normalizedData = rawData.data;
    }

    // Check if the unwrapped data has the expected structure
    if (normalizedData?.story && typeof normalizedData.story === 'object') {
      const actualStory = normalizedData.story;
      
      // FIX FOR RAW JSON CONTENT:
      // If content is a JSON string (LLM output not fully parsed by backend), parse it here
      if (typeof actualStory.content === 'string' && actualStory.content.trim().startsWith('{')) {
        try {
          // Check if it's a valid JSON object with title/content/scenes
          // e.g. {"title": "...", "content": "...", "scenes": [...]}
          const parsedContent = JSON.parse(actualStory.content);
          
          if (parsedContent && typeof parsedContent === 'object') {
             // 1. Update title if 'Untitled Story' or missing
             if (parsedContent.title && (!actualStory.title || actualStory.title === 'Untitled Story')) {
               actualStory.title = parsedContent.title;
             }
             
             // 2. Extract scenes if present
             if (Array.isArray(parsedContent.scenes)) {
               // Assign to story object so it can be found below
               actualStory.scenes = parsedContent.scenes;
               // Also populate parsedContent.scenes to actualStory.scenes_with_urls if needed, standardizing
               actualStory.scenes_with_urls = parsedContent.scenes;
             }
             
             // 3. Update main text content (remove the JSON string)
             if (parsedContent.content) {
               actualStory.content = parsedContent.content;
             }
             
             // 4. Update tags if present
             if (Array.isArray(parsedContent.tags)) {
                actualStory.tags = parsedContent.tags;
             }
          }
        } catch (e) {
          console.warn('Failed to parse potential JSON content string:', e);
          // Continue with original content if parsing fails
        }
      }

      // Aggressively search for scenes in various locations
      const scenes: any[] = 
        normalizedData.scenes_with_urls || 
        normalizedData.scenes || 
        actualStory.scenes_with_urls || 
        actualStory.scenes || 
        // Handles case where scenes might be nested in 'data' inside story (API inconsistency check)
        actualStory.data?.scenes ||
        [];
        
      const readTime = normalizedData.estimatedReadTime || normalizedData.estimated_read_time || actualStory.estimated_read_time
        || Math.ceil((actualStory.content || '').split(' ').length / 200);
      return {
        success: true,
        data: {
          story: actualStory,
          scenes,
          estimated_read_time: readTime,
        }
      };
    }

    // Fallback: normalizedData is the story itself (flat object with title, content, scenes)
    // Aggressively search for scenes here too
    const scenes: any[] = 
      normalizedData.scenes_with_urls || 
      normalizedData.scenes || 
      // If flat story object has scenes inside a 'story' property (nested accidentally)
      normalizedData.story?.scenes ||
      [];
      
    // If normalizedData IS the story, we use it directly
    return {
      success: true,
      data: {
        story: normalizedData,
        scenes,
        estimated_read_time: normalizedData.estimated_read_time || Math.ceil((normalizedData.content || '').split(' ').length / 200)
      }
    };
  } catch (error: any) {
    // Handle rate limit errors specifically
    if (error.response?.status === 429) {
      const rateLimitError: RateLimitError = {
        success: false,
        message: error.response.data.message || 'Rate limit exceeded',
        error_code: 'RATE_LIMIT_EXCEEDED',
        remaining_quota: error.response.data.remaining_quota || 0,
        resets_at: error.response.data.resets_at || '',
      };
      throw rateLimitError;
    }
    throw error;
  }
};

/**
 * Check user's remaining generation quota
 * Call this before showing the generation form
 */
export const getGenerationQuota = async (): Promise<StoryQuota> => {
  try {
    // Use the stats endpoint as /stories/quota doesn't exist
    const response = await axiosClient.get('/stories/stats');
    const stats = response.data;
    
    return {
      // Default to 10 if remaining_quota is missing from backend
      remaining: stats.remaining_quota ?? 10,
      limit: 10, 
      resets_at: stats.quota_resets_at || new Date(Date.now() + 3600000).toISOString()
    };
  } catch (error) {
    console.error('Failed to fetch quota, defaulting to full quota:', error);
    // Fallback to allow user to try generation
    return {
      remaining: 10,
      limit: 10,
      resets_at: new Date(Date.now() + 3600000).toISOString()
    };
  }
};

/**
 * Estimate generation time based on story parameters
 * Used to show users expected wait time
 */
export const estimateGenerationTime = (
  length: 'short' | 'medium' | 'long',
  includeImages: boolean
): number => {
  const baseTime = {
    short: 120, // 2 minutes
    medium: 240, // 4 minutes
    long: 420, // 7 minutes
  };
  
  let estimatedSeconds = baseTime[length];
  
  // Images add significant time (DALL-E 3 generation)
  if (includeImages) {
    estimatedSeconds += 60; // +1 minute per image set
  }
  
  return estimatedSeconds;
};

// =================================
// Regeneration Operations
// =================================

/**
 * Regenerate specific story section
 * Useful for editing and improving generated content
 */
export const regenerateSection = async (
  storyId: string,
  sectionIndex: number,
  prompt?: string
): Promise<{ content: string }> => {
  const response = await axiosClient.post(`/stories/${storyId}/regenerate`, {
    section_index: sectionIndex,
    prompt,
  });
  return response.data.data;
};

/**
 * Generate additional images for a story
 */
export const generateStoryImage = async (
  prompt: string,
  style?: string
): Promise<{ image_url: string }> => {
  const response = await axiosClient.post('/stories/generate-image', {
    prompt,
    style,
  });
  return response.data.data;
};
