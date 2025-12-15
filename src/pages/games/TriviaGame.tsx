import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trophy, CheckCircle, XCircle, RotateCcw, 
  Users, Snowflake, Coins 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrophyFromScore, getTrophyIcon, getTrophyColor } from '../../utils/trophySystem';
import { gameService } from '../../services/gameService';
import { GAME_IDS } from '../../constants/games';
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
            TVK TRIVIA
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

// --- Types ---
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  image?: string; // New Optional Image Property
}

interface LifelineState {
  fiftyFifty: boolean;
  audience: boolean;
  freeze: boolean;
}

// --- Question Data ---
const QUESTIONS: Question[] = [
  { id: 1, question: "What is Thalapathy Vijay's debut movie as a lead actor?", options: ["Vetri", "Naalaiya Theerpu", "Sendhoorapandi", "Rasigan"], correctAnswer: 1 },
  { id: 2, question: "Which movie features the chartbuster song 'Appadi Podu'?", options: ["Thirumalai", "Ghilli", "Madhurey", "Sivakasi"], correctAnswer: 1 },
  { id: 3, question: "In which movie did Vijay play a triple role for the first time?", options: ["Bigil", "Theri", "Mersal", "Puli"], correctAnswer: 2 },
  { id: 4, question: "What is the name of Vijay's character in the movie 'Thuppakki'?", options: ["Jagadish", "Joseph", "Saravanan", "Vetri"], correctAnswer: 0 },
  { id: 5, question: "Which year was the blockbuster 'Leo' released?", options: ["2022", "2023", "2024", "2021"], correctAnswer: 1 },
  // Example with Image (You need to add these images to your public folder)
  { 
    id: 6, 
    question: "Identify the movie from this iconic scene.", 
    options: ["Master", "Kaththi", "Thuppakki", "Mersal"], 
    correctAnswer: 0,
    image: "/img/master.webp" // Example image path
  },
  { id: 7, question: "What is the title of Vijay's 50th film?", options: ["Sura", "Vettaikaran", "Kaavalan", "Velayudham"], correctAnswer: 0 },
  { id: 8, question: "In 'Kaththi', what social issue does the protagonist fight for?", options: ["Education", "Farmers' Water Rights", "Medical Mafia", "Corruption"], correctAnswer: 1 },
  { id: 9, question: "Which movie marked the first collaboration between Vijay and Atlee?", options: ["Mersal", "Bigil", "Theri", "Raja Rani"], correctAnswer: 2 },
  { id: 10, question: "What is the name of the political party founded by Vijay?", options: ["Makkal Needhi Maiam", "Tamizhaga Vettri Kazhagam", "Naam Tamilar", "DMDK"], correctAnswer: 1 },
];

const BACKGROUNDS = [
  '/img/hero.webp',
  '/img/game-1.webp',
  '/img/game-2.webp',
  '/img/game-3.webp',
  '/img/game-4.webp'
];

const TIMER_SECONDS = 15;

// --- Helper: Play Sound (Placeholder) ---
const playSound = (_: 'correct' | 'wrong' | 'click' | 'win') => {
  // const audio = new Audio(`/sounds/${type}.mp3`);
  // audio.play().catch(() => {}); 
};

// --- Helper: Get Rank ---
const getRank = (score: number) => {
  if (score > 3500) return { title: "THE GREATEST OF ALL TIME", color: "text-purple-400" };
  if (score > 2500) return { title: "THALAPATHY", color: "text-brand-gold" };
  if (score > 1500) return { title: "ILAYATHALAPATHY", color: "text-blue-400" };
  if (score > 500) return { title: "RASIGAN", color: "text-green-400" };
  return { title: "ROOKIE", color: "text-gray-400" };
};

const TriviaGame: React.FC = () => {
  const navigate = useNavigate();
  
  // --- Loading State ---
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Game State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  
  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSide, setFeedbackSide] = useState<'left' | 'right'>('right');
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Advanced Features State
  const [lifelines, setLifelines] = useState<LifelineState>({ fiftyFifty: true, audience: true, freeze: true });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]); 
  const [isFrozen, setIsFrozen] = useState(false);
  const [audienceData, setAudienceData] = useState<number[] | null>(null);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [totalTrophies, setTotalTrophies] = useState<number>(0);

  // --- Preload Images ---
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = [
        ...BACKGROUNDS,
        '/img/master.webp',
        '/img/happy.webp',
        '/img/sad.png',
        ...QUESTIONS.filter(q => q.image).map(q => q.image!)
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

  useEffect(() => {
    if (!assetsLoaded) return;

    const init = async () => {
      try {
        const response = await gameService.joinGame(GAME_IDS.TRIVIA);
        setParticipantId(response.participant.id);
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, [assetsLoaded]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Background Rotation
  useEffect(() => {
    if (!assetsLoaded) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [assetsLoaded]);

  // Timer Logic
  useEffect(() => {
    if (isGameOver || isAnswered || isFrozen) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, isAnswered, currentQuestionIndex, isFrozen]);

  const handleTimeUp = () => {
    setIsAnswered(true);
    playSound('wrong');
    setTimeout(nextQuestion, 2000);
  };

  const triggerFeedback = (type: 'success' | 'error') => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const messages = type === 'success' 
      ? ["Awesome!", "Brilliant!", "Correct!", "Superb!", "Fantastic!", "Great Job!", "Spot On!", "Excellent!"] 
      : ["Oops!", "Missed it!", "Try Again!", "Oh no!", "Incorrect!", "So Close!", "Not Quite!"];
    
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

  // --- Lifeline Handlers ---
  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || isAnswered) return;
    playSound('click');
    const current = QUESTIONS[currentQuestionIndex];
    const wrongOptions = current.options
      .map((_, idx) => idx)
      .filter(idx => idx !== current.correctAnswer);
    
    const toHide = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toHide);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
  };

  const useFreeze = () => {
    if (!lifelines.freeze || isAnswered) return;
    playSound('click');
    setIsFrozen(true);
    setLifelines(prev => ({ ...prev, freeze: false }));
  };

  const useAudience = () => {
    if (!lifelines.audience || isAnswered) return;
    playSound('click');
    const current = QUESTIONS[currentQuestionIndex];
    const isAudienceRight = Math.random() < 0.8;
    
    let percentages = [0, 0, 0, 0];
    if (isAudienceRight) {
      percentages[current.correctAnswer] = Math.floor(Math.random() * 40) + 50; 
    } else {
      percentages[current.correctAnswer] = Math.floor(Math.random() * 30); 
    }

    let remaining = 100 - percentages[current.correctAnswer];
    for (let i = 0; i < 4; i++) {
      if (i !== current.correctAnswer) {
        if (remaining > 0) {
          const val = Math.floor(Math.random() * remaining);
          percentages[i] = val;
          remaining -= val;
        }
      }
    }
    percentages[percentages.findIndex(p => p === 0)] += remaining;

    setAudienceData(percentages);
    setLifelines(prev => ({ ...prev, audience: false }));
  };

  // --- Gameplay Handlers ---
  const handleOptionClick = (optionIndex: number) => {
    if (isAnswered || isGameOver || hiddenOptions.includes(optionIndex)) return;

    setSelectedOption(optionIndex);
    setIsAnswered(true);
    setIsFrozen(false); 

    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      playSound('correct');
      const timeBonus = timeLeft * 20;
      const streakBonus = streak * 100;
      const coinBonus = 10 + Math.floor(timeLeft / 2);
      
      setScore((prev) => prev + 200 + timeBonus + streakBonus);
      setCoins((prev) => prev + coinBonus);
      setStreak((prev) => prev + 1);
      triggerFeedback('success');
    } else {
      playSound('wrong');
      setStreak(0);
      triggerFeedback('error');
    }

    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(TIMER_SECONDS);
      setSelectedOption(null);
      setIsAnswered(false);
      setHiddenOptions([]);
      setIsFrozen(false);
      setAudienceData(null);
    } else {
      playSound('win');
      setIsGameOver(true);
    }
  };

  const restartGame = async () => {
    try {
      const response = await gameService.joinGame(GAME_IDS.TRIVIA);
      setParticipantId(response.participant.id);
    } catch (e) {
      console.error(e);
      return;
    }
    setScoreSubmitted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCoins(0);
    setStreak(0);
    setTimeLeft(TIMER_SECONDS);
    setIsGameOver(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setLifelines({ fiftyFifty: true, audience: true, freeze: true });
    setHiddenOptions([]);
    setIsFrozen(false);
    setAudienceData(null);
  };

  // --- Backend Integration ---
  const { refreshUser, user } = useAuth();

  // Helper function to calculate total trophies from user object
  const calculateTotalTrophies = (userTrophies: any): number => {
    if (!userTrophies) return 0;
    // Handle object with tier arrays: {BRONZE: [], SILVER: [], GOLD: [], PLATINUM: []}
    if (typeof userTrophies === 'object' && !Array.isArray(userTrophies)) {
      let total = 0;
      if (userTrophies.BRONZE) total += userTrophies.BRONZE.length;
      if (userTrophies.SILVER) total += userTrophies.SILVER.length;
      if (userTrophies.GOLD) total += userTrophies.GOLD.length;
      if (userTrophies.PLATINUM) total += userTrophies.PLATINUM.length;
      return total;
    }
    // Handle flat array of trophies
    if (Array.isArray(userTrophies)) return userTrophies.length;
    return 0;
  };

  // Update trophies when user data changes
  useEffect(() => {
    if (user?.trophies) {
      setTotalTrophies(calculateTotalTrophies(user.trophies));
    }
  }, [user?.trophies]);
  
  useEffect(() => {
    if (isGameOver && participantId && coins > 0 && !scoreSubmitted) {
      const submitGameScore = async () => {
        try {
          setScoreSubmitted(true);
          await gameService.submitScore(participantId, {
            score: score,
            coins: coins,
            data: { streak: streak }
          });
          
          // Refresh user data from backend to get updated coins and trophies
          await refreshUser();
          // Trophies will be updated automatically via useEffect when user data changes
        } catch (error) {
          console.error("Failed to submit score:", error);
          setScoreSubmitted(false);
        }
      };
      submitGameScore();
    }
  }, [isGameOver, score, coins, streak, participantId, scoreSubmitted, refreshUser]);

  const handleCollectCoins = () => {
    if (isCollecting) return;
    setIsCollecting(true);
    
    // Confetti
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

    setTimeout(() => {
      setIsCollecting(false);
      navigate('/game/trivia');
    }, 1500);
  };

  const currentQ = QUESTIONS[currentQuestionIndex];
  const rank = getRank(score);

  // --- Loading Screen ---
  if (!assetsLoaded) {
    return <GamingLoader progress={loadingProgress} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dynamic Background */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={bgIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105"
          style={{ backgroundImage: `url(${BACKGROUNDS[bgIndex]})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black pointer-events-none" />

      {/* Feedback Bubble */}
      <AnimatePresence>
        {showFeedback && !isGameOver && (
          <motion.div
            initial={{ y: 100, opacity: 0, rotate: feedbackSide === 'right' ? 10 : -10 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`fixed bottom-0 z-[60] flex items-end pointer-events-none ${
               feedbackSide === 'right' ? 'right-0 md:right-10' : 'left-0 md:left-10'
            }`}
          >
            <div className={`flex items-end ${feedbackSide === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <img 
                  src={feedbackType === 'success' ? "/img/happy.webp" : "/img/sad.png"} 
                  alt="Reaction" 
                  className={`w-32 sm:w-48 md:w-64 h-auto drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] filter brightness-110 relative z-10 ${
                      feedbackSide === 'left' ? 'scale-x-[-1]' : ''
                  }`}
                />

                {/* Speech Bubble */}
                <div className={`mb-16 sm:mb-24 md:mb-32 z-20 ${feedbackSide === 'right' ? 'mr-[-30px] md:mr-[-50px]' : 'ml-[-30px] md:ml-[-50px]'}`}>
                   <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className={`relative px-6 py-3 md:px-8 md:py-4 rounded-3xl border-4 shadow-2xl ${
                       feedbackType === 'success' 
                         ? 'bg-gradient-to-br from-brand-gold to-yellow-500 border-white text-black' 
                         : 'bg-gradient-to-br from-red-600 to-red-800 border-white text-white'
                     }`}
                   >
                      <p className="font-black uppercase italic text-lg sm:text-xl md:text-2xl whitespace-nowrap tracking-tighter drop-shadow-sm">
                        "{feedbackText}"
                      </p>
                      <div className={`absolute bottom-[-10px] w-6 h-6 transform border-r-4 border-b-4 border-white ${
                         feedbackType === 'success' ? 'bg-yellow-500' : 'bg-red-700'
                      } ${
                          feedbackSide === 'right' 
                            ? 'right-8 rotate-45'
                            : 'left-8 rotate-[135deg]' 
                      }`}></div>
                   </motion.div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="z-10 w-full max-w-4xl flex justify-between items-center mb-6 p-4">
        <button onClick={() => navigate('/game/trivia')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center">
             <span className="text-xs text-gray-400 uppercase tracking-widest">Current Score</span>
             <motion.div 
               key={score}
               initial={{ scale: 1.2, color: '#FCD34D' }}
               animate={{ scale: 1, color: '#fff' }}
               className="text-3xl font-black font-mono"
             >
               {score.toLocaleString()}
             </motion.div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-xs text-gray-400 uppercase tracking-widest">Coins</span>
             <div className="flex items-center gap-1 font-bold text-yellow-400">
                <Coins className="w-4 h-4" />
                {coins}
             </div>
           </div>

           <div className="flex flex-col items-end">
             <span className="text-xs text-gray-400 uppercase tracking-widest">Streak</span>
             <div className={`flex items-center gap-1 font-bold ${streak > 2 ? 'text-orange-500' : 'text-white'}`}>
                {streak > 2 && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }}>🔥</motion.span>}
                x{streak}
             </div>
           </div>
        </div>
      </div>

      <div className="z-10 w-full max-w-3xl relative">
        <AnimatePresence mode='wait'>
          {!isGameOver ? (
            <motion.div 
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {/* Question Card */}
              <div className="bg-slate-900/80 backdrop-blur-xl p-4 md:p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                
                {streak > 2 && <div className="absolute inset-0 border-2 border-orange-500/50 rounded-3xl animate-pulse pointer-events-none" />}

                {/* Question Info */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-1 flex-wrap">
                    {QUESTIONS.map((_, idx) => (
                      <div key={idx} className={`h-1.5 w-4 md:w-8 rounded-full transition-all ${idx < currentQuestionIndex ? 'bg-brand-gold shadow-[0_0_10px_#FCD34D]' : idx === currentQuestionIndex ? 'bg-white animate-pulse' : 'bg-gray-800'}`} />
                    ))}
                  </div>
                  
                  <div className={`relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full border-4 ${isFrozen ? 'border-blue-400' : timeLeft < 5 ? 'border-red-500 animate-ping-slow' : 'border-brand-gold'} bg-black shadow-lg`}>
                    {isFrozen ? (
                       <Snowflake className="w-6 h-6 text-blue-400 animate-spin-slow" />
                    ) : (
                       <span className={`text-lg md:text-2xl font-bold font-mono ${timeLeft < 5 ? 'text-red-500' : 'text-white'}`}>{timeLeft}</span>
                    )}
                  </div>
                </div>

                {/* --- NEW: IMAGE DISPLAY --- */}
                {currentQ.image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl mx-auto max-w-lg relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <img 
                      src={currentQ.image} 
                      alt="Quiz Context" 
                      className="w-full h-48 md:h-64 object-cover"
                    />
                  </motion.div>
                )}
                {/* ------------------------- */}

                {/* Question */}
                <h2 className="text-xl md:text-3xl font-black text-white mb-6 md:mb-10 leading-snug tracking-wide drop-shadow-lg min-h-[60px] flex items-center justify-center text-center">
                  {currentQ.question}
                </h2>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-8">
                  {currentQ.options.map((option, index) => {
                     if (hiddenOptions.includes(index)) return <div key={index} className="hidden" />;

                     let stateClass = "border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 hover:border-brand-gold/50";
                     if (isAnswered) {
                       if (index === currentQ.correctAnswer) stateClass = "bg-gradient-to-br from-green-600 to-green-700 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-[1.02]";
                       else if (selectedOption === index) stateClass = "bg-gradient-to-br from-red-600 to-red-700 border-red-400 shake-animation";
                       else stateClass = "opacity-40 grayscale";
                     }

                     return (
                       <motion.button
                         key={index}
                         whileHover={!isAnswered ? { scale: 1.02, translateY: -2 } : {}}
                         whileTap={!isAnswered ? { scale: 0.98 } : {}}
                         onClick={() => handleOptionClick(index)}
                         disabled={isAnswered}
                         className={`relative p-4 md:p-6 rounded-2xl border-2 text-left transition-all duration-200 group overflow-hidden shadow-lg ${stateClass}`}
                       >
                         {audienceData && (
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-1000 z-0" 
                              style={{ width: `${audienceData[index]}%` }}
                            />
                         )}
                         
                         <div className="relative z-10 flex justify-between items-center w-full">
                           <span className="font-bold text-base md:text-xl tracking-wide">{option}</span>
                           {audienceData && <span className="text-xs font-mono opacity-90 bg-black/50 px-2 py-1 rounded">{audienceData[index]}%</span>}
                           {isAnswered && index === currentQ.correctAnswer && <CheckCircle className="w-6 h-6 text-white drop-shadow-md" />}
                           {isAnswered && selectedOption === index && index !== currentQ.correctAnswer && <XCircle className="w-6 h-6 text-white drop-shadow-md" />}
                         </div>
                       </motion.button>
                     );
                  })}
                </div>

                {/* Lifelines Bar */}
                <div className="flex justify-center gap-4 md:gap-8 border-t border-white/10 pt-6 md:pt-8">
                  <LifelineButton 
                    icon={<span className="font-black text-sm md:text-lg">50:50</span>} 
                    label="50/50" 
                    available={lifelines.fiftyFifty} 
                    onClick={useFiftyFifty} 
                    isAnswered={isAnswered}
                  />
                  <LifelineButton 
                    icon={<Snowflake className="w-5 h-5 md:w-7 md:h-7" />} 
                    label="Freeze" 
                    available={lifelines.freeze} 
                    onClick={useFreeze} 
                    isAnswered={isAnswered}
                  />
                  <LifelineButton 
                    icon={<Users className="w-5 h-5 md:w-7 md:h-7" />} 
                    label="Ask Crowd" 
                    available={lifelines.audience} 
                    onClick={useAudience} 
                    isAnswered={isAnswered}
                  />
                </div>

              </div>
            </motion.div>
          ) : (
            // --- Game Over Screen ---
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl text-center max-w-lg mx-auto relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />

              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-brand-gold blur-3xl opacity-30 animate-pulse"></div>
                <Trophy className="w-24 h-24 text-brand-gold relative z-10 drop-shadow-[0_0_15px_rgba(252,211,77,0.5)]" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border-2 border-dashed border-brand-gold/30 rounded-full"
                />
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">GAME OVER</h2>
              <div className="flex flex-col items-center gap-2 mb-10">
                <span className="text-gray-400 text-sm uppercase tracking-widest font-bold">You are a certified</span>
                <span className={`text-2xl md:text-3xl font-black ${rank.color} drop-shadow-md uppercase tracking-wide`}>{rank.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <StatBox label="Final Score" value={score.toLocaleString()} />
                <StatBox label="Coins Earned" value={coins} />
                <div className="col-span-2">
                  <StatBox 
                    label="Total Trophies" 
                    value={totalTrophies} 
                  />
                </div>
              </div>

              {/* Trophy Section */}
              <div className="mb-8">
                {(() => {
                  const trophy = getTrophyFromScore('trivia', score);
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
                Body: { game: 'trivia', score: score, trophy: getTrophyFromScore('trivia', score) }
              */}

              <div className="space-y-3">
                <button
                  onClick={handleCollectCoins}
                  disabled={isCollecting}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-700 text-black py-4 rounded-xl font-black text-xl shadow-lg transition-all hover:scale-[1.02] hover:shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  {isCollecting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Coins className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <Coins className="w-6 h-6" />
                  )}
                  {isCollecting ? "Collecting..." : "Collect Coins"}
                </button>
                <button
                  onClick={restartGame}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
                <button
                   onClick={() => navigate('/')}
                   className="w-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white py-4 rounded-xl font-bold transition-colors border border-transparent hover:border-white/10"
                >
                   Return Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const LifelineButton = ({ icon, label, available, onClick, isAnswered }: any) => (
  <button
    onClick={onClick}
    disabled={!available || isAnswered}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${available && !isAnswered ? 'opacity-100 hover:scale-110' : 'opacity-30 grayscale cursor-not-allowed'}`}
  >
    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 ${available ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-gray-800 border-gray-600'}`}>
      {icon}
    </div>
    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const StatBox = ({ label, value }: any) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
    <div className="text-gray-400 text-xs uppercase font-bold mb-1">{label}</div>
    <div className="text-2xl font-bold text-white font-mono">{value}</div>
  </div>
);

export default TriviaGame;