import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { StoryGenerationProvider, useStoryGeneration } from '../context/StoryGenerationContext';
import StoryGenerationForm from '../components/story/StoryGenerationForm';
import StoryGenerationProgress from '../components/story/StoryGenerationProgress';
import StoryPreviewEdit from '../components/story/StoryPreviewEdit';
import { isRateLimitError } from '../utils/storyErrorHandling';

/**
 * Story Studio Page
 * 
 * Complete story generation workflow:
 * 1. Generation Form → 2. Progress Display → 3. Preview & Edit
 * 
 * Uses StoryGenerationContext to manage state transitions
 */

const StoryStudioContent: React.FC = () => {
  const { generationState, generatedStory, savedStory } = useStoryGeneration();
  const navigate = useNavigate();
  
  // Redirect to story detail after successful save
  useEffect(() => {
    if (savedStory && generationState === 'PUBLISHED') {
      navigate(`/ai-studio/stories/${savedStory.id}`);
    }
  }, [savedStory, generationState, navigate]);
  
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Header />
      <div className="p-4 md:p-8">
      {/* Show generation form initially */}
      {generationState === 'IDLE' && <StoryGenerationForm />}
      
      {/* Show progress during generation */}
      {(generationState === 'GENERATING' || generationState === 'SAVING') && (
        <StoryGenerationProgress />
      )}
      
      {/* Show preview/edit after successful generation */}
      {generationState === 'SUCCESS' && generatedStory && <StoryPreviewEdit />}
      
      {/* Show error state */}
      {generationState === 'ERROR' && <StoryErrorDisplay />}
      </div>
    </div>
  );
};

/**
 * Error Display Component
 */
const StoryErrorDisplay: React.FC = () => {
  const { error, resetGeneration } = useStoryGeneration();
  
  const isRateLimit = isRateLimitError(error);
  
  return (
    <div className="max-w-2xl mx-auto p-6 mt-12">
      <div className="bg-tvk-dark-card border border-red-500/30 rounded-2xl shadow-2xl p-8 text-center backdrop-blur-md relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {/* Icon */}
        <div className="text-6xl mb-6 relative z-10">
          {isRateLimit ? '⚠️' : '💔'}
        </div>
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-4 font-zentry tracking-wide">
          {isRateLimit ? 'LIMIT REACHED' : 'GENERATION FAILED'}
        </h2>
        
        {/* Message */}
        <p className="text-gray-400 mb-8 text-lg font-circular-web">
          {error?.message || 'The story threads got tangled. Please try again.'}
        </p>
        
        {/* Quota Info (if rate limit) */}
        {isRateLimit && error?.resets_at && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <p className="text-yellow-400 font-bold">
              Your creative spark needs a recharge. Limit resets soon!
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
          <button
            onClick={resetGeneration}
            className="px-8 py-3 bg-brand-gold text-brand-dark rounded-lg font-bold hover:bg-white hover:text-black transition-all uppercase tracking-wider transform hover:scale-105"
          >
            {isRateLimit ? 'Go Back' : 'Try Again'}
          </button>
          <button
            onClick={() => window.location.href = '/stories'}
            className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg font-bold hover:bg-gray-800 hover:text-white transition-all uppercase tracking-wider"
          >
            Browse Stories
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Page Component with Provider
 */
const StoryStudioPage: React.FC = () => {
  return (
    <StoryGenerationProvider>
      <StoryStudioContent />
    </StoryGenerationProvider>
  );
};

export default StoryStudioPage;
