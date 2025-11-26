import React from 'react';
import { Star, Gem, Zap, Award, Trophy } from 'lucide-react';

interface FeatureItem {
  icon: React.ReactNode;
  text: string;
}

const FanOfMonth: React.FC = () => {
  // Keeping the large icons as requested previously
  const iconSize = 'w-6 h-6 md:w-7 md:h-7';

  const features: FeatureItem[] = [
    { icon: <Star className={iconSize} />, text: 'Exclusive Top Fan Badge' },
    { icon: <Gem className={iconSize} />, text: 'Special Digital Collectible' },
    { icon: <Zap className={iconSize} />, text: 'Priority Shoutout' },
    { icon: <Award className={iconSize} />, text: 'Bonus Fan Points' },
  ];

  return (
    // FIX 1: Changed 'lg:overflow-visible' back to 'overflow-hidden'
    // This stops the image from bleeding into other sections
    <section className="relative w-full overflow-hidden bg-brand-dark py-12 md:py-24">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/MemOfMonthBack.png"
          alt="Background"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* --- LEFT COLUMN: Text Content (5 Columns) --- */}
          <div className="lg:col-span-5 space-y-10">
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Top Fan of <br />
              the Month
            </h2>

            <ul className="space-y-5">
              {features.map((item, index) => (
                <li key={index} className="flex items-center gap-4 text-gray-200">
                  <span className="text-white">{item.icon}</span>
                  <span className="font-medium text-lg md:text-xl">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* --- CENTER COLUMN: Overlapping Cards (4 Columns) --- */}
          <div className="lg:col-span-4 relative h-[380px] flex items-center justify-center mt-12 lg:mt-0 z-20">
            {/* Leaderboard Card (Behind) */}
            <div className="absolute bottom-0 left-0 md:left-2 w-64 md:w-72 bg-brand-dark border border-brand-gold rounded-xl p-5 shadow-xl z-10 transform translate-y-6 -translate-x-4 md:-translate-x-6">
              <h3 className="text-brand-gold text-sm font-semibold mb-4">Lead Board Preview</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className="flex items-center justify-between border-b border-gray-700 pb-2"
                  >
                    <span className="text-white font-bold text-lg">{num}.</span>
                    <Trophy className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Main Trophy Card (Front) */}
            <div className="relative bg-[#1a1a1a] border-2 border-brand-gold rounded-2xl p-6 w-72 md:w-80 h-52 md:h-56 flex flex-col items-center justify-center shadow-2xl z-20">
              <Star className="absolute top-6 left-6 text-white w-7 h-7" />
              <Gem className="absolute top-6 right-6 text-white w-7 h-7" />
              <img
                src="/images/GoldCup.png"
                alt="Gold Cup"
                className="h-36 md:h-40 object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* --- RIGHT COLUMN: Person Image (3 Columns) --- */}
          <div className="hidden lg:block lg:col-span-3 h-full relative min-h-[500px] z-0 pointer-events-none">
            {/* FIX 2 & 3: 
                - Reduced max-width to 550px
                - Positioned absolute bottom-0 right-0
                - Used translate-x to nudge him slightly right, but he gets cut off by overflow-hidden nicely
             */}
            <img
              src="/images/VijayImg2.png"
              alt="TVK Leader"
              className="absolute bottom-[-40px] right-[-20px] w-[140%] max-w-[550px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* --- Mobile-only Image Version --- */}
      <div className="lg:hidden flex justify-end mt-10 relative z-20 pointer-events-none">
        <img
          src="/images/VijayImg2.png"
          alt="TVK Leader"
          className="w-3/4 max-w-[320px] object-contain translate-x-4"
        />
      </div>
    </section>
  );
};

export default FanOfMonth;
