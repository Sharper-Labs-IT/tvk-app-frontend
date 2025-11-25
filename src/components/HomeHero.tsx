import React, { useEffect, useState } from 'react';

const HomeHero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 0.5 second delay to account for global loading screen
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Helper string for common transition styles
  const transitionBase = 'transition-all duration-1000 ease-out transform';
  const getAnimClass = (delayClass: string) =>
    `${transitionBase} ${delayClass} ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    }`;

  return (
    // UPDATED: Increased min-h for mobile (800px) to allow stacking, kept lg:min-h original
    <section className="relative w-full bg-brand-dark overflow-hidden min-h-[800px] lg:min-h-[650px] flex items-start lg:items-center">
      {/* --- LAYER 1: Yellow Line --- */}
      <div className="absolute bottom-2 left-0 w-full h-3 bg-brand-gold z-0" />

      {/* --- LAYER 2: Hero Image --- */}
      <img
        src="/images/HeroBackImg.png"
        alt="Thalapathy Vijay"
        // UPDATED: Added 'left-1/2 -translate-x-1/2' for mobile centering, reset for desktop
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-0 z-10 w-auto h-[50%] md:h-[75%] lg:h-[95%] object-contain object-bottom pointer-events-none transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* --- LAYER 3: Red Line --- */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-red-600 z-20" />

      {/* --- LAYER 4: Main Content --- */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
        {/* UPDATED: Added 'justify-start pt-20 pb-[50%]' for mobile layout, 'items-center text-center' for alignment */}
        <div className="flex flex-col justify-start lg:justify-center items-center lg:items-start text-center lg:text-left h-full w-full lg:w-2/3 pt-20 pb-[50%] lg:pt-0 lg:pb-0 lg:py-20">
          {/* Headline */}
          <h1
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight uppercase whitespace-normal md:whitespace-nowrap ${getAnimClass(
              'delay-0'
            )}`}
          >
            <span className="bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)] bg-clip-text text-transparent drop-shadow-sm leading-tight">
              TVK Members
            </span>
          </h1>

          {/* Spacer */}
          <div className="h-6 md:h-8" />

          {/* Sub-headline */}
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight ${getAnimClass(
              'delay-[200ms]'
            )}`}
          >
            The Ultimate Global Fan Hub
          </h2>

          {/* Spacer */}
          <div className="h-6 md:h-8" />

          {/* Tagline */}
          <p
            className={`text-lg md:text-xl text-gray-300 font-medium ${getAnimClass(
              'delay-[400ms]'
            )}`}
          >
            One World. One Thalapathy Family.
          </p>

          {/* Spacer */}
          <div className="h-10 md:h-12" />

          {/* Buttons Group */}
          {/* UPDATED: Added 'w-full justify-center' for mobile centering */}
          <div
            className={`w-full flex flex-col sm:flex-row justify-center lg:justify-start gap-5 ${getAnimClass(
              'delay-[600ms]'
            )}`}
          >
            <button className="px-10 py-4 bg-white text-brand-dark font-bold rounded shadow hover:bg-gray-100 transition-colors duration-200 uppercase tracking-wide text-sm md:text-base">
              Join Free
            </button>

            <button className="px-10 py-4 bg-brand-gold text-brand-dark font-bold rounded shadow hover:bg-brand-goldDark transition-colors duration-200 uppercase tracking-wide text-sm md:text-base">
              Become a Super Fan $9.99
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
