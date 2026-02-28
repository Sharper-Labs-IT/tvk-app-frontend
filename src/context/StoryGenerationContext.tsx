import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  GenerateStoryRequest,
  GenerateStoryResponse,
  Story,
  GenerationState,
  GenerationProgress,
  StoryQuota,
  SaveStoryRequest,
  SaveStoryResponse,
} from '../types/story';
import { generateStory, getGenerationQuota, estimateGenerationTime } from '../services/storyGenerationService';
import { saveStory as saveStoryAPI } from '../services/storyService';
import { handleGenerationError, logError, reportError } from '../utils/storyErrorHandling';

/**
 * Story Generation Context
 * 
 * Manages the story generation state machine:
 * IDLE → GENERATING → SUCCESS/ERROR → SAVING → PUBLISHED
 * 
 * Provides:
 * - Quota management
 * - Generation progress tracking
 * - Error handling
 * - Story data management
 */

// =================================
// Context Types
// =================================

interface StoryGenerationContextType {
  // State
  generationState: GenerationState;
  progress: GenerationProgress;
  generatedStory: GenerateStoryResponse | null;
  savedStory: Story | null;
  error: any | null;
  quota: StoryQuota | null;
  
  // Actions
  generateNewStory: (request: GenerateStoryRequest) => Promise<void>;
  saveGeneratedStory: (storyData: SaveStoryRequest) => Promise<Story>;
  resetGeneration: () => void;
  fetchQuota: () => Promise<void>;
  
  // Helpers
  canGenerate: boolean;
  isGenerating: boolean;
  hasError: boolean;
}

// =================================
// Context Creation
// =================================

const StoryGenerationContext = createContext<StoryGenerationContextType | undefined>(undefined);

// =================================
// Provider Component
// =================================

interface StoryGenerationProviderProps {
  children: ReactNode;
}

export const StoryGenerationProvider: React.FC<StoryGenerationProviderProps> = ({ children }) => {
  const [generationState, setGenerationState] = useState<GenerationState>('IDLE');
  const [progress, setProgress] = useState<GenerationProgress>({
    state: 'IDLE',
    stage: '',
    progress: 0,
    message: '',
  });
  const [generatedStory, setGeneratedStory] = useState<GenerateStoryResponse | null>(null);
  const [savedStory, setSavedStory] = useState<Story | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [quota, setQuota] = useState<StoryQuota | null>(null);
  
  // =================================
  // Progress Simulation
  // =================================
  
  /**
   * Simulate generation progress since backend doesn't provide real-time updates
   * Shows stages: Crafting story → Generating cover image → Creating scenes
   */
  const simulateProgress = useCallback((
    request: GenerateStoryRequest,
    startCallback: () => void
  ) => {
    const stages = [
      { stage: 'Crafting story...', duration: 0.4, message: 'AI is writing your story' },
      { stage: 'Generating cover image...', duration: 0.3, message: 'Creating beautiful artwork' },
      { stage: 'Creating scenes...', duration: 0.3, message: 'Adding final touches' },
    ];
    
    const totalTime = estimateGenerationTime(request.prompt.length, request.includeImages || false);
    let currentProgress = 0;
    let stageIndex = 0;
    
    const updateInterval = 500; // Update every 500ms
    const totalSteps = (totalTime * 1000) / updateInterval;
    const progressPerStep = 100 / totalSteps;
    
    startCallback();
    
    const interval = setInterval(() => {
      currentProgress += progressPerStep;
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress({
          state: 'GENERATING',
          stage: 'Finalizing...',
          progress: 95,
          message: 'Almost done!',
        });
        return;
      }
      
      // Update stage
      let cumulativeDuration = 0;
      for (let i = 0; i < stages.length; i++) {
        cumulativeDuration += stages[i].duration;
        if (currentProgress / 100 < cumulativeDuration) {
          stageIndex = i;
          break;
        }
      }
      
      const currentStage = stages[stageIndex];
      const timeRemaining = Math.ceil((100 - currentProgress) / progressPerStep * updateInterval / 1000);
      
      setProgress({
        state: 'GENERATING',
        stage: currentStage.stage,
        progress: Math.min(95, currentProgress), // Cap at 95% until actually done
        estimatedTimeRemaining: timeRemaining,
        message: currentStage.message,
      });
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, []);
  
  // =================================
  // Generate Story
  // =================================
  
  const generateNewStory = useCallback(async (request: GenerateStoryRequest) => {
    try {
      setGenerationState('GENERATING');
      setError(null);
      
      // Start progress simulation
      const cleanup = simulateProgress(request, () => {
        setProgress({
          state: 'GENERATING',
          stage: 'Initializing...',
          progress: 0,
          message: 'Starting story generation',
        });
      });
      
      // Make API request
      const response = await generateStory(request);
      
      cleanup();
      
      // Success
      setGenerationState('SUCCESS');
      setGeneratedStory(response);
      setProgress({
        state: 'SUCCESS',
        stage: 'Complete!',
        progress: 100,
        message: 'Your story is ready!',
      });
      
      // Refresh quota
      await fetchQuota();
      
    } catch (err: any) {
      logError('Story Generation', err);
      reportError('Story Generation Failed', err, { request });
      
      setGenerationState('ERROR');
      setError(err);
      setProgress({
        state: 'ERROR',
        stage: 'Failed',
        progress: 0,
        message: handleGenerationError(err),
      });
      
      throw err;
    }
  }, [simulateProgress]);
  
  // =================================
  // Save Story
  // =================================
  
  const saveGeneratedStory = useCallback(async (storyData: SaveStoryRequest): Promise<Story> => {
    try {
      setGenerationState('SAVING');
      setError(null);
      
      const response: SaveStoryResponse = await saveStoryAPI(storyData);
      
      setGenerationState('PUBLISHED');
      setSavedStory(response.data);
      
      return response.data;
      
    } catch (err: any) {
      logError('Save Story', err);
      reportError('Save Story Failed', err, { storyData });
      
      setGenerationState('ERROR');
      setError(err);
      
      throw err;
    }
  }, []);
  
  // =================================
  // Fetch Quota
  // =================================
  
  const fetchQuota = useCallback(async () => {
    try {
      const quotaData = await getGenerationQuota();
      setQuota(quotaData);
    } catch (err: any) {
      logError('Fetch Quota', err);
      // Don't throw - quota fetch failure shouldn't block user
    }
  }, []);
  
  // =================================
  // Reset
  // =================================
  
  const resetGeneration = useCallback(() => {
    setGenerationState('IDLE');
    setProgress({
      state: 'IDLE',
      stage: '',
      progress: 0,
      message: '',
    });
    setGeneratedStory(null);
    setSavedStory(null);
    setError(null);
  }, []);
  
  // =================================
  // Computed Values
  // =================================
  
  const canGenerate = quota !== null && quota.remaining > 0 && generationState === 'IDLE';
  const isGenerating = generationState === 'GENERATING' || generationState === 'SAVING';
  const hasError = generationState === 'ERROR' && error !== null;
  
  // =================================
  // Context Value
  // =================================
  
  const value: StoryGenerationContextType = {
    generationState,
    progress,
    generatedStory,
    savedStory,
    error,
    quota,
    generateNewStory,
    saveGeneratedStory,
    resetGeneration,
    fetchQuota,
    canGenerate,
    isGenerating,
    hasError,
  };
  
  return (
    <StoryGenerationContext.Provider value={value}>
      {children}
    </StoryGenerationContext.Provider>
  );
};

// =================================
// Hook
// =================================

export const useStoryGeneration = (): StoryGenerationContextType => {
  const context = useContext(StoryGenerationContext);
  
  if (!context) {
    throw new Error('useStoryGeneration must be used within StoryGenerationProvider');
  }
  
  return context;
};

export default StoryGenerationContext;
