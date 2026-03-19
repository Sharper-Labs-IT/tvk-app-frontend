export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'default';
  className?: string; // Optional custom className
}

import React from 'react';
import { twMerge } from 'tailwind-merge';

const Loader: React.FC<LoaderProps> = ({ size = 'default', className }) => {
  if (size === 'default') {
    return (
      <div className={twMerge("fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95", className)}>
        {/* Gold Spinner Animation */}
        <div className="relative flex items-center justify-center">
          {/* Outer Ring */}
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-brand-gold animate-spin"></div>
          
          {/* Inner Ring */}
          <div className="absolute h-16 w-16 rounded-full border-r-4 border-l-4 border-brand-goldDark animate-spin direction-reverse"></div>
          
          {/* Center Logo */}
          <img src="/images/tvk-logo.png" alt="Loading" className="absolute h-8 w-auto opacity-80" /> 
        </div>
      </div>
    );
  }

  // Inline loaders
  const dimensions = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }[size] || 'h-8 w-8 border-2';

  return (
    <div className={twMerge("inline-flex items-center justify-center", className)}>
      <div className={`${dimensions} rounded-full border-brand-gold border-t-transparent animate-spin`}></div>
    </div>
  );
};

export default Loader;
