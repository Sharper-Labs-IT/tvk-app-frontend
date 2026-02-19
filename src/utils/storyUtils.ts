import type { Story } from '../types/story';
import { getStoryById } from '../services/storyService';

/**
 * Story Utilities
 * 
 * Helpers for:
 * - Image URL management (S3 URL expiry handling)
 * - Story formatting
 * - Read time calculation
 * - Error handling
 */

// =================================
// Image URL Management
// =================================

/**
 * Get the full image URL.
 * Handles both full URLs (http...) and S3 keys.
 */
export const getStoryImageUrl = (img: any): string | null => {
  if (!img) {
    return null;
  }
  
  if (typeof img === 'string') {
    if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) {
      return img;
    }
    // Handle relative path (S3 key)
    // Remove leading slash if present to avoid double slashes
    const cleanPath = img.startsWith('/') ? img.slice(1) : img;
    const fullUrl = `https://tvk-content.s3.eu-north-1.amazonaws.com/${cleanPath}`;
    return fullUrl;
  }
  
  // Handle object with previewUrl/url properties
  const url = img.previewUrl || img.url || null;
  return url;
};

/**
 * Check if URL is a relative path (missing signed URL signature)
 * Relative paths can't be loaded from private S3 buckets
 */
export const isRelativePath = (url: string | null | undefined): boolean => {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  
  // If it doesn't start with http/https, it's relative
  if (!url.startsWith('http')) return true;
  
  // If it's an S3 URL but missing signature parameters, it's effectively relative (won't load)
  if (url.includes('s3.amazonaws.com') && !url.includes('X-Amz-')) return true;
  
  return false;
};

/**
 * Check if an S3 signed URL has expired or will expire soon
 * S3 URLs expire after 5 hours
 * 
 * @param url - S3 signed URL
 * @param bufferMinutes - Consider expired if within this many minutes of expiry (default: 30)
 */
export const isImageUrlExpired = (url: string, bufferMinutes: number = 30): boolean => {
  if (!url || !url.startsWith('http')) return false;
  
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get('X-Amz-Expires') || urlObj.searchParams.get('Expires');
    const dateParam = urlObj.searchParams.get('X-Amz-Date');
    
    if (expiresParam && dateParam) {
      // Parse AWS date format: YYYYMMDDTHHMMSSZ
      const year = parseInt(dateParam.substring(0, 4), 10);
      const month = parseInt(dateParam.substring(4, 6), 10) - 1;
      const day = parseInt(dateParam.substring(6, 8), 10);
      const hour = parseInt(dateParam.substring(9, 11), 10);
      const minute = parseInt(dateParam.substring(11, 13), 10);
      const second = parseInt(dateParam.substring(13, 15), 10);
      
      const signedDate = new Date(Date.UTC(year, month, day, hour, minute, second));
      const expirySeconds = parseInt(expiresParam, 10);
      const expiryDate = new Date(signedDate.getTime() + expirySeconds * 1000);
      
      const now = new Date();
      const bufferMs = bufferMinutes * 60 * 1000;
      
      return expiryDate.getTime() - now.getTime() < bufferMs;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Get image status for better error handling
 */
export const getImageUrlStatus = (url: string | null | undefined): {
  isValid: boolean;
  isRelative: boolean;
  isExpired: boolean;
  message: string;
} => {
  if (!url) {
    return {
      isValid: false,
      isRelative: false,
      isExpired: false,
      message: 'No image URL provided'
    };
  }
  
  const relative = isRelativePath(url);
  const expired = !relative && isImageUrlExpired(url);
  
  if (relative) {
    return {
      isValid: false,
      isRelative: true,
      isExpired: false,
      message: 'Backend missing signed URL - backend needs to generate fresh signed URLs'
    };
  }
  
  if (expired) {
    return {
      isValid: false,
      isRelative: false,
      isExpired: true,
      message: 'Signed URL expired - refresh page or contact support'
    };
  }
  
  return {
    isValid: true,
    isRelative: false,
    isExpired: false,
    message: 'URL is valid'
  };
};

/**
 * Check if a story's images need refreshing
 */
export const needsImageRefresh = (story: Story | null | undefined): boolean => {
  if (!story) return false;
  
  // Check cover image - support nested object and legacy fields
  const coverImage = story.coverImage?.previewUrl || story.coverImage?.path || story.cover_image || story.cover_image_url;
  if (coverImage && isImageUrlExpired(coverImage)) {
    return true;
  }
  
  // Use scenes_with_urls if available, otherwise fall back to scenes
  const scenesToCheck = story.scenes_with_urls || story.scenes;
  
  // Check scene images - support nested image object and legacy fields
  if (scenesToCheck) {
    for (const scene of scenesToCheck) {
      const imageUrl = scene.image?.previewUrl || scene.image?.path || scene.imageUrl || scene.image_url;
      if (imageUrl && isImageUrlExpired(imageUrl)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Refresh story images by fetching fresh data from API
 * Call this before displaying a story that might have expired URLs
 */
export const refreshStory = async (story: Story): Promise<Story> => {
  if (needsImageRefresh(story)) {
    return await getStoryById(story.id);
  }
  return story;
};

/**
 * Auto-refresh story images on an interval
 * Use for long-lived pages displaying stories
 * 
 * @param storyId - Story ID to refresh
 * @param callback - Called with fresh story data
 * @param intervalMinutes - How often to check (default: 30 minutes)
 * @returns Cleanup function to stop refreshing
 */
export const autoRefreshStoryImages = (
  storyId: string,
  callback: (story: Story) => void,
  intervalMinutes: number = 30
): (() => void) => {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  const interval = setInterval(async () => {
    try {
      const freshStory = await getStoryById(storyId);
      callback(freshStory);
    } catch (error) {
      console.error('Failed to refresh story images:', error);
    }
  }, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(interval);
};

// =================================
// Story Formatting
// =================================

/**
 * Calculate estimated read time in minutes
 * Based on average reading speed of 200 words per minute
 */
export const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
};

/**
 * Helper to clean content that might be accidentally stringified JSON
 * (Fixes issues where full API response was saved as content)
 */
const cleanContent = (content: string): string => {
  if (!content) return '';
  const trimmed = content.trim();
  
  // Only attempt cleaning if it looks like a JSON object start
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    // Strategy 1: Try strict JSON parsing
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.content && typeof parsed.content === 'string') {
        return parsed.content;
      }
    } catch (e) {
      // JSON parse failed (likely due to unescaped chars in the generation output)
    }

    // Strategy 2: Regex extraction (Robust fallback)
    // Extract the "content" field even if the surrounding JSON is broken
    const match = trimmed.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (match && match[1]) {
      try {
        // Decode the JSON string value (converts \n to real newlines)
        return JSON.parse(`"${match[1]}"`);
      } catch {
        // Last resort: return the extracted text as-is
        return match[1];
      }
    }
  }
  return trimmed;
};

/**
 * Format story content with proper paragraphs
 */
export const formatStoryContent = (content: string): string[] => {
  const cleaned = cleanContent(content);
  return cleaned
    .split(/\n\s*\n/) // Split by double newlines or similar
    .map(p => p.trim())
    .filter(p => p.length > 0);
};

/**
 * Truncate story content for preview
 */
export const truncateContent = (content: string, maxLength: number = 150): string => {
  const cleaned = cleanContent(content);
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
};

/**
 * Get story excerpt (first paragraph or first N words)
 */
export const getStoryExcerpt = (
  content: string,
  maxWords: number = 50
): string => {
  const paragraphs = formatStoryContent(content); // Now uses cleanContent internally
  const firstParagraph = paragraphs[0] || '';
  
  const words = firstParagraph.split(/\s+/);
  if (words.length <= maxWords) {
    return firstParagraph;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
};

// =================================
// Story Validation
// =================================

/**
 * Validate story title
 */
export const validateStoryTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.length > 200) {
    return 'Title must be less than 200 characters';
  }
  return null;
};

/**
 * Validate story content
 */
export const validateStoryContent = (content: string): string | null => {
  if (!content || content.trim().length === 0) {
    return 'Content is required';
  }
  if (content.length < 100) {
    return 'Story is too short (minimum 100 characters)';
  }
  if (content.length > 10000) {
    return 'Story is too long (maximum 10,000 characters)';
  }
  return null;
};

/**
 * Validate character name
 */
export const validateCharacterName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Character name is required';
  }
  if (name.length < 2) {
    return 'Character name must be at least 2 characters';
  }
  if (name.length > 100) {
    return 'Character name must be less than 100 characters';
  }
  return null;
};

// =================================
// Date Formatting
// =================================

/**
 * Format date for display
 */
export const formatStoryDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Format quota reset time
 */
export const formatResetTime = (resetDateString: string): string => {
  const resetDate = new Date(resetDateString);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  const diffMins = Math.ceil(diffMs / 60000);
  const diffHours = Math.ceil(diffMs / 3600000);
  
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
};

// =================================
// Local Storage Cache
// =================================

const STORY_CACHE_KEY = 'tvk_story_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedStory {
  story: Story;
  timestamp: number;
}

/**
 * Cache story in localStorage (for short-lived pages)
 */
export const cacheStory = (story: Story): void => {
  try {
    const cache: Record<string, CachedStory> = JSON.parse(
      localStorage.getItem(STORY_CACHE_KEY) || '{}'
    );
    
    cache[story.id] = {
      story,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(STORY_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache story:', error);
  }
};

/**
 * Get cached story from localStorage
 */
export const getCachedStory = (storyId: string): Story | null => {
  try {
    const cache: Record<string, CachedStory> = JSON.parse(
      localStorage.getItem(STORY_CACHE_KEY) || '{}'
    );
    
    const cached = cache[storyId];
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION_MS) {
      delete cache[storyId];
      localStorage.setItem(STORY_CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    
    return cached.story;
  } catch (error) {
    console.error('Failed to get cached story:', error);
    return null;
  }
};

/**
 * Clear story cache
 */
export const clearStoryCache = (): void => {
  try {
    localStorage.removeItem(STORY_CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear story cache:', error);
  }
};
