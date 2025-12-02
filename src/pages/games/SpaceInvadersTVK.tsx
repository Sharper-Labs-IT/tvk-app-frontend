import React, { useState } from 'react';
import { Gamepad2, Youtube, MessageSquare, Smartphone, Triangle, X } from 'lucide-react';
import TargetCursor from '../../components/TargetCursor';
import { useNavigate } from 'react-router-dom';
import TextType from '../../components/TextType';
import TrueFocus from '../../components/TrueFocus';
import Shuffle from '../../components/Shufflle';

const SpaceInvadersTVK: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{
        backgroundImage: "url('/img/space.webp')",
      }}
    >
      <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

      <div className="relative z-10 flex flex-col min-h-screen text-white">
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
              <span className="text-white font-semibold">1,250</span>
            </div>

            <button className="flex items-center gap-2 hover:bg-white/10 transition-all px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
              <span className="text-white">Profile</span>
            </button>

            <button className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
              <span>🐛</span>
              <span>Report Bug</span>
            </button>
          </nav>
        </header>

        <main className="flex-grow flex flex-col justify-center items-center text-center px-4 mt-[-60px]">
          <Shuffle
            text="VJ Galaxy Strike"
            shuffleDirection="right"
            duration={0.35}
            animationMode="evenodd"
            shuffleTimes={1}
            ease="power3.out"
            stagger={0.03}
            threshold={0.1}
            triggerOnce={true}
            triggerOnHover={true}
            respectReducedMotion={true}
            className="text-4xl md:text-6xl font-extrabold mb-6"
          />

          <TextType
            text={[
              'Defend.',
              'Shoot.',
              'Survive.',
              ' Protect the galaxy from the alien invasion in this classic arcade shooter.',
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-gray-300 text-xl md:text-2xl max-w-3xl mb-10 font-light tracking-wide"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            
            <button
              onClick={() => navigate('/game/protect-area/start')}
              className="cursor-target bg-brand-gold hover:bg-brand-goldDark text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5 text-xl md:text-2xl"
            >
              Play Now
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="cursor-target bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-0.5 text-xl md:text-2xl"
            >
              How to Play
            </button>
          </div>
        </main>

        {/* <div className="mt-12 relative">
            <div className=" border-purple-400/50 rounded-2xl px-8 py-4 shadow-2xl shadow-purple-900/50 animate-pulse">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">⚔️</span>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Multiplayer Mode
                  </div>
                  <div className="text-sm md:text-base text-purple-200 font-medium">
                    Coming Soon
                  </div>
                </div>
                <span className="text-3xl">⚔️</span>
              </div>
            </div>
 
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-2xl -z-10" />
          </div> */}

        <footer className="px-8 py-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <div>© 2025 TVK. All rights reserved.</div>

          <div className="flex items-center gap-6">
            <button className="hover:text-white transition-colors">
              <Smartphone className="w-5 h-5" />
            </button>
            <button className="hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="hover:text-white transition-colors">
              <Youtube className="w-6 h-6" />
            </button>
            <button className="hover:text-white transition-colors">
              <Gamepad2 className="w-6 h-6" />
            </button>
          </div>
        </footer>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">How to Play</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-gray-200">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Objective
                </h3>
                <p className="leading-relaxed">
                  Destroy all waves of aliens before they reach your ship or destroy your defenses!
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                  <span className="text-2xl">🎮</span> Game Rules
                </h3>
                <ol className="space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Use arrow keys to move your ship left and right</li>
                  <li>Press Spacebar to shoot missiles</li>
                  <li>Avoid enemy projectiles</li>
                  <li>Don't let the aliens reach the bottom of the screen</li>
                  <li>Clear all enemies to advance to the next level</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                  <span className="text-2xl">⚡</span> Scoring System
                </h3>
                <ul className="space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>
                      <strong>Alien Kill:</strong> Points vary by alien type
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>
                      <strong>UFO Bonus:</strong> Hit the mystery ship for extra points
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>
                      <strong>Level Clear:</strong> Bonus points for clearing waves quickly
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                  <span className="text-2xl">💡</span> Pro Tips
                </h3>
                <ul className="space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">★</span>
                    <span>Keep moving to avoid being an easy target</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">★</span>
                    <span>Use your shields wisely</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">★</span>
                    <span>Prioritize the fastest moving aliens</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg p-4">
                <p className="text-center text-white font-semibold">
                  🏆 Defend the galaxy and become the ultimate space hero!
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              >
                Got it! Let's Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceInvadersTVK;
