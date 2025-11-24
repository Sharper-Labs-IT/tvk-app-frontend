import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
      {/* Gold Spinner Animation 
        - animate-spin: Tailwind's built-in spin animation
        - border-t-brand-gold: Makes just the top part gold so you see it spinning
      */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-brand-gold animate-spin"></div>
        
        {/* Inner Ring (Optional, spins opposite direction for cool effect) */}
        <div className="absolute h-16 w-16 rounded-full border-r-4 border-l-4 border-brand-goldDark animate-spin direction-reverse"></div>
        
        {/* Center Logo (Optional - if you want your logo in the middle) */}
         <img src="/images/tvk-logo.png" alt="Loading" className="absolute h-8 w-auto opacity-80" /> 
      </div>

      {/* Loading Text */}
      <h2 className="mt-8 text-xl font-bold tracking-widest text-brand-gold animate-pulse">
        LOADING...
      </h2>
    </div>
  );
};

export default Loader;