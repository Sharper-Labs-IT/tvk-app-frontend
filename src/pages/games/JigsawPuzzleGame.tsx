import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Timer, ArrowLeft, RefreshCw, Trophy, AlertCircle, 
  Eye, Zap, CoinsIcon, Pause, Play, Lock, Volume2, VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getTrophyFromScore, getTrophyIcon, getTrophyColor, getUserTotalTrophies } from '../../utils/trophySystem';
import { gameService } from '../../services/gameService';
import { useAuth } from '../../context/AuthContext';

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
            TVK JIGSAW PUZZLE
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

// --- Utility for cleaner tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants & Types ---
interface Difficulty {
  label: string;
  gridSize: number;
  time: number;
  multiplier: number;
  baseCoins: number;
}

const DIFFICULTIES: Record<string, Difficulty> = {
  EASY: { label: 'Easy', gridSize: 3, time: 60, multiplier: 1, baseCoins: 10 },
  MEDIUM: { label: 'Medium', gridSize: 4, time: 120, multiplier: 2, baseCoins: 30 },
  HARD: { label: 'Hard', gridSize: 5, time: 180, multiplier: 3, baseCoins: 50 },
};

const PUZZLE_IMAGES = [
  '/img/game-1.webp',
  '/img/game-2.webp',
  '/img/game-3.webp',
  '/img/game-4.webp',
  '/img/hero.webp',
];

interface Piece {
  id: number;     // The correct index (where it belongs)
  currentPos: number; // Where it is currently visually
  isLocked: boolean; // Visual cue if it's in the right spot
}

// --- Sound Controller Stub ---
const playSound = (_: 'tap' | 'success' | 'win' | 'lose') => {
  // In a real app, you'd play audio files here.
  // For now, we'll just log or use browser beep if possible, 
  // but mostly this is a placeholder for the structure.
  // console.log(`Playing sound: ${type}`);
};

const JigsawPuzzleGame: React.FC = () => {
  const navigate = useNavigate();
  
  // --- Loading State ---
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // --- Game State ---
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES.EASY);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState<string>(PUZZLE_IMAGES[0]);
  
  const { user, updateUser } = useAuth();
  
  // --- Stats & Progress ---
  const [timeLeft, setTimeLeft] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(16/9);
  
  // --- Control Flags ---
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lockMode, setLockMode] = useState(false); // If true, correct pieces lock in place
  const [participantId, setParticipantId] = useState<number | null>(null);

  // --- Combo System ---
  const [combo, setCombo] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);

  // --- Refs for Timer Accuracy ---
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  // --- Preload Images ---
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = [
        ...PUZZLE_IMAGES,
        '/img/happy.webp',
        '/img/sad.png'
      ];

      let loadedCount = 0;
      const total = imageUrls.length;

      const updateProgress = () => {
        loadedCount++;
        const progress = (loadedCount / total) * 100;
        setLoadingProgress(progress);
        if (loadedCount === total) {
          setTimeout(() => {
            setAssetsLoaded(true);
          }, 500);
        }
      };

      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
        img.onload = updateProgress;
        img.onerror = updateProgress;
      });
    };

    preloadImages();
  }, []);

  // --- Load High Score on Mount ---
  useEffect(() => {
    if (!assetsLoaded) return;
    const saved = localStorage.getItem('puzzle_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, [assetsLoaded]);

  useEffect(() => {
    if (user?.coins !== undefined) {
      setTotalCoins(user.coins);
    }
  }, [user]);

  // --- Backend Integration ---
  useEffect(() => {
    if (isGameOver && participantId && earnedCoins > 0) {
      const submitGameScore = async () => {
        try {
          await gameService.submitScore(participantId, {
            score: score,
            coins: earnedCoins,
            data: { moves: moves, timeLeft: timeLeft, difficulty: difficulty.label }
          });
          // Update user coins locally (until backend API is ready)
          const currentCoins = user?.coins || 0;
          updateUser({ coins: currentCoins + earnedCoins });
        } catch (error) {
          console.error("Failed to submit score:", error);
        }
      };
      submitGameScore();
    }
  }, [isGameOver, score, earnedCoins, moves, timeLeft, difficulty, participantId]);

  // --- Initialize game ---
  useEffect(() => {
    startNewGame();
  }, [difficulty]); 

  // --- Update Aspect Ratio ---
  useEffect(() => {
    const img = new Image();
    img.src = currentImage;
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
  }, [currentImage]);

  // --- Timer Logic (Date.now() based) ---
  useEffect(() => {
    if (!gameStarted || isGameOver || isWon || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      
      if (delta >= 1) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleGameOver(false);
            return 0;
          }
          return prev - 1;
        });
        lastTickRef.current = now;
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, isGameOver, isWon, isPaused]);

  const startNewGame = async () => {
    try {
      const data = await gameService.joinGame(6);
      setParticipantId(data.participant_id);
    } catch (error) {
      console.error("Failed to join game:", error);
      return;
    }

    playSound('tap');
    const randomImage = PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)];
    setCurrentImage(randomImage);

    const totalPieces = difficulty.gridSize * difficulty.gridSize;
    const newPieces: Piece[] = Array.from({ length: totalPieces }, (_, i) => ({
      id: i,
      currentPos: i,
      isLocked: false
    }));

    // Shuffle
    const shuffled = [...newPieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i].currentPos, shuffled[j].currentPos] = [shuffled[j].currentPos, shuffled[i].currentPos];
    }
    
    shuffled.sort((a, b) => a.currentPos - b.currentPos);

    setPieces(shuffled);
    setTimeLeft(difficulty.time);
    setMoves(0);
    setScore(0);
    setEarnedCoins(0);
    setCombo(0);
    setIsGameOver(false);
    setIsWon(false);
    setGameStarted(true);
    setSelectedPiece(null);
    setIsPaused(false);
  };

  const handlePieceClick = (index: number) => {
    if (isGameOver || isWon || isPaused) return;

    const clickedPiece = pieces[index];
    if (lockMode && clickedPiece.isLocked) return; // Can't move locked pieces in lock mode

    playSound('tap');

    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else {
      if (selectedPiece === index) {
        setSelectedPiece(null); 
        return;
      }

      const targetPiece = pieces[selectedPiece];
      if (lockMode && targetPiece.isLocked) {
         setSelectedPiece(null);
         return;
      }

      // Swap Logic
      const newPieces = [...pieces];
      const piece1Index = selectedPiece;
      const piece2Index = index;

      const temp = newPieces[piece1Index];
      newPieces[piece1Index] = newPieces[piece2Index];
      newPieces[piece2Index] = temp;

      newPieces[piece1Index].currentPos = piece1Index;
      newPieces[piece2Index].currentPos = piece2Index;

      // Check for correct placement if Lock Mode is on
      if (lockMode) {
         if (newPieces[piece1Index].id === piece1Index) newPieces[piece1Index].isLocked = true;
         if (newPieces[piece2Index].id === piece2Index) newPieces[piece2Index].isLocked = true;
      }

      // Combo Logic
      const now = Date.now();
      if (now - lastMoveTime < 2000) {
        setCombo(c => c + 1);
      } else {
        setCombo(0);
      }
      setLastMoveTime(now);

      setPieces(newPieces);
      setMoves(m => m + 1);
      setSelectedPiece(null);
      checkWin(newPieces);
    }
  };

  const checkWin = (currentPieces: Piece[]) => {
    const isSolved = currentPieces.every((piece, index) => piece.id === index);
    
    if (isSolved) {
      playSound('win');
      const timeBonus = timeLeft * 10;
      const movePenalty = moves * 2;
      const comboBonus = combo * 50;
      const finalScore = Math.max(0, (1000 * difficulty.multiplier) + timeBonus - movePenalty + comboBonus);
      
      const coins = difficulty.baseCoins + Math.floor(timeLeft / 2) + (lockMode ? 0 : 10); // Bonus for no lock mode
      setEarnedCoins(coins);
      
      const newTotal = totalCoins + coins;
      setTotalCoins(newTotal);
      localStorage.setItem('tvk_coins', newTotal.toString());

      setScore(finalScore);
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('puzzle_highscore', finalScore.toString());
      }

      handleGameOver(true);
    } else {
       // Check if a piece was placed correctly for sound feedback
       // This is a bit complex to track perfectly without more state, 
       // but we can check if the *swapped* pieces landed correctly.
       playSound('success'); 
    }
  };

  const handleGameOver = (won: boolean) => {
    setIsGameOver(true);
    setIsWon(won);
    setGameStarted(false);
    if (won) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8']
      });
    } else {
      playSound('lose');
    }
  };

  const getBackgroundStyles = (id: number) => {
    const size = difficulty.gridSize;
    const row = Math.floor(id / size);
    const col = id % size;
    const percentageX = (col / (size - 1)) * 100;
    const percentageY = (row / (size - 1)) * 100;
    
    return {
      backgroundImage: `url('${currentImage}')`,
      backgroundSize: `${size * 100}% ${size * 100}%`,
      backgroundPosition: `${percentageX}% ${percentageY}%`
    };
  };

  // --- Loading Screen ---
  if (!assetsLoaded) {
    return <GamingLoader progress={loadingProgress} />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center p-4 relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- Animated Background --- */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* --- Header / HUD --- */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-4 z-20">
         <button 
            onClick={() => navigate('/game')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5 backdrop-blur-md group"
         >
            <ArrowLeft className="w-6 h-6 text-white/70 group-hover:text-white" />
         </button>

         <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl p-2 pr-6 rounded-full border border-white/10 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg">
               <CoinsIcon className="w-5 h-5 text-white drop-shadow-md" />
            </div>
            <div className="flex flex-col leading-none">
               <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Balance</span>
               <span className="text-lg font-mono font-bold text-white">{totalCoins.toLocaleString()}</span>
            </div>
         </div>

         <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5 backdrop-blur-md"
         >
            {isMuted ? <VolumeX className="w-6 h-6 text-red-400" /> : <Volume2 className="w-6 h-6 text-white/70" />}
         </button>
      </header>

      {/* --- Main Game Layout --- */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row gap-6 items-start justify-center h-full">
        
        {/* Left Column: Stats & Controls (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
           <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
              <div>
                 <div className="text-xs text-slate-400 uppercase font-bold mb-1">Time Remaining</div>
                 <div className={`text-3xl font-mono font-bold flex items-center gap-2 ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    <Timer className="w-6 h-6 opacity-50" />
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                 </div>
              </div>
              <div className="h-px bg-white/5" />
              <div>
                 <div className="text-xs text-slate-400 uppercase font-bold mb-1">Moves</div>
                 <div className="text-2xl font-mono font-bold text-white">{moves}</div>
              </div>
              <div className="h-px bg-white/5" />
              <div>
                 <div className="text-xs text-slate-400 uppercase font-bold mb-1">Score</div>
                 <div className="text-2xl font-mono font-bold text-blue-400">{score}</div>
              </div>
           </div>

           <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 uppercase font-bold mb-3">Difficulty</div>
              <div className="flex flex-col gap-2">
                {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(diff)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-bold transition-all text-left flex justify-between items-center",
                      difficulty.label === diff.label 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {diff.label}
                    {difficulty.label === diff.label && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Center: The Puzzle Board */}
        <div className="flex-1 flex flex-col items-center w-full">
          
          {/* Mobile Stats Bar */}
          <div className="lg:hidden w-full flex justify-between items-center bg-slate-800/60 backdrop-blur-md p-3 rounded-xl mb-4 border border-white/5">
             <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-400" />
                <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                   {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-bold">Moves</span>
                <span className="font-mono font-bold text-white">{moves}</span>
             </div>
          </div>

          <div 
            className="relative bg-slate-900/50 p-3 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-sm transition-all duration-500"
            style={{
              aspectRatio: aspectRatio,
              height: 'min(60vh, 600px)',
              width: 'auto',
              maxWidth: '100%',
            }}
          >
            {/* Pause Overlay */}
            <AnimatePresence>
               {isPaused && !isGameOver && (
                  <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"
                  >
                     <Pause className="w-16 h-16 text-white/20 mb-4" />
                     <h3 className="text-2xl font-bold text-white mb-6">Game Paused</h3>
                     <button 
                        onClick={() => setIsPaused(false)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-900/30"
                     >
                        Resume
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* The Grid */}
            <div 
              className="grid gap-1 w-full h-full"
              style={{
                gridTemplateColumns: `repeat(${difficulty.gridSize}, 1fr)`,
              }}
            >
              <AnimatePresence>
                {pieces.map((piece, index) => (
                  <motion.div
                    key={`${piece.id}-${isPeeking}`} 
                    layoutId={`piece-${piece.id}`}
                    onClick={() => handlePieceClick(index)}
                    initial={false}
                    animate={{ 
                      scale: selectedPiece === index ? 0.95 : 1,
                      zIndex: selectedPiece === index ? 30 : 1,
                      filter: isPeeking ? 'brightness(0.4) blur(2px)' : 'none',
                      opacity: isPaused ? 0.1 : 1
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={cn(
                      "relative cursor-pointer overflow-hidden rounded-lg shadow-sm border border-black/20 transition-shadow",
                      selectedPiece === index && "ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-50",
                      piece.isLocked && "ring-1 ring-green-500/50 z-0 grayscale-[0.2]",
                      isWon && "ring-0"
                    )}
                  >
                    {/* The Image Slice */}
                    {!isPeeking && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={getBackgroundStyles(piece.id)} 
                      />
                    )}
                    
                    {/* Locked Indicator */}
                    {piece.isLocked && (
                       <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-sm" />
                    )}

                    {/* Peek Overlay */}
                    {isPeeking && (
                       <div className="absolute inset-0 flex items-center justify-center text-white/30 font-black text-2xl bg-slate-800">
                          {piece.id + 1}
                       </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Combo Indicator */}
            <AnimatePresence>
               {combo > 1 && (
                  <motion.div 
                     initial={{ scale: 0, rotate: -10 }}
                     animate={{ scale: 1, rotate: 0 }}
                     exit={{ scale: 0 }}
                     className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl px-4 py-2 rounded-full shadow-xl border-2 border-white/20 z-50"
                  >
                     {combo}x COMBO!
                  </motion.div>
               )}
            </AnimatePresence>
          </div>

          {/* Mobile Controls Drawer */}
          <div className="w-full mt-6 grid grid-cols-4 gap-3 lg:hidden">
             <button 
                onClick={() => setIsPaused(!isPaused)}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-800/50 rounded-xl border border-white/5 active:scale-95 transition-all"
             >
                {isPaused ? <Play className="w-6 h-6 text-green-400" /> : <Pause className="w-6 h-6 text-white" />}
                <span className="text-[10px] font-bold uppercase text-slate-400">Pause</span>
             </button>

             <button 
                onMouseDown={() => setIsPeeking(true)}
                onMouseUp={() => setIsPeeking(false)}
                onTouchStart={() => setIsPeeking(true)}
                onTouchEnd={() => setIsPeeking(false)}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-800/50 rounded-xl border border-white/5 active:scale-95 transition-all"
             >
                <Eye className="w-6 h-6 text-blue-400" />
                <span className="text-[10px] font-bold uppercase text-slate-400">Peek</span>
             </button>

             <button 
                onClick={() => setLockMode(!lockMode)}
                className={cn(
                   "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-white/5 active:scale-95 transition-all",
                   lockMode ? "bg-green-500/20 border-green-500/50" : "bg-slate-800/50"
                )}
             >
                <Lock className={cn("w-6 h-6", lockMode ? "text-green-400" : "text-white")} />
                <span className="text-[10px] font-bold uppercase text-slate-400">Lock</span>
             </button>

             <button 
                onClick={startNewGame}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-800/50 rounded-xl border border-white/5 active:scale-95 transition-all"
             >
                <RefreshCw className="w-6 h-6 text-yellow-400" />
                <span className="text-[10px] font-bold uppercase text-slate-400">Reset</span>
             </button>
          </div>
        </div>

        {/* Right Column: Preview & Tools (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
           <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 uppercase font-bold mb-3">Target Image</div>
              <div className="rounded-xl overflow-hidden border-2 border-white/10 shadow-lg relative group">
                 <img src={currentImage} alt="Target" className="w-full h-auto object-cover" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white" />
                 </div>
              </div>
           </div>

           <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
              <button 
                 onClick={() => setIsPaused(!isPaused)}
                 className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                 {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                 {isPaused ? "Resume Game" : "Pause Game"}
              </button>

              <button 
                 onMouseDown={() => setIsPeeking(true)}
                 onMouseUp={() => setIsPeeking(false)}
                 onMouseLeave={() => setIsPeeking(false)}
                 className="w-full py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-blue-500/20"
              >
                 <Eye className="w-4 h-4" /> Hold to Peek
              </button>

              <button 
                 onClick={() => setLockMode(!lockMode)}
                 className={cn(
                    "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border",
                    lockMode 
                       ? "bg-green-500/20 text-green-400 border-green-500/30" 
                       : "bg-slate-700 hover:bg-slate-600 text-slate-300 border-transparent"
                 )}
              >
                 <Lock className="w-4 h-4" /> {lockMode ? "Lock Mode ON" : "Lock Mode OFF"}
              </button>

              <button 
                 onClick={startNewGame}
                 className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4"
              >
                 <RefreshCw className="w-4 h-4" /> New Game
              </button>
           </div>
        </div>

      </div>

      {/* --- Game Over Modal --- */}
      <AnimatePresence>
        {(isGameOver || isWon) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${isWon ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-red-500'}`} />

              {isWon ? (
                <>
                  <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tight">VICTORY!</h2>
                  
                  <div className="grid grid-cols-2 gap-3 my-6">
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-slate-400 uppercase font-bold">Score</div>
                      <div className="text-xl font-mono text-white">{score}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-slate-400 uppercase font-bold">Coins</div>
                      <div className="text-xl font-mono text-yellow-400 flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4" /> {earnedCoins}
                      </div>
                    </div>
                    <div className="col-span-2 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-slate-400 uppercase font-bold">Total Trophies</div>
                      <div className="text-xl font-mono text-white flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {getUserTotalTrophies() + (getTrophyFromScore('jigsaw', score) !== 'NONE' ? 1 : 0)}
                      </div>
                    </div>
                  </div>

                  {/* Trophy Section */}
                  <div className="mb-6">
                    {(() => {
                      const trophy = getTrophyFromScore('jigsaw', score);
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
                    Body: { game: 'jigsaw', score: score, trophy: getTrophyFromScore('jigsaw', score) }
                  */}

                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/50">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
                  <p className="text-slate-400 mb-8">Speed is key. Try a lower difficulty if you're stuck!</p>
                </>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={startNewGame}
                  className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1"
                >
                  {isWon ? 'Play Again' : 'Try Again'}
                </button>
                <button
                  onClick={() => navigate('/game')}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JigsawPuzzleGame;