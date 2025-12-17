import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Youtube,
  MessageSquare,
  Smartphone,
  Triangle,
  X,
  Trophy,
} from "lucide-react";
import TargetCursor from "../../components/TargetCursor";
import { useNavigate } from "react-router-dom";
import BlurText from "../../components/BlurText";
import TextType from "../../components/TextType";
import { useGameAccess } from '../../hooks/useGameAccess';
import GameAccessModal from '../../components/common/GameAccessModal';
import { useAuth } from '../../context/AuthContext';

const GameLandingPage: React.FC = () => {
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
    
    // If trophies is an object with tier arrays (from /v1/auth/me)
    if (typeof userTrophies === 'object' && !Array.isArray(userTrophies)) {
      let total = 0;
      if (userTrophies.BRONZE) total += userTrophies.BRONZE.length;
      if (userTrophies.SILVER) total += userTrophies.SILVER.length;
      if (userTrophies.GOLD) total += userTrophies.GOLD.length;
      if (userTrophies.PLATINUM) total += userTrophies.PLATINUM.length;
      return total;
    }
    
    // If trophies is an array (from /v1/games/my/trophies)
    if (Array.isArray(userTrophies)) {
      return userTrophies.length;
    }
    
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
      navigate('/game/memory-challenge/start');
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
          navigate('/game/memory-challenge/start');
      } else {
          alert("Not enough coins!");
      }
  }

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{
        backgroundImage: "url('/img/hero.webp')",
      }}
    >
      <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

      <GameAccessModal 
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onPay={handlePayToPlay}
        cost={accessCost}
        userCoins={userCoins}
      />

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        <header className="flex justify-between items-center px-8 py-6 md:px-12">
          <div
            onClick={() => navigate("/game")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="bg-white text-black p-1 rounded-full">
              <Triangle className="w-5 h-5 fill-current -rotate-90" />
            </div>
            <span className="text-lg font-bold tracking-wide">Back</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {/* Trophies Display */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-white font-semibold">
                {isLoadingStats ? '...' : totalTrophies.toLocaleString()}
              </span>
            </div>

            {/* Coins Display */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full">
              <span className="text-yellow-400 font-bold text-lg">🪙</span>
              <span className="text-white font-semibold">
                {isLoadingStats ? '...' : userCoins.toLocaleString()}
              </span>
            </div>
            
            <button className="flex items-center gap-2 hover:bg-white/10 transition-all px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {(user?.nickname || 'usernull').charAt(0).toUpperCase()}
              </div>
              <span className="text-white">{user?.nickname || 'usernull'}</span>
            </button>
            
            <button className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
              <span>🐛</span>
              <span>Report Bug</span>
            </button>
          </nav>
        </header>

        <main className="flex-grow flex flex-col justify-center items-center text-center px-4 mt-[-60px]">
          <BlurText
            text="Memory Match Showdown"
            delay={150}
            animateBy="words"
            direction="top"
            className="text-5xl md:text-7xl font-bold tracking-tight mb-4 drop-shadow-2xl"
          />

          <TextType
            text={[
              "Flip.",
              "Match.",
              "Win.",
              " Outsmart the clock and climb the leaderboard in this fast-paced fan challenge",
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 font-light tracking-wide"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <TargetCursor
              spinDuration={2}
              hideDefaultCursor={true}
              parallaxOn={true}
            />
            <button onClick={handlePlayClick} className="cursor-target bg-brand-gold hover:bg-brand-goldDark text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5">
              Play Now
            </button>

            <button onClick={() => setShowModal(true)} className="cursor-target bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-0.5">
              How to Play
            </button>
          </div>
          {!isPremium && (
            <p className="mt-4 text-gray-400 text-sm">
              Free Plays Remaining: <span className="text-yellow-400 font-bold">{remainingFreePlays}</span>
            </p>
          )}
          {isPremium && (
            <p className="mt-4 text-green-400 text-sm flex items-center gap-2">
              <span>⭐</span> You're a Super Fan of VJ! Enjoy unlimited access to all games.
            </p>
          )}
        </main>

   
          <div className="mt-12 relative">
            <div className=" border-purple-400/50 rounded-2xl px-8 py-4 shadow-2xl shadow-purple-900/50 animate-pulse">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">⚔️</span>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Multiplayer 1v1 Mode
                  </div>
                  <div className="text-sm md:text-base text-purple-200 font-medium">
                    Coming Soon
                  </div>
                </div>
                <span className="text-3xl">⚔️</span>
              </div>
            </div>
 
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-2xl -z-10" />
          </div>


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
                  Match all pairs of cards in the shortest time possible to earn maximum points and climb the leaderboard!
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                  <span className="text-2xl">🎮</span> Game Rules
                </h3>
                <ol className="space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Click on any card to flip it and reveal the image</li>
                  <li>Click on a second card to try and find a match</li>
                  <li>If the cards match, they stay flipped. If not, they flip back</li>
                  <li>Continue until all pairs are matched</li>
                  <li>Complete the game before time runs out!</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                  <span className="text-2xl">⚡</span> Scoring System
                </h3>
                <ul className="space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span><strong>Speed Bonus:</strong> Faster completion = higher score</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span><strong>Accuracy Bonus:</strong> Fewer mistakes = more points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span><strong>Perfect Match:</strong> Match on first try for bonus coins</span>
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
                    <span>Remember card positions after they flip back</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">★</span>
                    <span>Start from corners and work systematically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">★</span>
                    <span>Focus on speed after learning card locations</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg p-4">
                <p className="text-center text-white font-semibold">
                  🏆 Beat your high score and compete with players worldwide!
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

export default GameLandingPage;
