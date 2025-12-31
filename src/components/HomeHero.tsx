import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGeoLocation } from '../hooks/useGeoLocation';

const HomeHero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { countryCode: detectedCountryCode } = useGeoLocation();
  const isSuperFan = user?.membership_tier === 'super_fan' || user?.membership_tier === 'Super Fan';
  const isIndia = detectedCountryCode === 'IN';

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
      {/* Desktop Layout (xl+) - Flex instead of grid, better spacing */}
<div className="hidden xl:block">
  <div className="relative h-screen">
    <div className="max-w-6xl mx-auto px-6 lg:px-12 h-full flex items-center justify-center">
      <div className="flex flex-row items-center justify-between gap-12 w-full max-w-[95%]">
        {/* Left: Text Content */}
        <div className="flex flex-col justify-center text-left space-y-4 lg:space-y-6 max-w-lg">
          <h1
            className={`
              ${getAnimClass('delay-0')}
              font-extrabold tracking-tight uppercase
              text-[clamp(2.5rem,4vw,4rem)] 
              leading-none
            `}
          >
            <span
              className="
                bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)]
                bg-clip-text text-transparent
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
              "
            >
              TVK MEMBERS
            </span>
          </h1>

          <h2
            className={`text-2xl lg:text-3xl font-bold text-white leading-tight ${getAnimClass('delay-[200ms]')}`}
          >
            The Ultimate Global Fan Hub
          </h2>

          <div
            className={`text-base lg:text-lg text-gray-300 font-medium ${getAnimClass('delay-[400ms]')}`}
          >
            <p>One World. One Thalapathy Family.</p>
            <p className="mt-2 text-sm text-gray-400">
              Membership is currently available to fans outside India only
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 pt-4">
            <div
              className={`flex flex-row justify-start gap-4 ${getAnimClass('delay-[600ms]')}`}
            >
              {/* Your existing button logic here - unchanged */}
              {isIndia ? (
                <button disabled className="px-6 py-3 bg-gray-800 text-gray-500 font-bold rounded-md shadow-lg cursor-not-allowed uppercase tracking-wide text-sm border border-gray-700">
                  Not Available in India
                </button>
              ) : isLoggedIn && isSuperFan ? (
                <button onClick={() => navigate('/membership')} className="px-6 py-3 bg-brand-gold text-brand-dark font-bold rounded-md shadow-lg hover:bg-brand-goldDark hover:shadow-xl transition-all duration-200 uppercase tracking-wide text-sm">
                  Manage Membership
                </button>
              ) : (
                <>
                  <button
                    onClick={() => !isLoggedIn && navigate('/signup')}
                    disabled={isLoggedIn}
                    className={`px-6 py-3 font-bold rounded-md shadow-lg transition-all duration-200 uppercase tracking-wide text-sm ${
                      isLoggedIn ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-brand-dark hover:bg-gray-100 hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {isLoggedIn ? 'Already Joined' : 'Join Free'}
                  </button>

                  <button
                    onClick={() => navigate('/membership')}
                    className="px-6 py-3 bg-brand-gold text-brand-dark font-bold rounded-md shadow-lg hover:bg-brand-goldDark hover:shadow-xl hover:scale-105 transition-all duration-200 uppercase tracking-wide text-sm whitespace-nowrap"
                  >
                    Become a Super Fan £9.99
                  </button>
                </>
              )}
            </div>

            <p className={`text-sm text-gray-500 font-light italic max-w-md ${getAnimClass('delay-[700ms]')}`}>
              This is an independent global fan platform created to celebrate actor Vijay’s legacy following his final film. It is not officially affiliated with or endorsed by Thalapathy Vijay or his representatives.
            </p>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="flex justify-center items-center flex-1">
          <img
            src="/images/HeroBackImg.png"
            alt="Thalapathy Vijay"
            className={`w-full max-w-[500px] lg:max-w-[600px] h-auto max-h-[85vh] object-contain object-bottom pointer-events-none transition-opacity duration-1000 ${
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
                <span
                  className="
                  bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)]
                  bg-clip-text text-transparent
                  drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
                "
                >
                  TVK MEMBERS
                </span>
              </h1>

              <div className="h-6" />

              <h2
                className={`text-3xl md:text-4xl font-bold text-white leading-tight max-w-xl ${getAnimClass(
                  'delay-[200ms]'
                )}`}
              >
                The Ultimate Global Fan Hub
              </h2>

              <div className="h-5" />

              <p
                className={`text-lg md:text-xl text-gray-300 font-medium ${getAnimClass(
                  'delay-[400ms]'
                )}`}
              >
                One World. One Thalapathy Family.
              </p>
              
              <p className={`mt-3 text-sm font-medium text-gray-400 ${getAnimClass('delay-[500ms]')}`}>
                 Membership is currently available to fans outside India only
              </p>

              <div className="h-8" />

              <div
                className={`flex flex-row justify-center gap-4 ${getAnimClass('delay-[600ms]')}`}
              >
                {isIndia ? (
                  <button
                    disabled
                    className="px-7 py-3.5 bg-gray-800 text-gray-500 font-bold rounded-md shadow-lg cursor-not-allowed uppercase tracking-wide text-sm whitespace-nowrap border border-gray-700"
                  >
                    Not Available in India
                  </button>
                ) : isLoggedIn && isSuperFan ? (
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

              {/* Tablet Disclaimer - Added 'italic' */}
              <p className={`mt-6 text-xs text-gray-500 font-light italic max-w-lg mx-auto ${getAnimClass('delay-[700ms]')}`}>
                This is an independent global fan platform created to celebrate actor Vijay’s legacy following his final film. It is not officially affiliated with or endorsed by Thalapathy Vijay or his representatives.
              </p>
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
              <span
                className="
                bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)]
                bg-clip-text text-transparent
                drop-shadow-sm
              "
              >
                TVK Members
              </span>
            </h1>

            <div className="h-4" />

            <h2
              className={`text-2xl sm:text-3xl font-bold text-white leading-tight px-2 ${getAnimClass(
                'delay-[200ms]'
              )}`}
            >
              The Ultimate Global Fan Hub
            </h2>

            <div className="h-4" />

            <p
              className={`text-base sm:text-lg text-gray-300 font-medium ${getAnimClass(
                'delay-[400ms]'
              )}`}
            >
              One World. One Thalapathy Family.
            </p>
            
            <p className={`mt-3 px-4 text-xs sm:text-sm font-medium text-gray-400 ${getAnimClass('delay-[500ms]')}`}>
               Membership is currently available to fans outside India only
            </p>

            <div className="h-8" />

            <div className={`flex flex-col w-full max-w-sm gap-3 ${getAnimClass('delay-[600ms]')}`}>
              {isIndia ? (
                <button
                  disabled
                  className="w-full px-8 py-3.5 bg-gray-800 text-gray-500 font-bold rounded shadow cursor-not-allowed uppercase tracking-wide text-sm border border-gray-700"
                >
                  Not Available in India
                </button>
              ) : isLoggedIn && isSuperFan ? (
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

            {/* Mobile Disclaimer - Added 'italic' */}
            <p className={`mt-6 px-2 text-[10px] text-gray-500 font-light italic leading-tight max-w-xs mx-auto ${getAnimClass('delay-[700ms]')}`}>
              This is an independent global fan platform created to celebrate actor Vijay’s legacy following his final film. It is not officially affiliated with or endorsed by Thalapathy Vijay or his representatives.
            </p>
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