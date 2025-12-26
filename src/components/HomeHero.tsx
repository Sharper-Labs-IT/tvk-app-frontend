import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeHero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const transitionBase = 'transition-all duration-1000 ease-out transform';
  const getAnimClass = (delayClass: string) =>
    `${transitionBase} ${delayClass} ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    }`;

  return (
    <section className="relative w-full bg-brand-dark overflow-hidden">
      {/* Yellow Line */}
      <div className="absolute bottom-2 left-0 w-full h-3 bg-brand-gold z-0" />

      {/* Red Line */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-red-600 z-20" />

      {/* Desktop Layout (lg+) - Grid with image on right */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
          <div className="grid grid-cols-2 gap-8 items-center w-full">
            {/* Left: Text Content */}
            <div className="flex flex-col justify-center text-left">
              <h1
  className={`
    ${getAnimClass('delay-0')}
    font-extrabold tracking-tight uppercase
    whitespace-nowrap
    max-w-none
    text-[clamp(3.5rem,6vw,6rem)]
  `}
>
  <span className="
    bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)]
    bg-clip-text text-transparent
    drop-shadow-sm
  ">
    TVK Members
  </span>
</h1>

              <div className="h-8" />

              <h2 className={`text-4xl lg:text-5xl font-bold text-white leading-tight ${getAnimClass('delay-[200ms]')}`}>
                The Ultimate Global Fan Hub
              </h2>

              <div className="h-8" />

              <p className={`text-xl text-gray-300 font-medium ${getAnimClass('delay-[400ms]')}`}>
                One World. One Thalapathy Family.
              </p>

              <div className="h-12" />

              <div className={`flex flex-row justify-start gap-5 ${getAnimClass('delay-[600ms]')}`}>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-10 py-4 bg-white text-brand-dark font-bold rounded shadow hover:bg-gray-100 transition-colors duration-200 uppercase tracking-wide text-base"
                >
                  Join Free
                </button>

                <button
                  onClick={() => navigate('/membership')}
                  className="px-10 py-4 bg-brand-gold text-brand-dark font-bold rounded shadow hover:bg-brand-goldDark transition-colors duration-200 uppercase tracking-wide text-base"
                >
                  Become a Super Fan $9.99
                </button>
              </div>
            </div>

            {/* Right: Hero Image - Normal flow, no absolute overflow */}
            <div className="flex justify-end items-end h-full pb-8">
              <img
                src="/images/HeroBackImg.png"
                alt="Thalapathy Vijay"
                className={`w-auto h-[95%] max-h-screen object-contain object-bottom pointer-events-none transition-opacity duration-1000 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

     {/* Mobile & Tablet Layout */}
<div className="lg:hidden">
  <div className="relative min-h-screen flex flex-col justify-start pt-24 px-4 sm:px-6">
    {/* Text Content - Centered */}
    <div className="flex flex-col items-center text-center z-30">
      <h1
        className={`
          ${getAnimClass('delay-0')}
          font-extrabold tracking-tight uppercase
          whitespace-nowrap
          text-[clamp(2.5rem,8vw,4.5rem)]
        `}
      >
        <span className="
          bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)]
          bg-clip-text text-transparent
          drop-shadow-sm
        ">
          TVK Members
        </span>
      </h1>

      <div className="h-6 md:h-8" />

      <h2 className={`text-3xl md:text-4xl font-bold text-white leading-tight ${getAnimClass('delay-[200ms]')}`}>
        The Ultimate Global Fan Hub
      </h2>

      <div className="h-6 md:h-8" />

      <p className={`text-lg md:text-xl text-gray-300 font-medium ${getAnimClass('delay-[400ms]')}`}>
        One World. One Thalapathy Family.
      </p>

      <div className="h-10 md:h-12" />

      <div className={`flex flex-col sm:flex-row justify-center gap-5 ${getAnimClass('delay-[600ms]')}`}>
        <button
          onClick={() => navigate('/signup')}
          className="px-10 py-4 bg-white text-brand-dark font-bold rounded shadow hover:bg-gray-100 transition-colors duration-200 uppercase tracking-wide text-sm md:text-base"
        >
          Join Free
        </button>

        <button
          onClick={() => navigate('/membership')}
          className="px-10 py-4 bg-brand-gold text-brand-dark font-bold rounded shadow hover:bg-brand-goldDark transition-colors duration-200 uppercase tracking-wide text-sm md:text-base"
        >
          Become a Super Fan $9.99
        </button>
      </div>
    </div>

    {/* Mobile Hero Image - Flow below buttons */}
    <div className="mt-8 md:mt-12 flex justify-center">
      <img
        src="/images/HeroBackImg.png"
        alt="Thalapathy Vijay"
        className={`w-auto h-[35%] md:h-[55%] object-contain pointer-events-none transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  </div>
</div>

    </section>
  );
};

export default HomeHero;