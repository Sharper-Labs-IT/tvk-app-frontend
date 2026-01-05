import React, { useState, useEffect } from "react";
import {
  Clapperboard,
  Film,
  Trophy,
  ChevronLeft,
  X,
  PlayCircle,
  Star,
  Coins,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurText from "../../components/BlurText";
import TextType from "../../components/TextType";
import { useGameAccess } from '../../hooks/useGameAccess';
import GameAccessModal from '../../components/common/GameAccessModal';
import { useAuth } from '../../context/AuthContext';

const JigsawPuzzleStart: React.FC = () => {
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
    setShowModal(false);
    const { allowed, reason, cost } = checkAccess();
    if (allowed) {
      consumePlay(false);
      navigate('/game/jigsaw-puzzle/start');
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
          navigate('/game/jigsaw-puzzle/start');
      } else {
          alert("Not enough coins!");
      }
  }

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{
        // REPLACE THIS URL with a high-res image of Vijay (e.g., Leo or GOAT poster art)
        backgroundImage: "url('/img/jigsaw-hero.webp')",
      }}
    >
      <GameAccessModal 
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onPay={handlePayToPlay}
        cost={accessCost}
        userCoins={userCoins}
      />
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
      {/* Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80" />

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* HEADER */}
        <header className="flex justify-between items-center px-6 py-6 md:px-12">
          <div
            onClick={() => navigate("/game")}
            className="group flex items-center gap-3 cursor-pointer"
          >
            <div className="bg-white/10 group-hover:bg-red-600 backdrop-blur-md p-2 rounded-lg border border-white/20 transition-all duration-300">
              <ChevronLeft className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold tracking-widest uppercase hidden md:block group-hover:text-red-500 transition-colors">
              Main Menu
            </span>
          </div>

          <nav className="flex items-center gap-4 md:gap-6">
            {/* Trophy Display */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-amber-500/30 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-amber-100 font-bold text-lg tracking-wider">
                {isLoadingStats ? '...' : totalTrophies.toLocaleString()}
              </span>
            </div>

            {/* Coins Display */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-yellow-500/30 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-100 font-bold text-lg tracking-wider">
                {isLoadingStats ? '...' : userCoins.toLocaleString()}
              </span>
            </div>

            {/* User Profile */}
            <button className="hidden md:flex items-center gap-3 pl-1 pr-4 py-1 bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/10 rounded-full hover:border-amber-500/50 transition-all">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {(user?.nickname || 'usernull').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-zinc-300">
                {user?.nickname || 'usernull'}
              </span>
            </button>
          </nav>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative mt-[-40px]">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 px-6 py-2 rounded-none skew-x-[-12deg] bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-fade-in border-l-4 border-amber-400">
            <span className="skew-x-[12deg] flex items-center gap-2 text-white font-black tracking-widest text-xs md:text-sm uppercase">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              VJ Special Edition
            </span>
          </div>

          {/* Title Area */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 drop-shadow-2xl">
            <BlurText
              text="THE MASTER"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
            />
          </h1>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 uppercase">
             PUZZLE
          </h2>

          {/* Typing Animation */}
          <div className="h-12 mb-10">
            <TextType
              text={[
                "Assemble the iconic First Look...",
                "Unlock the Leo chronicles...",
                "Piece together the G.O.A.T...",
              ]}
              typingSpeed={40}
              className="text-lg md:text-2xl text-zinc-400 font-medium tracking-wide uppercase"
              pauseDuration={2000}
              deletingSpeed={20}
              cursorCharacter="_"
            />
          </div>

          {/* Start Button */}
          <button
            onClick={() => setShowModal(true)}
            className="group relative px-10 py-5 bg-white text-black font-black text-xl md:text-2xl tracking-widest uppercase skew-x-[-12deg] hover:bg-amber-400 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <div className="skew-x-[12deg] flex items-center gap-3">
              <PlayCircle className="w-6 h-6 md:w-8 md:h-8 fill-black" />
              Start Mission
            </div>
            {/* Button Decor */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-black skew-x-[12deg] translate-x-2 -translate-y-2 group-hover:bg-red-600 transition-colors" />
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-black skew-x-[12deg] -translate-x-2 translate-y-2 group-hover:bg-red-600 transition-colors" />
          </button>
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

        {/* FOOTER */}
        <footer className="w-full px-8 py-6 border-t border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-600 text-xs uppercase tracking-widest">
              © 2025 TVK Gaming Universe. Created for fans.
            </p>
            
          </div>
        </footer>
      </div>

      {/* GAME INSTRUCTIONS MODAL - Cinematic Style */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg p-0 shadow-2xl overflow-hidden">
             {/* Decorative Top Bar */}
             <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                    Mission Briefing
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">Ready to create history?</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex gap-5 items-center group">
                  <div className="w-12 h-12 bg-zinc-800 group-hover:bg-amber-500/10 border border-zinc-700 group-hover:border-amber-500/50 flex items-center justify-center shrink-0 transition-colors">
                    <Clapperboard className="w-6 h-6 text-zinc-400 group-hover:text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-wide text-sm">
                      Recreate the Poster
                    </h4>
                    <p className="text-zinc-500 text-sm mt-1">
                      Drag pieces to reveal the exclusive Thalapathy look.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 items-center group">
                  <div className="w-12 h-12 bg-zinc-800 group-hover:bg-red-500/10 border border-zinc-700 group-hover:border-red-500/50 flex items-center justify-center shrink-0 transition-colors">
                    <Film className="w-6 h-6 text-zinc-400 group-hover:text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-wide text-sm">
                      Beat the Box Office
                    </h4>
                    <p className="text-zinc-500 text-sm mt-1">
                      Finish before the timer hits zero to smash records.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 items-center group">
                  <div className="w-12 h-12 bg-zinc-800 group-hover:bg-blue-500/10 border border-zinc-700 group-hover:border-blue-500/50 flex items-center justify-center shrink-0 transition-colors">
                    <Trophy className="w-6 h-6 text-zinc-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-wide text-sm">
                      Blockbuster Rewards
                    </h4>
                    <p className="text-zinc-500 text-sm mt-1">
                      Earn coins to unlock legendary movie themes.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlayClick}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
              >
                Action!
              </button>
            </div>
            
            {/* Decorative Bottom Bar */}
            {/* <div className="h-2 w-full bg-zinc-950 flex gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="h-full w-full bg-zinc-800/50" />
                ))}
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default JigsawPuzzleStart;