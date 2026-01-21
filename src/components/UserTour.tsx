import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step, TooltipRenderProps } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const CustomTooltip = ({
  index,
  step,
  backProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
  skipProps,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="bg-[#18181b] border border-yellow-500/40 rounded-xl shadow-[0_0_30px_-5px_theme(colors.yellow.500/0.3)] p-5 md:p-6 max-w-[calc(100vw-32px)] w-[360px] relative overflow-hidden flex flex-col"
    >
       {/* Background accent */}
       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
       <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none"></div>

       {/* Close/Skip Button */}
       <button 
         {...skipProps} 
         className="absolute top-3 right-3 text-gray-500 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors" 
         title="Skip Tour"
       >
           <X size={18} />
       </button>

       {/* Content */}
       <div className="relative z-10 mb-6 mt-1">
          {step.title && (
             <h4 className="text-lg md:text-xl font-bold text-white mb-2 tracking-wide font-display">{step.title}</h4>
          )}
          <div className="text-gray-300 text-sm md:text-[15px] leading-relaxed font-light">
             {step.content}
          </div>
       </div>

       {/* Footer */}
       <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
           {/* Steps counter */}
          <div className="text-xs font-mono text-yellow-500/80 bg-yellow-500/10 px-2 py-1 rounded">
            STEP {index + 1} <span className="text-gray-600">/</span> {size}
          </div>

          <div className="flex items-center gap-3">
             {index > 0 && (
                <button 
                  {...backProps} 
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/5"
                >
                   <ChevronLeft size={14} /> Back
                </button>
             )}
             <button
                {...primaryProps}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-2 px-5 rounded-lg text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-500/20 flex items-center gap-1.5"
             >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight size={14} strokeWidth={3} />}
             </button>
          </div>
       </div>
    </div>
  );
};

const UserTour: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tourKey, setTourKey] = useState<string>('');

  const getDashboardSteps = () => {
    const isMobile = window.innerWidth < 768;
    
    // Nickname step definition
    const nicknameStep = {
      target: '#tour-edit-nickname-btn',
      title: 'Personalize Identity',
      content: 'Click this edit icon to change your nickname. You get one free change!',
      disableBeacon: true,
      placement: isMobile ? 'bottom' as const : 'right' as const,
    };

    // If mobile, return ONLY the nickname step
    if (isMobile) {
      return [nicknameStep];
    }

    // Otherwise return full tour
    return [
      nicknameStep,
      {
        target: '#tour-nav-feed',
        title: 'Community Pulse',
        content: 'Check out the latest posts from the community here.',
        placement: 'bottom' as const,
      },
      {
        target: '#tour-nav-my-content',
        title: 'Your Creative Hub',
        content: 'Track and manage your personal posts, comments, and interactions. This is your personal creative hub!',
        placement: 'bottom' as const,
      },
      {
        target: '#tour-nav-games',
        title: 'Play & Earn',
        content: 'Play exclusive games to earn coins and check the Leaderboard!',
        placement: 'bottom' as const,
      },
      {
        target: '#tour-nav-events',
        title: 'Live Action',
        content: 'Never miss out! See upcoming events, tournaments, and special streams here.',
        placement: 'bottom' as const,
      },
      {
        target: '#tour-nav-membership',
        title: 'Unlock More',
        content: 'Manage your subscription or upgrade to higher tiers for more benefits.',
        placement: 'bottom' as const,
      },
    ];
  };

  useEffect(() => {
    const handleStartTour = () => {
      // Force start if on dashboard
      if (location.pathname === '/dashboard') {
        const key = 'dashboard_tour_v1';
        setSteps(getDashboardSteps());
        setTourKey(key);
        setRun(true);
      }
    };

    window.addEventListener('start-tour', handleStartTour);

    // Initial check
    if (!isLoggedIn) {
        setRun(false);
        return () => window.removeEventListener('start-tour', handleStartTour);
    }
    
    let currentSteps: Step[] = [];
    let key = '';

    // Define tours based on route
    if (location.pathname === '/') {
      key = 'home_tour_v1';
      // Only show if not completed
      if (!localStorage.getItem(key)) {
        currentSteps = [
          {
            target: '#tour-profile-menu-container',
            title: 'Welcome to Dashboard',
            content: 'Hover over your profile here to access your Dashboard, where you can manage your settings and nickname.',
            disableBeacon: true,
            placement: 'bottom',
          }
        ];
      }
    } else if (location.pathname === '/dashboard') {
      key = 'dashboard_tour_v1';
      if (!localStorage.getItem(key)) {
        currentSteps = getDashboardSteps();
      }
    }

    if (currentSteps.length > 0) {
      setSteps(currentSteps);
      setTourKey(key);
      setRun(true);
    } 
    
    return () => window.removeEventListener('start-tour', handleStartTour);
  }, [location.pathname, isLoggedIn]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Mark this specific tour as completed
      if (tourKey) {
        localStorage.setItem(tourKey, 'true');
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      tooltipComponent={CustomTooltip}
      disableOverlayClose
      spotlightPadding={4}
      floaterProps={{
        hideArrow: false,
        disableAnimation: false,
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#F59E0B',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
        },
        spotlight: {
          borderRadius: 8,
          boxShadow: '0 0 0 2px #F59E0B, 0 0 0 4px rgba(0,0,0,0.8)',
        }
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default UserTour;
