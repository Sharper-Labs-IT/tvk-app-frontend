import React, { useState, useEffect } from 'react';
import { Gamepad2, Triangle, X, Target, Shield, Coins, Hammer, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextType from '../../components/TextType';
import TrueFocus from '../../components/TrueFocus';
import { useGameAccess } from '../../hooks/useGameAccess';
import GameAccessModal from '../../components/common/GameAccessModal';
import { useAuth } from '../../context/AuthContext';

const WhackAMoleStart: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { checkAccess, consumePlay, remainingFreePlays, isPremium } = useGameAccess();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessCost, setAccessCost] = useState(0);
  const { user, refreshUser } = useAuth();
  const userCoins = user?.coins || 0;
  const [totalTrophies, setTotalTrophies] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Calculate total trophies from user object
  const calculateTotalTrophies = (userTrophies: any): number => {
    if (!userTrophies) return 0;
    if (typeof userTrophies === 'object' && !Array.isArray(userTrophies)) {
      let total = 0;
      if (userTrophies.BRONZE) total += userTrophies.BRONZE.length;
      if (userTrophies.SILVER) total += userTrophies.SILVER.length;
      if (userTrophies.GOLD) total += userTrophies.GOLD.length;
      if (userTrophies.PLATINUM) total += userTrophies.PLATINUM.length;
      return total;
    }
    if (Array.isArray(userTrophies)) return userTrophies.length;
    return 0;
  };

  // Fetch user stats on mount and when returning from game
  const fetchUserStats = async () => {
    if (!user) return;
    setIsLoadingStats(true);
    try {
      await refreshUser();
    } catch (error) {
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Update trophy count when user changes
  useEffect(() => {
    if (user?.trophies) {
      setTotalTrophies(calculateTotalTrophies(user.trophies));
    }
  }, [user?.trophies]);

  // Fetch on mount
  useEffect(() => {
    fetchUserStats();
  }, [user?.id]);

  // Refetch when page becomes visible (user returns from game)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserStats();
      }
    };

    const handleFocus = () => {
      fetchUserStats();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  const handlePlayClick = () => {
    const { allowed, reason, cost } = checkAccess();
    if (allowed) {
      consumePlay(false);
      navigate('/game/villain-hunt/start');
    } else {
      if (reason === 'limit_reached' || reason === 'no_coins') {
        setAccessCost(cost);
        setShowAccessModal(true);
      } else if (reason === 'not_logged_in') {
          navigate('/login');
      }
    }
  };

  const handlePayToPlay = async () => {
      const success = await consumePlay(true);
      if (success) {
          setShowAccessModal(false);
          navigate('/game/villain-hunt/start');
      } else {
          alert("Not enough coins!");
      }
  }

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-x-hidden font-sans flex flex-col"
      style={{
        backgroundImage: "url('/img/bg-game3.webp')", 
      }}
    >
      <GameAccessModal 
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onPay={handlePayToPlay}
        cost={accessCost}
        userCoins={userCoins}
      />
      <div className="absolute inset-0 bg-slate-900/70 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* Header - Made responsive with flex-col on mobile */}
        <header className="flex flex-col md:flex-row justify-between items-center px-4 py-4 md:px-12 gap-4 w-full">
          <div className="w-full md:w-auto flex justify-start">
            <div
              onClick={() => navigate('/game')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="bg-white text-black p-1 rounded-full">
                <Triangle className="w-5 h-5 fill-current -rotate-90" />
              </div>
              {/* Back text hidden on mobile */}
              <span className="text-lg font-bold tracking-wide hidden md:inline">Back</span>
            </div>
          </div>

          {/* Navigation/Stats - Visible on all devices now */}
          <nav className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-xs md:text-sm font-medium w-full md:w-auto">
            {/* Trophies Display */}
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
              <span className="text-white font-semibold">
                {isLoadingStats ? '...' : totalTrophies.toLocaleString()}
              </span>
            </div>

            {/* Coins Display */}
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
              <span className="text-yellow-400 font-bold text-base md:text-lg">🪙</span>
              <span className="text-white font-semibold">
                {isLoadingStats ? '...' : userCoins.toLocaleString()}
              </span>
            </div>
            
            {/* User Profile */}
            <button className="flex items-center gap-2 hover:bg-white/10 transition-all px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-transparent hover:border-white/10">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">
                {(user?.nickname || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-white truncate max-w-[80px] md:max-w-none">{user?.nickname || 'User'}</span>
            </button>
          </nav>
        </header>

        {/* Main Content - Adjust margin to prevent overlap on mobile */}
        <main className="flex-grow flex flex-col justify-center items-center text-center px-4 mt-4 md:mt-[-60px]">
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
            className="text-gray-300 text-lg md:text-2xl max-w-3xl mb-10 font-light tracking-wide mt-4"
          />

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0">
            <button
              onClick={handlePlayClick}
              className="cursor-pointer w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.5)] transform hover:scale-105 text-lg md:text-xl border-2 border-white/20 uppercase tracking-wider"
            >
              Start Hunt
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 text-lg md:text-xl uppercase tracking-wider"
            >
              Briefing
            </button>
          </div>
          {!isPremium && (
            <p className="mt-4 text-gray-400 text-sm">
              Free Plays Remaining: <span className="text-yellow-400 font-bold">{remainingFreePlays}</span>
            </p>
          )}
          {isPremium && (
            <p className="mt-4 text-green-400 text-sm flex items-center justify-center gap-2">
              <span>⭐</span> You're a Super Fan of VJ! Enjoy unlimited access.
            </p>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm mt-auto bg-slate-900/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
          <div className="text-center md:text-left">© 2025 TVK. All rights reserved.</div>
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

          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 md:p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 shrink-0">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic">
                  Mission Briefing
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-6 text-gray-300 overflow-y-auto pr-2 custom-scrollbar flex-grow">
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
                className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white py-3 md:py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all shadow-lg shrink-0"
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