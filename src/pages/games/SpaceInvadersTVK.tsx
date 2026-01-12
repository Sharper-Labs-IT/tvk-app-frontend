import React, { useState, useEffect } from 'react';
import { Gamepad2, Youtube, MessageSquare, Smartphone, Triangle, X, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextType from '../../components/TextType';
import Shuffle from '../../components/Shufflle';
import { useGameAccess } from '../../hooks/useGameAccess';
import GameAccessModal from '../../components/common/GameAccessModal';
import { useAuth } from '../../context/AuthContext';

const SpaceInvadersTVK: React.FC = () => {
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
      navigate('/games/protect-area/start');
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
          navigate('/games/protect-area/start');
      } else {
          alert("Not enough coins!");
      }
  }

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-x-hidden font-sans flex flex-col"
      style={{
        backgroundImage: "url('/img/space.webp')",
      }}
    >
      <GameAccessModal 
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onPay={handlePayToPlay}
        cost={accessCost}
        userCoins={userCoins}
      />
      <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* Header - Made responsive with flex-col on mobile */}
        <header className="flex flex-col md:flex-row justify-between items-center px-4 py-4 md:px-12 gap-4 w-full">
          <div className="w-full md:w-auto flex justify-start">
            <div
              onClick={() => navigate('/games')}
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
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">
                {(user?.nickname || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-white truncate max-w-[80px] md:max-w-none">{user?.nickname || 'User'}</span>
            </button>

          </nav>
        </header>

        {/* Main Content - Adjust margin to prevent overlap on mobile */}
        <main className="flex-grow flex flex-col justify-center items-center text-center px-4 mt-4 md:mt-[-60px]">
          <Shuffle
            text="VJ's Galaxy Force"
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
            className="text-4xl md:text-6xl font-extrabold mb-6 text-yellow-400 drop-shadow-lg"
          />

          <TextType
            text={[
              'Defend.',
              'Shoot.',
              'Conquer.',
              ' Join the TVK Army and defend the galaxy from the invasion.',
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-gray-300 text-base md:text-xl max-w-3xl mb-8 md:mb-10 font-light tracking-wide"
          />

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0">
            <button
              onClick={handlePlayClick}
              className="cursor-target w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-red-900/40 transform hover:-translate-y-0.5 text-lg md:text-2xl border-2 border-yellow-400"
            >
              Start Mission
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="cursor-target w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-0.5 text-lg md:text-2xl"
            >
              Mission Briefing
            </button>
          </div>
          {!isPremium && (
            <p className="mt-4 text-gray-400 text-sm">
              Free Plays Remaining: <span className="text-yellow-400 font-bold">{remainingFreePlays}</span>
            </p>
          )}
          {isPremium && (
            <p className="mt-4 text-green-400 text-sm flex items-center justify-center gap-2">
             You're a Super Fan of VJ! Enjoy unlimited access to all games.
            </p>
          )}
        </main>

        <footer className="px-6 py-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm mt-auto bg-slate-900/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
          <div className="text-center md:text-left">© 2025 TVK. All rights reserved.</div>

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

          <div
            className="relative bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(rgba(30, 41, 59, 0.9), rgba(30, 41, 59, 0.9)), url('/img/bg-play3.webp')",
            }}
          >
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