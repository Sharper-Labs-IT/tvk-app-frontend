import React, { useState } from 'react';
import { Gamepad2, Triangle, X, Target, Shield, Coins, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextType from '../../components/TextType';
import TrueFocus from '../../components/TrueFocus';

const WhackAMoleStart: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{
        backgroundImage: "url('/img/bg-game3.webp')", // Reusing existing background
      }}
    >
      <div className="absolute inset-0 bg-slate-900/70 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-6 md:px-12">
          <div
            onClick={() => navigate('/game')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="bg-white text-black p-1 rounded-full">
              <Triangle className="w-5 h-5 fill-current -rotate-90" />
            </div>
            <span className="text-lg font-bold tracking-wide">Back</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full">
              <span className="text-yellow-400 font-bold text-lg">🪙</span>
              <span className="text-white font-semibold">850</span>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col justify-center items-center text-center px-4 mt-[-60px]">
          <div className="mb-4 p-4 bg-red-600/20 rounded-full border border-red-500/50 backdrop-blur-sm animate-pulse">
            <Target className="w-12 h-12 text-red-500" />
          </div>

          <TrueFocus
            sentence="Villain Hunt"
            manualMode={false}
            blurAmount={5}
            borderColor="red"
            animationDuration={2}
            pauseBetweenAnimations={1}
          />

          <TextType
            text={[
              'They are hiding...',
              'They are plotting...',
              'Find them.',
              'Clean up the system. One villain at a time.',
            ]}
            typingSpeed={50}
            pauseDuration={1000}
            showCursor={true}
            cursorCharacter="|"
            className="text-gray-300 text-xl md:text-2xl max-w-3xl mb-10 font-light tracking-wide mt-4"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/game/villain-hunt/start')}
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.5)] transform hover:scale-105 text-lg md:text-xl border-2 border-white/20 uppercase tracking-wider"
            >
              Start Hunt
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 text-lg md:text-xl uppercase tracking-wider"
            >
              Briefing
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <div>© 2025 TVK. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Gamepad2 className="w-6 h-6 hover:text-white transition-colors cursor-pointer" />
          </div>
        </footer>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-black text-white uppercase italic">
                  Mission Briefing
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-6 text-gray-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex gap-4 items-start">
                  <div className="bg-red-500/20 p-3 rounded-xl shrink-0">
                    <Target className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">The Objective</h3>
                    <p className="text-sm">
                      Villains are popping up! Tap them fast. Watch for the <span className="text-yellow-400 font-bold">GLOW</span>: Gold is good, Red is a Trap!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-purple-500/20 p-3 rounded-xl shrink-0">
                    <Hammer className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Boss Battles</h3>
                    <p className="text-sm">
                      The <span className="text-purple-400 font-bold">BOSS</span> appears at higher levels! It takes <span className="text-white font-bold">5 hits</span> to defeat. Don't let it escape!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-yellow-500/20 p-3 rounded-xl shrink-0">
                    <Coins className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Coin Rush & Combos</h3>
                    <p className="text-sm">
                      Chain 10 hits to trigger <span className="text-yellow-400 font-bold">FEVER MODE</span>! The board pulses and coins spawn rapidly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-cyan-500/20 p-3 rounded-xl shrink-0">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Power-Ups</h3>
                    <p className="text-sm">
                      <span className="text-cyan-400 font-bold">Shield</span> blocks one trap. <span className="text-blue-400 font-bold">Clock</span> adds time. <span className="text-cyan-200 font-bold">Snowflake</span> freezes the timer!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  navigate('/game/villain-hunt/start');
                }}
                className="w-full mt-8 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all shadow-lg"
              >
                I'm Ready!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhackAMoleStart;
