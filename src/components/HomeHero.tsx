import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

const HomeHero: React.FC = () => {
  return (
    // 1. Main Container: Dark background, takes full screen height, relative for positioning children
    <section className="relative w-full min-h-screen bg-brand-dark overflow-hidden flex flex-col">
        
      {/* 2. Yellow Side Borders (Absolute positioning to stick to edges) */}
      {/* Left Border */}
      <div className="absolute left-0 top-0 bottom-0 w-4 md:w-6 bg-brand-gold z-10"></div>
      {/* Right Border */}
      <div className="absolute right-0 top-0 bottom-0 w-4 md:w-6 bg-brand-gold z-10"></div>


      {/* 3. Content Layer (Z-index higher than borders) */}
      <div className="relative z-20 flex flex-col flex-grow h-full">
        
        {/* The Transparent Header sits at the top */}
        <Header />

        {/* Main Hero Body Area */}
        {/* Use flex-grow to fill space, items-center to vertically center content */}
        <div className="flex-grow container mx-auto px-10 md:px-20 py-8 flex items-center">
          
          {/* Grid layout: 1 column on mobile, 2 columns on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
            
            {/* === LEFT COLUMN: TEXT & BUTTONS === */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div>
                 {/* Gold Gradient Text */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-wider leading-none font-sans mb-4">
                   <span className="text-gradient-gold">TVK MEMBERS</span>
                </h1>
                {/* White Subtext */}
                <h2 className="text-3xl md:text-5xl text-white font-bold mb-6">
                  The Ultimate Global Fan Hub
                </h2>
                {/* Smaller Gray Text */}
                <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
                  One World. One Thalapathy Family.
                </p>
              </div>

              {/* Buttons Area */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                {/* Join Free Button (White) */}
                <Link 
                  to="/membership" 
                  className="px-10 py-4 bg-white text-brand-dark font-bold rounded text-xl hover:bg-gray-100 transition-colors min-w-[180px] text-center"
                >
                  Join Free
                </Link>

                {/* Super Fan Button (Gold Gradient) */}
                <Link 
                  to="/membership" 
                  className="px-10 py-4 btn-gold-gradient text-brand-dark font-bold rounded text-xl hover:opacity-90 transition-opacity min-w-[300px] text-center shadow-[0_0_20px_rgba(230,198,91,0.4)]"
                >
                  Become a Super Fan $9.99
                </Link>
              </div>
            </div>


            {/* === RIGHT COLUMN: ACTOR IMAGE === */}
            {/* order-1 on mobile (shows first), order-2 on desktop (shows right) */}
            <div className="flex justify-center lg:justify-end items-end order-1 lg:order-2 relative h-full">
               <img 
                 src="/images/HeroBackImg.png" 
                 alt="Thalapathy Vijay" 
                 /* Adjust max-h (max height) to fit the image properly within the screen */
                 className="w-auto max-h-[50vh] md:max-h-[70vh] lg:max-h-[85vh] object-contain drop-shadow-2xl" 
               />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;