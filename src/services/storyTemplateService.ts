import axiosClient from '../api/axiosClient';
import type { StoryTemplate, StoryGenre } from '../types/story';

/**
 * Story Template Service - Pre-made story templates
 * 
 * This service handles:
 * - Fetching available story templates
 * - Template filtering and search
 * - Popular templates
 */

// =================================
// Template Operations
// =================================

/**
 * Get all story templates
 */
export const getStoryTemplates = async (
  genre?: StoryGenre
): Promise<StoryTemplate[]> => {
  const response = await axiosClient.get('/stories/templates', {
    params: { genre },
  });
  return response.data.data;
};

/**
 * Get a specific template by ID
 */
export const getTemplateById = async (templateId: string): Promise<StoryTemplate> => {
  const response = await axiosClient.get(`/stories/templates/${templateId}`);
  return response.data.data;
};

/**
 * Get popular templates (most used)
 */
export const getPopularTemplates = async (limit: number = 6): Promise<StoryTemplate[]> => {
  const response = await axiosClient.get('/stories/templates/popular', {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Apply a template to create story request data
 * This fills in the prompt fields based on template
 */
export const applyTemplate = (
  template: StoryTemplate,
  characterName: string
): {
  character_name: string;
  prompt: {
    genre: StoryGenre;
    mood: string;
    length: 'medium';
    theme?: string;
    custom_prompt: string;
  };
} => {
  // Replace placeholder with character name
  const customPrompt = template.prompt_template.replace(
    /\{CHARACTER_NAME\}/g,
    characterName
  );
  
  return {
    character_name: characterName,
    prompt: {
      genre: template.genre,
      mood: template.mood,
      length: 'medium',
      custom_prompt: customPrompt,
    },
  };
};

// =================================
// Client-Side Template Utilities
// =================================

/**
 * Filter templates by genre
 */
export const filterTemplatesByGenre = (
  templates: StoryTemplate[],
  genre: StoryGenre
): StoryTemplate[] => {
  return templates.filter(t => t.genre === genre);
};

/**
 * Sort templates by popularity
 */
export const sortTemplatesByPopularity = (
  templates: StoryTemplate[]
): StoryTemplate[] => {
  return [...templates].sort((a, b) => b.popularity - a.popularity);
};

/**
 * Search templates by keyword
 */
export const searchTemplates = (
  templates: StoryTemplate[],
  keyword: string
): StoryTemplate[] => {
  const lowerKeyword = keyword.toLowerCase();
  return templates.filter(
    t =>
      t.name.toLowerCase().includes(lowerKeyword) ||
      t.description.toLowerCase().includes(lowerKeyword)
  );
};
