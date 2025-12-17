import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Timer, Heart, Coins, Trophy, RotateCcw, Zap, ArrowLeft, Home } from 'lucide-react';
import Card from '../../components/gameone/Card';
import { getMovies, TVK_MOVIES } from '../../utils/movies';
import type { CardData, CardStatus } from '../../utils/types';
import { useNavigate } from 'react-router-dom';
import { getTrophyFromScore, getTrophyIcon, getTrophyColor } from '../../utils/trophySystem';
import { gameService } from '../../services/gameService';
import { useAuth } from '../../context/AuthContext';
import { GAME_IDS } from '../../constants/games';
import { useGameAccess } from '../../hooks/useGameAccess';

// --- Gaming Loader Component ---
const GamingLoader: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-90" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        {/* Logo / Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            TVK MEMORY
          </h1>
          <p className="text-slate-400 text-sm tracking-[0.3em] uppercase mt-2 font-bold">
            System Initialization
          </p>
        </motion.div>

        {/* Progress Bar Container */}
        <div className="w-full h-4 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 backdrop-blur-sm relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {/* Animated Progress Fill */}
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-300 relative"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          >
            {/* Glare effect on bar */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/20" />
            
            {/* Moving shine effect */}
            <motion.div 
              className="absolute top-0 bottom-0 w-10 bg-white/30 skew-x-[-20deg] blur-sm"
              animate={{ x: ["-100%", "500%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Percentage & Status Text */}
        <div className="w-full flex justify-between items-center mt-3 font-mono text-xs md:text-sm text-yellow-500/80">
          <span className="animate-pulse">LOADING ASSETS...</span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};

const MAX_CARDS = 6; 
const INITIAL_TIME = 30;
const INITIAL_CHANCES = 5;
const TIME_PENALTY = 1;
const REVEAL_TIME_MS = 3000;

const SUCCESS_MESSAGES = [
  "Verithanam! (Epic Play!)",
  "Mass Nanba! (You’re cracked!)",
  "God Tier Move!",
  "Super!",
  "Clean Finish!",
  "Nice One!",
  "Smooth Combo!",
  "Theri Baby! (You’re on fire!)"
];

const ERROR_MESSAGES = [
  "Ayyayo! (Epic Fail!)",
  "Focus Mate! (Stay Locked In!)",
  "I am waiting... (Load that brain!)",
  "Missed it! Try Again!",
  "Pathu pannu! (Watch your moves!)",
  "Don't worry! (You can clutch this!)"
];

const MemoryGame: React.FC = () => {
  const [cardsData, setCardsData] = useState<CardData[]>([]);
  const [flippedCard, setFlippedCard] = useState<number>(-1);
  const [coins, setCoins] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [matches, setMatches] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [chances, setChances] = useState<number>(INITIAL_CHANCES);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  const [isRevealing, setIsRevealing] = useState<boolean>(true);
  const [shakeBoard, setShakeBoard] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  // --- Loading State ---
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // --- Feedback State ---
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSide, setFeedbackSide] = useState<'left' | 'right'>('right'); 
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();

  // --- Preload Images ---
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = TVK_MOVIES.map(m => m.image);
      // Add other critical assets if needed (e.g., feedback images)
      imageUrls.push("/img/happy.webp", "/img/sad.png", "/img/game-1.webp");

      let loadedCount = 0;
      const total = imageUrls.length;

      const updateProgress = () => {
        loadedCount++;
        const progress = (loadedCount / total) * 100;
        setLoadingProgress(progress);
        if (loadedCount === total) {
          setTimeout(() => {
            setAssetsLoaded(true);
          }, 500); // Small delay for smooth transition
        }
      };

      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
        img.onload = updateProgress;
        img.onerror = updateProgress; // Proceed even if one fails
      });
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (assetsLoaded) {
      startNewGame();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [assetsLoaded]);

  useEffect(() => {
    if (gameStarted && !gameCompleted && !gameOver && !isRevealing) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameStarted, gameCompleted, gameOver, isRevealing]);

  useEffect(() => {
    if (matches === MAX_CARDS && matches > 0) {
      setGameCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      const bonusCoins = Math.max(100 - moves * 2, 20) + timeLeft * 5;
      setCoins((prev) => prev + bonusCoins);
      triggerWinConfetti();
    }
  }, [matches, moves, timeLeft]);

  useEffect(() => {
    if (chances <= 0 && !gameCompleted) {
      setGameOver(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [chances, gameCompleted]);

  // --- Backend Integration ---
  const { refreshUser, user } = useAuth();
  const { isPremium } = useGameAccess();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [totalTrophies, setTotalTrophies] = useState<number>(0);

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

  // Update trophy count when user changes
  useEffect(() => {
    if (user?.trophies) {
      setTotalTrophies(calculateTotalTrophies(user.trophies));
    }
  }, [user?.trophies]);
  
  useEffect(() => {
    // Only submit score once when game ends with coins > 0
    if ((gameCompleted || gameOver) && participantId && coins > 0 && !scoreSubmitted) {
      const submitGameScore = async () => {
        try {
          setScoreSubmitted(true); // Prevent duplicate submissions
          await gameService.submitScore(participantId, {
            score: coins, // Using coins as score
            coins: coins,
            data: { moves: moves, timeLeft: timeLeft, matches: matches }
          });
          
          // Refresh user data from backend to get updated coins and trophies
          await refreshUser();
        } catch (error) {
          setScoreSubmitted(false); // Allow retry on error
        }
      };
      submitGameScore();
    }
  }, [gameCompleted, gameOver, coins, moves, timeLeft, matches, participantId, scoreSubmitted, refreshUser]);

  const startNewGame = async () => {
    try {
      const response = await gameService.joinGame(GAME_IDS.MEMORY);
      setParticipantId(response.participant.id);
    } catch (error) {
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const initialCards = getMovies(MAX_CARDS);
    setCardsData(initialCards.map(c => ({ ...c, status: 'flipped' as CardStatus })));
    
    setFlippedCard(-1);
    setMoves(0);
    setMatches(0);
    setGameCompleted(false);
    setTimeLeft(INITIAL_TIME);
    setChances(INITIAL_CHANCES);
    setGameOver(false);
    setCoins(0);
    setGameStarted(false);
    setIsRevealing(true);
    setShowFeedback(false);
    setScoreSubmitted(false); // Reset score submission flag for new game

    revealTimeoutRef.current = setTimeout(() => {
      setCardsData(current => current.map(c => ({ ...c, status: '' as CardStatus })));
      setIsRevealing(false);
      setGameStarted(true);
    }, REVEAL_TIME_MS);
  };

  const triggerFeedback = (type: 'success' | 'error') => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const messages = type === 'success' ? SUCCESS_MESSAGES : ERROR_MESSAGES;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
  
    const side = Math.random() > 0.5 ? 'right' : 'left';

    setFeedbackType(type);
    setFeedbackText(randomMsg);
    setFeedbackSide(side);
    setShowFeedback(true);

    feedbackTimeoutRef.current = setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  const triggerWinConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FF0000', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FF0000', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const checkForMatch = (currentCardId: number) => {
    setMoves((prev) => prev + 1);

    if (flippedCard === -1) return;

    const cardA = cardsData[currentCardId];
    const cardB = cardsData[flippedCard];

    if (cardA.name === cardB.name) {
      const newCards = [...cardsData];
      newCards[currentCardId] = { ...newCards[currentCardId], status: 'match' };
      newCards[flippedCard] = { ...newCards[flippedCard], status: 'match' };
      setCardsData(newCards);
      setMatches((prev) => prev + 1);
      setCoins((prev) => prev + 10);
      
      triggerFeedback('success');

    } else {
      const newCards = [...cardsData];
      newCards[currentCardId] = { ...newCards[currentCardId], status: 'mismatch' };
      newCards[flippedCard] = { ...newCards[flippedCard], status: 'mismatch' };
      setCardsData(newCards);
      
      setShakeBoard(true);
      setTimeout(() => setShakeBoard(false), 500);

      setTimeLeft((prev) => Math.max(0, prev - TIME_PENALTY));
      setChances((prev) => prev - 1);
      
      triggerFeedback('error');

      setTimeout(() => {
        const reverted = [...newCards];
        if (reverted[currentCardId].status === 'mismatch') reverted[currentCardId].status = '';
        if (reverted[flippedCard].status === 'mismatch') reverted[flippedCard].status = '';
        setCardsData(reverted);
      }, 1000);
    }

    setFlippedCard(-1);
  };

  const onCardFlip = (id: number) => {
    if (gameOver || gameCompleted || isRevealing) return;
    if (cardsData[id].status !== '') return;

    if (!gameStarted) setGameStarted(true);

    if (flippedCard === -1) {
      const newCards = [...cardsData];
      newCards[id] = { ...newCards[id], status: 'flipped' };
      setCardsData(newCards);
      setFlippedCard(id);
    } else {
      if (id !== flippedCard) checkForMatch(id);
    }
  };

  const handleCollectCoins = () => {
    if (isCollecting) return;
    setIsCollecting(true);
    
  
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFD700', '#FFA500'],
        shapes: ['circle'],
        scalar: 1.5,
        drift: 0,
        gravity: 1.2
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFD700', '#FFA500'],
        shapes: ['circle'],
        scalar: 1.5,
        drift: 0,
        gravity: 1.2
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    
    setCoins(prev => prev + 15);

  
    setTimeout(() => {
      setIsCollecting(false);
      navigate('/game/memory-challenge');
    }, 1500);
  };

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <div className="min-h-screen text-white p-4 pb-24 font-sans overflow-x-hidden relative flex flex-col items-center">
      {/* --- Gaming Loader Overlay --- */}
      <AnimatePresence>
        {!assetsLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999]"
          >
            <GamingLoader progress={loadingProgress} />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/img/game-1.webp")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-black/95" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 z-0">
         <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full blur-[100px] mix-blend-screen" />
         <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-red-600 rounded-full blur-[100px] mix-blend-screen" />
      </div>


      <AnimatePresence>
        {showFeedback && !gameCompleted && !gameOver && (
          <motion.div
            initial={{ x: feedbackSide === 'right' ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: feedbackSide === 'right' ? 300 : -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`fixed bottom-0 z-[60] flex items-end pointer-events-none ${
               feedbackSide === 'right' ? 'right-0 md:right-10' : 'left-0 md:left-10'
            }`}
          >
           
            <div className={`flex items-end ${feedbackSide === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar Image */}
                <img 
                  src={feedbackType === 'success' ? "/img/happy.webp" : "/img/sad.png"} 
                  alt="Vijay Reaction" 
                  className={`w-40 sm:w-56 md:w-80 h-auto drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] filter brightness-110 relative z-10 ${
                     
                      feedbackSide === 'left' ? 'scale-x-[-1]' : ''
                  }`}
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/200x300/1a1a1a/white?text=Vijay+Img";
                  }}
                />

                {/* Speech Bubble Container */}
                <div className={`mb-20 sm:mb-28 md:mb-40 z-20 ${feedbackSide === 'right' ? 'mr-[-20px] md:mr-[-40px]' : 'ml-[-20px] md:ml-[-40px]'}`}>
                   <motion.div
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className={`relative px-4 py-2 md:px-6 md:py-3 rounded-2xl border-2 shadow-xl ${
                       feedbackType === 'success' 
                         ? 'bg-yellow-400 border-yellow-200 text-black' 
                         : 'bg-red-600 border-red-400 text-white'
                     }`}
                   >
                      <p className="font-black uppercase italic text-sm sm:text-base md:text-xl whitespace-nowrap">
                        "{feedbackText}"
                      </p>
                      
                      
                      <div className={`absolute bottom-[-8px] w-4 h-4 transform border-r-2 border-b-2 ${
                         feedbackType === 'success' ? 'bg-yellow-400 border-yellow-200' : 'bg-red-600 border-red-400'
                      } ${
                          feedbackSide === 'right' 
                            ? 'right-6 rotate-45'
                            : 'left-6 rotate-[135deg]' 
                      }`}></div>
                   </motion.div>
                </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 md:px-4 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <ArrowLeft size={20} />
          <span className="hidden md:inline font-bold uppercase text-xs tracking-wider">Back</span>
        </motion.button>
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto flex flex-col items-center mt-12 md:mt-0">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-4" 
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-md tracking-tight">
            THALAPATHY VJ
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm md:text-lg font-medium tracking-widest uppercase">
            Memory Challenge <span className="text-yellow-500">Edition</span>
          </p>
        </motion.div>


        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 bg-black/40 backdrop-blur-md border border-white/10 p-3 md:p-4 rounded-2xl shadow-xl"
        >

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 relative overflow-hidden">
             {isRevealing && (
                 <div className="absolute inset-0 bg-yellow-500 flex items-center justify-center z-10">
                     <span className="text-black font-bold uppercase text-[10px] animate-pulse">Memorize!</span>
                 </div>
             )}
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Timer size={14} className="md:w-4 md:h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Time</span>
            </div>
            <span className={`text-lg md:text-xl font-mono font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <Heart size={14} className="md:w-4 md:h-4" fill={chances <= 2 ? "currentColor" : "none"} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Life</span>
            </div>
            <div className="flex gap-1">
               {Array.from({length: INITIAL_CHANCES}).map((_, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < chances ? 'bg-red-500' : 'bg-slate-700'}`} />
               ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Zap size={14} className="md:w-4 md:h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Moves</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-white">{moves}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-yellow-900/60 to-amber-900/60 border border-yellow-700/30">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Coins size={14} className="md:w-4 md:h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Score</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-yellow-200">{coins}</span>
          </div>
        </motion.div>

        <motion.div 
          animate={shakeBoard ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }} 
          className="relative w-full"
        >
          <AnimatePresence>
            {isRevealing && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.5 }}
                 className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
               >
                 <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,1)] stroke-black uppercase tracking-tighter">
                    Memorize!
                 </h2>
               </motion.div>
            )}
          </AnimatePresence>

          <div className={`grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mx-auto perspective-1000 ${isRevealing ? 'opacity-80' : 'opacity-100'} transition-opacity`}>
            {cardsData?.map((cardData, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="aspect-[3/4] w-full"
              >
                <Card
                  id={index}
                  cardData={cardData}
                  onCardFlip={onCardFlip}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startNewGame}
          className="mt-8 group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-red-600 text-lg rounded-full hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] focus:outline-none ring-offset-2 focus:ring-2 ring-red-400"
        >
          <RotateCcw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
          {gameCompleted || gameOver ? "Play Again" : "Reset Game"}
        </motion.button> */}
      </div>

      <AnimatePresence>
        {(gameCompleted || gameOver) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url("${gameCompleted ? '/img/game-won.webp' : '/img/game-over.webp'}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${gameCompleted ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-red-600'}`} />

              <div className="flex justify-center mb-6">
                {gameCompleted ? (
                   <div className="p-4 rounded-full bg-yellow-500/20 text-yellow-400 ring-4 ring-yellow-500/20">
                     <Trophy size={48} />
                   </div>
                ) : (
                   <div className="p-4 rounded-full bg-red-500/20 text-red-400 ring-4 ring-red-500/20">
                     <Timer size={48} />
                   </div>
                )}
              </div>
              
              <h2 className="text-3xl font-black uppercase mb-2">
                {gameCompleted ? "Mission Accomplished!" : "Mission Failed"}
              </h2>
              
              <p className="text-slate-400 mb-8">
                {gameCompleted 
                  ? `Spectacular! You cleared the board in ${moves} moves with ${timeLeft}s to spare.` 
                  : "Don't give up nanba! Focus and try again."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 bg-black/20 p-4 rounded-xl">
                 <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold">Total Score</div>
                    <div className="text-xl font-bold text-white">{coins}</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold">Accuracy</div>
                    <div className="text-xl font-bold text-white">
                        {Math.round((matches / (moves || 1)) * 100)}%
                    </div>
                 </div>
                 <div className="text-center col-span-2 mt-2 border-t border-slate-700 pt-2">
                    <div className="text-xs text-slate-500 uppercase font-bold">Total Trophies</div>
                    <div className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {totalTrophies}
                    </div>
                 </div>
              </div>

              {/* Trophy Section */}
              <div className="mb-8">
                {(() => {
                  const trophy = getTrophyFromScore('memory', coins);
                  if (trophy !== 'NONE') {
                    return (
                      <div className="flex flex-col items-center animate-bounce-slow">
                        <span className="text-6xl mb-2 filter drop-shadow-lg">{getTrophyIcon(trophy)}</span>
                        <span className="text-xl font-bold" style={{ color: getTrophyColor(trophy) }}>
                          {trophy} TROPHY
                        </span>
                        <p className="text-xs text-gray-400 mt-1">New Achievement Unlocked!</p>
                      </div>
                    );
                  }
                  return <p className="text-gray-500 text-sm">Keep playing to earn trophies!</p>;
                })()}
              </div>
              
              {/* 
                TODO: Send score and trophy to backend
                POST /api/scores
                Body: { game: 'memory', score: coins, trophy: getTrophyFromScore('memory', coins) }
              */}

              <div className={`grid ${(!gameCompleted && !isPremium) ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="w-full py-4 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider transition-colors bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2"
                >
                  <Home size={18} />
                  Home
                </motion.button>
                
                {gameCompleted ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCollectCoins}
                    disabled={isCollecting}
                    className="w-full py-4 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black"
                  >
                    {isCollecting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Coins size={18} />
                      </motion.div>
                    ) : (
                      <Coins size={18} />
                    )}
                    {isCollecting ? "Collecting..." : "Collect Coins"}
                  </motion.button>
                ) : isPremium ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startNewGame}
                    className="w-full py-4 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white"
                  >
                    <RotateCcw size={18} />
                    Retry
                  </motion.button>
                ) : null}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryGame;