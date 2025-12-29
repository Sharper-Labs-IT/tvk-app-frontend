import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2, HandCoins, Trophy } from 'lucide-react';

const GameSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[1100px] lg:min-h-screen flex flex-col items-center justify-center overflow-visible py-20 px-4"
    >
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="/images/GamebackImg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto flex flex-col items-center lg:items-start justify-center w-full h-full pb-40 lg:pb-0 px-4 lg:px-12 xl:px-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-center w-full gap-12 lg:gap-16 xl:gap-24 mb-16">
          {/* Text */}
          <div
            className={`text-center lg:text-left flex flex-col gap-6 max-w-2xl xl:max-w-3xl transition-all duration-1000 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white leading-tight font-sans">
              Play TVK Games <br />
              <span className="text-gray-200">Earn Rewards</span>
            </h2>
            <p className="text-gray-300 text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium tracking-wide">
              Unlock Points, Badges and Exclusive Fan Benefits
            </p>
          </div>

          {/* Phone */}
          <div
            className={`relative z-30 w-64 md:w-80 lg:w-[400px] xl:w-[500px] 2xl:w-[600px] flex-shrink-0 transition-all duration-1000 delay-200 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0 rotate-[-5deg]' : 'opacity-0 translate-y-20 rotate-0'
            }`}
          >
            <img
              src="/images/phone.png"
              alt="TVK Game Interface"
              className="w-full h-auto object-contain drop-shadow-2xl hover:rotate-0 transition-transform duration-500 animate-float"
            />
          </div>
        </div>

        {/* Actor Image - REMOVED as per request */}
        {/* <img
          src="/images/VijayImg3.png"
          alt="Thalapathi Vijay"
          className={`transition-all duration-1000 ease-out object-contain
            w-48 md:w-64 lg:w-[400px] xl:w-[500px] 2xl:w-[650px]
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            relative lg:absolute lg:bottom-0 lg:right-0 lg:translate-y-0
            mx-auto mb-10 lg:mx-0 z-10
          `}
        /> */}

        {/* Feature Cards */}
        <div className="relative z-20 w-full max-w-4xl lg:max-w-3xl xl:max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 lg:mt-0 lg:self-start">
          <div
            className={`group backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6 xl:p-8 flex flex-col items-center justify-center text-center gap-3 transition-all duration-700 delay-300 hover:scale-105 hover:border-yellow-500 cursor-pointer shadow-lg transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <Gamepad2 className="w-10 h-10 xl:w-14 xl:h-14 text-white group-hover:text-yellow-500 transition-colors" />
            <span className="text-white font-bold text-lg xl:text-2xl">Play the Game</span>
          </div>

          <div
            className={`group backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6 xl:p-8 flex flex-col items-center justify-center text-center gap-3 transition-all duration-700 delay-500 hover:scale-105 hover:border-yellow-500 cursor-pointer shadow-lg transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <HandCoins className="w-10 h-10 xl:w-14 xl:h-14 text-yellow-500" />
            <span className="text-white font-bold text-lg xl:text-2xl">Earn Fan Points</span>
          </div>

          <div
            className={`group backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6 xl:p-8 flex flex-col items-center justify-center text-center gap-3 transition-all duration-700 delay-700 hover:scale-105 hover:border-yellow-500 cursor-pointer shadow-lg transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <Trophy className="w-10 h-10 xl:w-14 xl:h-14 text-yellow-500" />
            <span className="text-white font-bold text-lg xl:text-2xl">Unlock Rewards</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameSection;
