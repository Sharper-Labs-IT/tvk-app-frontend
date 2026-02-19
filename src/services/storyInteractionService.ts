import axiosClient from '../api/axiosClient';
import type { Story, StoryComment } from '../types/story';

/**
 * Story Interaction Service - Social features for stories
 * 
 * This service handles:
 * - Likes/unlikes
 * - Comments
 * - Views tracking
 * - Shares tracking
 */

// =================================
// Likes
// =================================

/**
 * Like or unlike a story
 * Toggles the like state for the current user
 */
export const toggleLikeStory = async (storyId: string): Promise<Story> => {
  const response = await axiosClient.post(`/stories/${storyId}/like`);
  return response.data.data || response.data;
};

// =================================
// Comments
// =================================

/**
 * Add a comment to a story
 */
export const addComment = async (
  storyId: string,
  content: string
): Promise<StoryComment> => {
  const response = await axiosClient.post(`/stories/${storyId}/comments`, {
    content,
  });
  return response.data.data || response.data.comment || response.data;
};

/**
 * Get comments for a story (if not included in story response)
 */
export const getComments = async (
  storyId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ comments: StoryComment[]; total: number }> => {
  const response = await axiosClient.get(`/stories/${storyId}/comments`, {
    params: { page, limit },
  });
  return response.data.data || response.data;
};

/**
 * Delete a comment (only owner can delete)
 */
export const deleteComment = async (
  storyId: string,
  commentId: string
): Promise<void> => {
  await axiosClient.delete(`/stories/${storyId}/comments/${commentId}`);
};

/**
 * Update a comment
 */
export const updateComment = async (
  storyId: string,
  commentId: string,
  content: string
): Promise<StoryComment> => {
  const response = await axiosClient.put(`/stories/${storyId}/comments/${commentId}`, {
    content,
  });
  return response.data.data || response.data.comment || response.data;
};

// =================================
// View Tracking
// =================================

/**
 * Increment view count for a story
 * Call this when a user views a story detail page
 * Should only increment once per session
 */
export const incrementViews = async (storyId: string): Promise<void> => {
  await axiosClient.post(`/stories/${storyId}/view`);
};

/**
 * Track which stories have been viewed in this session
 * Prevents multiple view increments
 */
const viewedStoriesSession = new Set<string>();

export const trackStoryView = async (storyId: string): Promise<void> => {
  if (!viewedStoriesSession.has(storyId)) {
    await incrementViews(storyId);
    viewedStoriesSession.add(storyId);
  }
};

// =================================
// Share Tracking
// =================================

/**
 * Increment share count when user shares a story
 */
export const shareStory = async (
  storyId: string,
  platform?: 'facebook' | 'twitter' | 'copy-link'
): Promise<void> => {
  await axiosClient.post(`/stories/${storyId}/share`, {
    platform,
  });
};

/**
 * Copy story link to clipboard and track share
 */
export const copyStoryLink = async (storyId: string): Promise<string> => {
  const shareUrl = `${window.location.origin}/stories/${storyId}`;
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    await shareStory(storyId, 'copy-link');
    return shareUrl;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    await shareStory(storyId, 'copy-link');
    return shareUrl;
  }
};
