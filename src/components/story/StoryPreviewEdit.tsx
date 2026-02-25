import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryGeneration } from '../../context/StoryGenerationContext';
import type { SaveStoryRequest, StoryStatus } from '../../types/story';
import { validateStoryTitle, formatStoryContent, getStoryImageUrl } from '../../utils/storyUtils';
import { getErrorMessage } from '../../utils/storyErrorHandling';

/**
 * Story Preview & Edit Component
 * 
 * Shows generated story with option to:
 * - Edit title and tags
 * - Preview content and images
 * - Save as draft or publish
 * - Regenerate sections
 */

const StoryPreviewEdit: React.FC = () => {
  const navigate = useNavigate();
  const {
    generatedStory,
    saveGeneratedStory,
    resetGeneration,
    generationState,
  } = useStoryGeneration();
  
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Data extraction (always computed, never conditional) ----
  // Normalized response structure (guaranteed by storyGenerationService):
  // { success, data: { story: { title, content, ... }, scenes: [...], estimated_read_time } }
  const responseData: any = (generatedStory as any)?.data || {};
  const story: any = responseData?.story || {};
  const scenes: any[] = Array.isArray(responseData?.scenes) ? responseData.scenes : [];

  const actualContent: string = story?.content || '';
  const actualTitle: string = story?.title || '';

  const workingStory = { ...story };

  // Sync extracted title into the input field once story loads
  useEffect(() => {
    if (actualTitle) {
      setTitle(actualTitle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedStory]);

  if (!generatedStory || generationState !== 'SUCCESS') {
    return null;
  }

  const paragraphs = formatStoryContent(actualContent);
  
  // Add tag
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };
  
  // Remove tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  
  // Save story
  const handleSave = async (status: StoryStatus) => {
    setError(null);
    
    // Validate title
    const titleError = validateStoryTitle(title);
    if (titleError) {
      setError(titleError);
      return;
    }
    
    setSaving(true);
    
    try {
      // @ts-ignore - Handle inconsistent API response key naming
      const charName = workingStory.character_name || workingStory.characterName;
      // @ts-ignore
      const charTraits = workingStory.character_traits || workingStory.characterTraits;
      // @ts-ignore
      const charBg = workingStory.character_background || workingStory.characterBackground;
      // @ts-ignore - Extract cover image path (not the full URL!)
      const coverImg = workingStory.coverImage?.path || workingStory.cover_image || workingStory.coverImage || '';
      
      const coverImagePath = typeof coverImg === 'string' ? coverImg : coverImg?.path || '';

      // Ensure scenes data is consistently formatted (snake_case) for the backend
      const formattedScenes = (scenes || []).map((scene: any) => ({
        scene_number: scene.scene_number || scene.sceneNumber,
        title: scene.title || '',
        content: scene.content || '',
        image_url: scene.image?.previewUrl || scene.image?.path || scene.imageUrl || scene.image_url || '',
        image_prompt: scene.image_prompt || scene.imagePrompt || ''
      }));

      const saveData: SaveStoryRequest = {
        title: title,
        content: actualContent,
        genre: workingStory.genre,
        mood: workingStory.mood,
        length: workingStory.length,
        character_name: charName,
        character_traits: charTraits || [],
        character_background: charBg || '',
        cover_image: coverImagePath,
        scenes: formattedScenes,
        tags: tags || [],
        status: status,
        is_public: isPublic,
      };
      
      await saveGeneratedStory(saveData);
      
      // Navigate to story detail
      // navigate(`/stories/${saved.id}`);
      
      // Update: Show success notification
      alert(`Story successfully ${status === 'published' ? 'published' : 'saved as draft'}!`);
      // Optional: redirect to my stories or stay here
      navigate('/ai-studio/stories/my-stories');
      
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Animation */}
        <div className="bg-brand-dark border border-brand-gold/30 rounded-2xl p-8 mb-8 text-center shadow-[0_0_30px_rgba(230,198,91,0.1)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform translate-x-full group-hover:-translate-x-full" />
          <div className="text-5xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-zentry text-brand-gold mb-2">Your Story is Ready!</h2>
          <p className="text-gray-400">Review and publish your AI-generated masterpiece.</p>
        </div>
        
        {/* Preview Card */}
        <div className="bg-tvk-dark-card rounded-2xl shadow-xl overflow-hidden border border-white/5">
          {/* Cover Image - Check both cover_image and cover_image_url */}
          {(() => {
            // @ts-ignore - Handle different cover image structures
            const coverImg = workingStory.coverImage?.previewUrl || workingStory.coverImage?.path || workingStory.cover_image_url || workingStory.cover_image;
            const coverUrl = coverImg ? getStoryImageUrl(coverImg) : null;
            
            if (coverUrl) {
              return (
                <div className="relative h-80 bg-brand-dark group">
                  <img
                    src={coverUrl}
                    alt="Story cover"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tvk-dark-card to-transparent" />
                </div>
              );
            }
            return null;
          })()}
          
          {/* Content */}
          <div className="p-8 sm:p-10">
            {/* Title Editor */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-wide">
                Story Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your story a captivating title..."
                maxLength={200}
                className={`w-full px-6 py-4 text-2xl font-zentry bg-brand-dark border-2 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors ${
                  error ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
              <p className="text-gray-500 text-sm mt-2 text-right">{title.length}/200 characters</p>
            </div>
            
            {/* Cover Image Preview */}
            <div className="mb-8 rounded-xl overflow-hidden border border-gray-700 bg-black/20">
               {(() => {
                  // Handle different cover image structures - prioritize full URL
                  // @ts-ignore
                  const coverImg = workingStory.coverImage?.previewUrl || workingStory.coverImage?.path || workingStory.cover_image_url || workingStory.cover_image;
                  const coverUrl = coverImg ? getStoryImageUrl(coverImg) : null;
                    
                  if (coverUrl) {
                    return (
                      <img 
                        src={coverUrl} 
                        alt="Story Cover" 
                        className="w-full h-64 md:h-80 object-cover"
                      />
                    );
                  }
                  return (
                    <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center text-gray-500 p-4">
                      <div className="text-4xl mb-2">📖</div>
                      <p>No cover image available</p>
                      <p className="text-xs text-gray-600 mt-2">Cover image will be generated during story creation</p>
                    </div>
                  );
               })()}
            </div>
            
            {/* Story Metadata */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="bg-brand-dark border border-brand-gold/30 text-brand-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {workingStory.genre}
              </span>
              <span className="bg-brand-dark border border-brand-gold/30 text-brand-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {workingStory.mood}
              </span>
              <span className="bg-brand-dark border border-gray-700 text-gray-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {responseData.estimated_read_time || 5} min read
              </span>
            </div>
            
            {/* Content Preview */}
            <div className="prose prose-invert max-w-none mb-10">
               {scenes && scenes.length > 0 ? (
                 <>
                   <div className="space-y-12">
                   {scenes.map((scene: any, index: number) => {
                     // Support nested image object and legacy fields
                     // @ts-ignore
                     const sceneImg = scene.image?.previewUrl || scene.image?.path || scene.imageUrl || scene.image_url;
                     const scenePrompt = scene.imagePrompt || scene.image_prompt;
                     const displayUrl = sceneImg ? getStoryImageUrl(sceneImg) : null;
                     const sceneTitle = scene.title || `Scene ${index + 1}`;

                     return (
                       <div key={scene.id || index} className="animate-fadeIn not-prose">
                          {/* Scene Title */}
                          <h3 className="text-2xl font-zentry text-brand-gold mb-4">
                            {sceneTitle}
                          </h3>
                          
                          {/* Scene Content */}
                         <div className="mb-6 prose prose-invert">
                            {scene.content && formatStoryContent(scene.content).map((para: string, idx: number) => (
                              <p key={idx} className="text-gray-300 text-lg leading-relaxed font-light mb-6">
                                {para}
                              </p>
                            ))}
                         </div>
                         
                         {/* Scene Image */}
                         <div className="my-8 rounded-xl overflow-hidden shadow-lg border border-white/5 bg-black/40">
                            {displayUrl ? (
                              <div>
                                <img
                                  src={displayUrl}
                                  alt={sceneTitle}
                                  className="w-full h-auto max-h-[500px] object-cover mx-auto"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="bg-gray-900/20 px-4 py-2 text-center">
                                  <p className="text-xs text-gray-500">Scene {index + 1} Image</p>
                                </div>
                              </div>
                            ) : scenePrompt ? (
                               <div className="w-full min-h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-900/50 p-8">
                                  <span className="text-5xl mb-4">🎨</span>
                                  <span className="text-sm font-bold text-yellow-400 mb-3">Image Generating</span>
                                  <span className="text-xs text-gray-600 mt-4">Scene image is being generated</span>
                               </div>
                            ) : (
                               <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50">
                                  <span className="text-4xl mb-2">🖼️</span>
                                  <span className="text-sm">No Image Data Available</span>
                               </div>
                            )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
                 </>
               ) : (
                  paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-gray-300 text-lg leading-relaxed font-light mb-6">
                      {paragraph}
                    </p>
                  ))
               )}
            </div>
            
            {/* Tags */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-wide">
                Tags (Optional, max 5)
              </label>
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tags..."
                  className="flex-1 px-5 py-3 bg-brand-dark border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={tags.length >= 5}
                  className="px-6 py-3 bg-brand-dark border border-brand-gold/30 text-brand-gold rounded-xl hover:bg-brand-gold hover:text-brand-dark font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-brand-gold/10 border border-brand-gold/20 text-brand-gold px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 group hover:bg-brand-gold/20 transition-colors"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-brand-gold/50 hover:text-brand-gold transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            {/* Visibility Toggle */}
            <div className="flex items-center gap-4 p-5 bg-brand-dark rounded-xl border border-white/5 mb-8">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="is-public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-gray-700 transition-colors checked:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-gray-900"
                />
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </div>
              <label htmlFor="is-public" className="flex-1 cursor-pointer">
                <div className="font-bold text-white">Make story public</div>
                <div className="text-sm text-gray-400">
                  Allow others to view and interact with your story
                </div>
              </label>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex-1 px-6 py-4 border border-gray-600 rounded-xl font-bold uppercase tracking-wide text-gray-300 hover:border-brand-gold hover:text-brand-gold hover:bg-brand-dark transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving || !title.trim()}
                className="flex-1 px-6 py-4 bg-brand-gold text-brand-dark rounded-xl font-black uppercase tracking-wide shadow-[0_0_20px_rgba(230,198,91,0.3)] hover:shadow-[0_0_30px_rgba(230,198,91,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? 'Publishing...' : '🎉 Publish Story'}
              </button>
            </div>
            
            {/* Create Another */}
            <div className="text-center">
              <button
                onClick={() => {
                  resetGeneration();
                  navigate('/ai-studio/stories/create');
                }}
                className="text-gray-500 hover:text-brand-gold font-medium transition-colors"
              >
                ← Create Another Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPreviewEdit;
