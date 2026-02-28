import React, { useEffect, useState } from 'react';
import { useStoryGeneration } from '../../context/StoryGenerationContext';

/**
 * Story Generation Progress Component
 * 
 * Displays animated loading screen during story generation:
 * - Progress bar
 * - Current stage
 * - Estimated time remaining
 * - Warning not to close page
 */

const StoryGenerationProgress: React.FC = () => {
  const { progress, isGenerating } = useStoryGeneration();
  const [dots, setDots] = useState('');
  
  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isGenerating || progress.state === 'IDLE') {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-brand-dark z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse animation-delay-2000" />
        </div>
        
        {/* Content */}
        <div className="relative bg-tvk-dark-card rounded-3xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-sm">
          {/* Icon */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="w-24 h-24 bg-brand-dark border-4 border-brand-gold/20 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(230,198,91,0.2)]">
                <span className="text-5xl animate-bounce">✨</span>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-gold border-t-transparent animate-spin" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-4xl font-zentry text-brand-gold text-center mb-4 tracking-wide drop-shadow-md">
            Creating Your Story{dots}
          </h2>
          
          {/* Stage */}
          <p className="text-xl text-white/80 text-center mb-10 font-light">
            {progress.stage}
          </p>
          
          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="w-full h-8 bg-brand-dark rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-brand-goldDark to-brand-gold rounded-full transition-all duration-500 ease-out shadow-[0_0_20px_rgba(230,198,91,0.4)] relative"
                style={{ width: `${progress.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="text-brand-dark font-black text-sm tracking-wider">
                {Math.round(progress.progress)}%
              </span>
            </div>
          </div>
          
          {/* Message */}
          <p className="text-center text-gray-400 mb-8 h-6 text-sm">
            {progress.message}
          </p>
          
          {/* Time Remaining */}
          {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
            <div className="flex justify-center mb-8">
              <span className="px-4 py-2 bg-brand-dark rounded-xl text-brand-gold text-sm font-bold border border-brand-gold/20 flex items-center gap-2">
                <span className="animate-pulse">⏱️</span> 
                About {Math.ceil(progress.estimatedTimeRemaining / 60)} {' '}
                {Math.ceil(progress.estimatedTimeRemaining / 60) === 1 ? 'minute' : 'minutes'} remaining
              </span>
            </div>
          )}
          
          {/* Warning */}
          <div className="bg-brand-dark/50 border border-brand-gold/10 rounded-xl p-5 text-center">
            <p className="text-gray-400 text-sm">
              <strong className="text-brand-gold block mb-1">Do not close this page</strong> 
              This process usually takes 2-7 minutes to generate high-quality content.
            </p>
          </div>
        </div>
      </div>
      
      {/* Disable submit button notice */}
      <button
        disabled
        className="hidden"
        aria-label="Generation in progress"
      />
    </div>
  );
};

export default StoryGenerationProgress;
