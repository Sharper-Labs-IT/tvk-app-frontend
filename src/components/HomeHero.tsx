import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomeHero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const isSuperFan = (user?.membership_tier === 'super_fan' || user?.membership_tier === 'Super Fan');

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
      <div className="absolute bottom-2 left-0 w-full h-2 sm:h-3 bg-brand-gold z-0" />

      {/* Red Line */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 sm:h-2 bg-red-600 z-20" />

      {/* Desktop Layout (xl+) - Grid with image on right */}
      <div className="hidden xl:block">
        <div className="relative h-screen">
          <div className="max-w-7xl 2xl:max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="grid grid-cols-2 gap-12 xl:gap-16 2xl:gap-24 items-center w-full">
              {/* Left: Text Content */}
              <div className="flex flex-col justify-center text-left space-y-8 2xl:space-y-12">
                <h1
                  className={`
                    ${getAnimClass('delay-0')}
                    font-extrabold tracking-tight uppercase
                    text-[clamp(3.5rem,5.5vw,6rem)]
                    2xl:text-[clamp(5rem,7vw,9rem)]
                    leading-none
                  `}
                >
                  <span className="
                    bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)]
                    bg-clip-text text-transparent
                    drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
                  ">
                    TVK MEMBERS
                  </span>
                </h1>

                <h2 className={`text-4xl xl:text-5xl 2xl:text-7xl font-bold text-white leading-tight ${getAnimClass('delay-[200ms]')}`}>
                  The Ultimate Global Fan Hub
                </h2>

                <p className={`text-xl xl:text-2xl 2xl:text-4xl text-gray-300 font-medium ${getAnimClass('delay-[400ms]')}`}>
                  One World. One Thalapathy Family.
                </p>

                <div className={`flex flex-row justify-start gap-4 pt-4 2xl:gap-8 2xl:pt-8 ${getAnimClass('delay-[600ms]')}`}>
                  {isLoggedIn && isSuperFan ? (
                    <button
                      onClick={() => navigate('/membership')}
                      className="px-10 py-4 2xl:px-16 2xl:py-6 bg-brand-gold text-brand-dark font-bold rounded-md shadow-lg hover:bg-brand-goldDark hover:shadow-xl hover:scale-105 transition-all duration-200 uppercase tracking-wide text-base 2xl:text-2xl whitespace-nowrap"
                    >
                      Manage Membership
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => !isLoggedIn && navigate('/signup')}
                        disabled={isLoggedIn}
                        className={`px-10 py-4 2xl:px-16 2xl:py-6 font-bold rounded-md shadow-lg transition-all duration-200 uppercase tracking-wide text-base 2xl:text-2xl ${
                          isLoggedIn
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-brand-dark hover:bg-gray-100 hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        {isLoggedIn ? 'Already Joined' : 'Join Free'}
                      </button>

                      <button
                        onClick={() => navigate('/membership')}
                        className="px-8 py-4 2xl:px-14 2xl:py-6 bg-brand-gold text-brand-dark font-bold rounded-md shadow-lg hover:bg-brand-goldDark hover:shadow-xl hover:scale-105 transition-all duration-200 uppercase tracking-wide text-base 2xl:text-2xl whitespace-nowrap"
                      >
                        Become a Super Fan £9.99
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Hero Image */}
              <div className="relative flex justify-center items-end h-full">
                <img
                  src="/images/HeroBackImg.png"
                  alt="Thalapathy Vijay"
                  className={`w-auto h-[90%] max-h-[calc(100vh-8rem)] object-contain object-bottom pointer-events-none transition-opacity duration-1000 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout (md to xl) */}
      <div className="hidden md:block xl:hidden">
        <div className="relative h-screen flex flex-col justify-center px-6 py-12">
          <div className="max-w-3xl lg:max-w-5xl mx-auto w-full h-full flex flex-col justify-center">
            {/* Text Content - Centered */}
            <div className="flex flex-col items-center text-center z-30">
              <h1
                className={`
                  ${getAnimClass('delay-0')}
                  font-extrabold tracking-tight uppercase
                  text-[clamp(3rem,7vw,4.5rem)]
                  leading-none
                `}
              >
                <span className="
                  bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)]
                  bg-clip-text text-transparent
                  drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
                ">
                  TVK MEMBERS
                </span>
              </h1>

              <div className="h-6" />

              <h2 className={`text-3xl md:text-4xl font-bold text-white leading-tight max-w-xl ${getAnimClass('delay-[200ms]')}`}>
                The Ultimate Global Fan Hub
              </h2>

              <div className="h-5" />

              <p className={`text-lg md:text-xl text-gray-300 font-medium ${getAnimClass('delay-[400ms]')}`}>
                One World. One Thalapathy Family.
              </p>

              <div className="h-8" />

              <div className={`flex flex-row justify-center gap-4 ${getAnimClass('delay-[600ms]')}`}>
                {isLoggedIn && isSuperFan ? (
                  <button
                    onClick={() => navigate('/membership')}
                    className="px-7 py-3.5 bg-brand-gold text-brand-dark font-bold rounded-md shadow-lg hover:bg-brand-goldDark hover:shadow-xl transition-all duration-200 uppercase tracking-wide text-sm whitespace-nowrap"
                  >
                    Manage Membership
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => !isLoggedIn && navigate('/signup')}
                      disabled={isLoggedIn}
                      className={`px-8 py-3.5 font-bold rounded-md shadow-lg transition-all duration-200 uppercase tracking-wide text-sm ${
                        isLoggedIn
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-white text-brand-dark hover:bg-gray-100 hover:shadow-xl'
                      }`}
                    >
                      {isLoggedIn ? 'Already Joined' : 'Join Free'}
                    </button>

                    <button
                      onClick={() => navigate('/membership')}
                      className="px-7 py-3.5 bg-brand-gold text-brand-dark font-bold rounded-md shadow-lg hover:bg-brand-goldDark hover:shadow-xl transition-all duration-200 uppercase tracking-wide text-sm whitespace-nowrap"
                    >
                      Become a Super Fan £9.99
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tablet Hero Image */}
            <div className="flex-1 flex justify-center items-end mt-6">
              <img
                src="/images/HeroBackImg.png"
                alt="Thalapathy Vijay"
                className={`w-auto max-w-full h-auto max-h-[55vh] object-contain object-bottom pointer-events-none transition-opacity duration-1000 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (sm and below) */}
      <div className="md:hidden">
        <div className="relative min-h-screen flex flex-col justify-start pt-20 pb-12 px-4">
          {/* Text Content - Centered */}
          <div className="flex flex-col items-center text-center z-30">
            <h1
              className={`
                ${getAnimClass('delay-0')}
                font-extrabold tracking-tight uppercase
                text-[clamp(2rem,10vw,3.5rem)]
                leading-tight
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

            <div className="h-4" />

            <h2 className={`text-2xl sm:text-3xl font-bold text-white leading-tight px-2 ${getAnimClass('delay-[200ms]')}`}>
              The Ultimate Global Fan Hub
            </h2>

            <div className="h-4" />

            <p className={`text-base sm:text-lg text-gray-300 font-medium ${getAnimClass('delay-[400ms]')}`}>
              One World. One Thalapathy Family.
            </p>

            <div className="h-8" />

            <div className={`flex flex-col w-full max-w-sm gap-3 ${getAnimClass('delay-[600ms]')}`}>
              {isLoggedIn && isSuperFan ? (
                <button
                  onClick={() => navigate('/membership')}
                  className="w-full px-8 py-3.5 bg-brand-gold text-brand-dark font-bold rounded shadow hover:bg-brand-goldDark active:bg-yellow-600 transition-colors duration-200 uppercase tracking-wide text-sm"
                >
                  Manage Membership
                </button>
              ) : (
                <>
                  <button
                    onClick={() => !isLoggedIn && navigate('/signup')}
                    disabled={isLoggedIn}
                    className={`w-full px-8 py-3.5 font-bold rounded shadow transition-colors duration-200 uppercase tracking-wide text-sm ${
                      isLoggedIn
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-brand-dark hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    {isLoggedIn ? 'Already Joined' : 'Join Free'}
                  </button>

                  <button
                    onClick={() => navigate('/membership')}
                    className="w-full px-8 py-3.5 bg-brand-gold text-brand-dark font-bold rounded shadow hover:bg-brand-goldDark active:bg-yellow-600 transition-colors duration-200 uppercase tracking-wide text-sm"
                  >
                    Become a Super Fan £9.99
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hero Image - Flow below buttons */}
          <div className="mt-8 flex justify-center items-end flex-1">
            <img
              src="/images/HeroBackImg.png"
              alt="Thalapathy Vijay"
              className={`w-auto max-w-full h-auto max-h-[45vh] object-contain object-bottom pointer-events-none transition-opacity duration-1000 ${
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