import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const UserTour: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tourKey, setTourKey] = useState<string>('');
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getDashboardSteps = (): TourStep[] => {
    const isMobile = window.innerWidth < 768;
    
    const nicknameStep: TourStep = {
      target: '#tour-edit-nickname-btn',
      title: 'Personalize Identity',
      content: 'Click this edit icon to change your nickname. You get one free change!',
      placement: isMobile ? 'bottom' : 'right',
    };

    if (isMobile) {
      return [nicknameStep];
    }

    return [
      nicknameStep,
      {
        target: '#tour-nav-feed',
        title: 'Community Pulse',
        content: 'Check out the latest posts from the community here.',
        placement: 'bottom',
      },
      {
        target: '#tour-nav-games',
        title: 'Play & Earn',
        content: 'Play exclusive games to earn coins and check the Leaderboard!',
        placement: 'bottom',
      },
      {
        target: '#tour-nav-studio',
        title: 'Creative Studio',
        content: 'Hover over Studio to access Story Creation and view all Stories from the community.',
        placement: 'bottom',
      },
      {
        target: '#tour-nav-events',
        title: 'Live Action',
        content: 'Never miss out! See upcoming events, tournaments, and special streams here.',
        placement: 'bottom',
      },
      {
        target: '#tour-nav-membership',
        title: 'Unlock More',
        content: 'Manage your subscription or upgrade to higher tiers for more benefits.',
        placement: 'bottom',
      },
      {
        target: '#tour-profile-menu',
        title: 'Quick Access Menu',
        content: 'Click your profile to access My Content, My Orders, and quick settings.',
        placement: 'bottom',
      },
    ];
  };

  const calculateTooltipPosition = (targetElement: HTMLElement, placement: string = 'bottom') => {
    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 360;
    const tooltipHeight = 200;
    const offset = 16;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + offset;
        break;
    }

    // Keep within viewport
    const maxLeft = window.innerWidth - tooltipWidth - 16;
    const maxTop = window.innerHeight - tooltipHeight - 16;
    left = Math.max(16, Math.min(left, maxLeft));
    top = Math.max(16, Math.min(top, maxTop));

    return { top, left };
  };

  const updateTooltipPosition = () => {
    if (!isActive || steps.length === 0) return;

    const step = steps[currentStep];
    const targetElement = document.querySelector(step.target) as HTMLElement;

    if (targetElement) {
      const position = calculateTooltipPosition(targetElement, step.placement);
      setTooltipPosition(position);
      
      // Scroll element into view with a small delay to ensure DOM is ready
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      // If target not found, retry after a short delay before ending tour
      console.warn(`Tour target not found: ${step.target}, retrying...`);
      setTimeout(() => {
        const retryElement = document.querySelector(step.target) as HTMLElement;
        if (retryElement) {
          updateTooltipPosition();
        } else {
          console.error(`Tour target still not found after retry: ${step.target}`);
          endTour();
        }
      }, 300);
    }
  };

  useEffect(() => {
    if (isActive) {
      updateTooltipPosition();
      window.addEventListener('resize', updateTooltipPosition);
      window.addEventListener('scroll', updateTooltipPosition, true);
      
      return () => {
        window.removeEventListener('resize', updateTooltipPosition);
        window.removeEventListener('scroll', updateTooltipPosition, true);
      };
    }
  }, [isActive, currentStep, steps]);

  const startTour = (tourSteps: TourStep[], key: string) => {
    // Verify first target exists before starting
    if (tourSteps.length > 0) {
      const firstTarget = document.querySelector(tourSteps[0].target);
      if (!firstTarget) {
        console.warn(`Cannot start tour: first target not found - ${tourSteps[0].target}`);
        return;
      }
    }
    setSteps(tourSteps);
    setTourKey(key);
    setCurrentStep(0);
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    if (tourKey) {
      localStorage.setItem(tourKey, 'true');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const handleStartTour = () => {
      if (location.pathname === '/dashboard') {
        const key = 'dashboard_tour_v1';
        // Add small delay to ensure DOM is ready
        setTimeout(() => {
          const tourSteps = getDashboardSteps();
          startTour(tourSteps, key);
        }, 300);
      }
    };

    window.addEventListener('start-tour', handleStartTour);

    if (!isLoggedIn) {
      setIsActive(false);
      return () => window.removeEventListener('start-tour', handleStartTour);
    }
    
    // Auto-start tours based on route
    if (location.pathname === '/') {
      const key = 'home_tour_v1';
      if (!localStorage.getItem(key)) {
        const homeSteps: TourStep[] = [
          {
            target: '#tour-profile-menu-container',
            title: 'Welcome to Dashboard',
            content: 'Hover over your profile here to access your Dashboard, where you can manage your settings and nickname.',
            placement: 'bottom',
          }
        ];
        setTimeout(() => startTour(homeSteps, key), 500);
      }
    } else if (location.pathname === '/dashboard') {
      const key = 'dashboard_tour_v1';
      if (!localStorage.getItem(key)) {
        setTimeout(() => startTour(getDashboardSteps(), key), 500);
      }
    }
    
    return () => window.removeEventListener('start-tour', handleStartTour);
  }, [location.pathname, isLoggedIn]);

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const targetElement = document.querySelector(step.target) as HTMLElement;

  if (!targetElement) {
    // If target not found, end tour
    setTimeout(() => endTour(), 100);
    return null;
  }

  const targetRect = targetElement.getBoundingClientRect();

  return (
    <>
      {/* Overlay - Blocks everything except the spotlight area */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={endTour}
      />
      
      {/* Spotlight */}
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          boxShadow: '0 0 0 2px #F59E0B, 0 0 0 9999px rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-[#18181b] border border-yellow-500/40 rounded-xl shadow-[0_0_30px_-5px_theme(colors.yellow.500/0.3)] p-5 md:p-6 max-w-[calc(100vw-32px)] w-[360px] overflow-hidden flex flex-col"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Background accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={endTour}
          className="absolute top-3 right-3 text-gray-500 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors z-10" 
          title="Skip Tour"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="relative z-10 mb-6 mt-1">
          <h4 className="text-lg md:text-xl font-bold text-white mb-2 tracking-wide font-display">
            {step.title}
          </h4>
          <div className="text-gray-300 text-sm md:text-[15px] leading-relaxed font-light">
            {step.content}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          {/* Steps counter */}
          <div className="text-xs font-mono text-yellow-500/80 bg-yellow-500/10 px-2 py-1 rounded">
            STEP {currentStep + 1} <span className="text-gray-600">/</span> {steps.length}
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button 
                onClick={prevStep}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/5"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-2 px-5 rounded-lg text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-500/20 flex items-center gap-1.5"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight size={14} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTour;
