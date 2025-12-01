import React from 'react';
import { Gamepad2, HandCoins, Trophy } from 'lucide-react';

const GameSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden py-20 px-4">
      {/* 1. Background Image */}
      {/* User Instruction: No black overlay, raw image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/images/GamebackImg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 container mx-auto flex flex-col items-center w-full h-full">
        {/* Top Area: Text and Phone Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-12 lg:gap-20 mb-16">
          {/* Left Side: Text Content */}
          <div className="text-center lg:text-left flex flex-col gap-4 max-w-xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-sans">
              Play TVK Games <br />
              <span className="text-gray-200">Earn Rewards</span>
            </h2>
            <p className="text-gray-300 text-lg md:text-xl font-medium tracking-wide">
              Unlock Points, Badges and Exclusive Fan Benefits
            </p>
          </div>

          {/* Center/Right: Phone Image (The Hero) */}
          <div className="relative w-64 md:w-80 lg:w-[400px] flex-shrink-0 animate-float">
            {/* Added a subtle drop shadow to make the phone pop off the background */}
            <img
              src="/images/phone.png"
              alt="TVK Game Interface"
              className="w-full h-auto object-contain drop-shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Bottom Area: Feature Cards */}
        {/* These float above the bottom area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4 z-20">
          {/* Card 1 */}
          <div className="group bg-black/60 backdrop-blur-md border border-brand-gold rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:bg-black/80 hover:scale-105 cursor-pointer">
            <Gamepad2 className="w-10 h-10 text-white group-hover:text-brand-gold transition-colors" />
            <span className="text-white font-bold text-lg">Play the Game</span>
          </div>

          {/* Card 2 */}
          <div className="group bg-black/60 backdrop-blur-md border border-brand-gold rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:bg-black/80 hover:scale-105 cursor-pointer">
            <HandCoins className="w-10 h-10 text-brand-gold" />
            <span className="text-white font-bold text-lg">Earn Fan Points</span>
          </div>

          {/* Card 3 */}
          <div className="group bg-black/60 backdrop-blur-md border border-brand-gold rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:bg-black/80 hover:scale-105 cursor-pointer">
            <div className="relative">
              <Trophy className="w-10 h-10 text-brand-gold" />
              {/* Adding a small lock icon purely for visual matching if needed, 
                    but Lucide trophy is clean */}
            </div>
            <span className="text-white font-bold text-lg">Unlock Rewards</span>
          </div>
        </div>
      </div>

      {/* 3. Actor Image (Bottom Right Absolute) */}
      {/* Placed outside container to stick to viewport edge */}
      <img
        src="/images/VijayImg3.png"
        alt="Thalapathi Vijay"
        className="absolute bottom-0 right-0 w-[250px] md:w-[350px] lg:w-[500px] object-contain z-10 opacity-90 hover:opacity-100 transition-opacity"
      />
    </section>
  );
};

export default GameSection;
