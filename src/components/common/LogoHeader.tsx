import React from 'react';
import { Link } from 'react-router-dom';

/**
 * @fileoverview Reusable Header component for Auth pages.
 * Includes the Logo and a redesigned "Back to Home" button.
 */

interface LogoHeaderProps {
  isVisible?: boolean; // Controls the fade-in animation state
  delayClass?: string; // Controls the staggered delay
  text?: React.ReactNode; // Optional custom text to replace "TVK MEMBERSHIP"
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ isVisible = true, delayClass = 'delay-0', text }) => {
  // Base animation logic
  const animationClass = `transform transition-all duration-700 ease-out ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  } ${delayClass}`;

  return (
    <div className={`flex justify-between items-center p-6 sm:p-8 z-10 w-full ${animationClass}`}>
      {/* Left Side: Logo */}
      <div className="flex items-center gap-2 sm:gap-3 select-none">
        <img src="/images/tvk-logo.png" alt="VJ Fans Hub Logo" className="h-8 sm:h-10 w-auto object-contain" />
        <span className="text-white font-bold tracking-wider uppercase text-[10px] sm:text-sm md:text-base lg:text-lg xl:text-xl leading-tight">
          {text ? (
            text
          ) : (
            <>
              VJ FANS <span className="text-tvk-accent-gold">HUB</span>
            </>
          )}
        </span>
      </div>

      {/* Right Side: Redesigned "Back to Home" Button */}
      <Link
        to="/"
        className="
          group flex items-center gap-2 
          px-3 py-1.5 sm:px-5 sm:py-2.5 
          rounded-full 
          bg-white/5 border border-white/10 backdrop-blur-sm
          hover:bg-white/10 hover:border-tvk-accent-gold/50 
          transition-all duration-300 ease-out
          active:scale-95
        "
      >
        {/* Left Arrow Icon (Animate slide left on hover) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-tvk-accent-gold transition-colors duration-300 group-hover:-translate-x-1 transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>

        <span className="text-xs sm:text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
          Back
        </span>
      </Link>
    </div>
  );
};

export default LogoHeader;
