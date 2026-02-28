import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Home, Zap, Volume2, VolumeX, Bomb, Play, Coins, Clock, Shield, Snowflake, Skull, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
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
            TVK WHACK-A-MOLE
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

// --- Constants ---
const GAME_DURATION = 60;
const INITIAL_MOLE_DURATION = 1000;
const MIN_MOLE_DURATION = 400;
const GRID_SIZE = 9;
const HIGH_SCORE_KEY = 'tvk_whack_highscore';
const MAX_COINS = 99;
const BOSS_HP_MAX = 5;
const FREEZE_DURATION = 3000;

// --- Assets ---
const ASSETS = {
  villain: [
    '/img/villain-1.png',
    '/img/villain-2.png',
    '/img/villain-3.png',
  ],
  hero: '/img/happy.webp',
  bomb: '/img/bomb.png',
  hammer: '/img/hammer.webp',
  coin: '/img/coin.webp',
};

const HAMMER_SKINS = [
  { id: 'classic', name: 'Classic', src: '/img/hammer.webp', style: {} },
  { id: 'golden', name: 'Golden', src: '/img/hammer2.webp', style: { filter: 'sepia(1) saturate(3) hue-rotate(10deg)' } },
  { id: 'frozen', name: 'Frozen', src: '/img/hammer3.webp', style: { filter: 'hue-rotate(180deg) saturate(1.5)' } },
];

const PLACEHOLDER_VILLAIN = "https://api.dicebear.com/7.x/avataaars/svg?seed=Villain&backgroundColor=b6e3f4";

// --- Types ---
type GameState = 'idle' | 'playing' | 'paused' | 'gameover';
type MoleType = 'villain' | 'bonus' | 'trap' | 'coin' | 'clock' | 'shield' | 'boss' | 'freeze';
type Feedback = { id: number; x: number; y: number; text: string; color: string; value: number; rotation: number };
type Particle = { id: number; x: number; y: number; color: string; angle: number; speed: number };

const WhackAMoleGame: React.FC = () => {
  const navigate = useNavigate();
  const controls = useAnimation(); // For screen shake

  // --- Loading State ---
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // --- State ---
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [activeHoles, setActiveHoles] = useState<{ [key: number]: MoleType }>({});
  const [bossData, setBossData] = useState<{ index: number; hp: number } | null>(null);
  const [combo, setCombo] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [selectedHammer, setSelectedHammer] = useState(HAMMER_SKINS[0]);
  const [previewHammer, setPreviewHammer] = useState<typeof HAMMER_SKINS[0] | null>(null);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [totalTrophies, setTotalTrophies] = useState<number>(0);
  
  // --- New Visual Effects State ---
  const [isHitStop, setIsHitStop] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // --- Fever Mode State ---
  const [isFever, setIsFever] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const lastSpawnTypeRef = useRef<MoleType | null>(null);

  // --- Combo Tier State ---
  const [comboTierText, setComboTierText] = useState<string | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [isGodlike, setIsGodlike] = useState(false);

  // --- Refs for Game Loop State Access ---
  const isFeverRef = useRef(isFever);
  const isFrozenRef = useRef(isFrozen);
  const isGodlikeRef = useRef(isGodlike);
  const comboRef = useRef(combo);
  const coinsRef = useRef(coins);
  const levelRef = useRef(level);
  const bossDataRef = useRef(bossData);

  useEffect(() => { 
      isFeverRef.current = isFever; 
      if (isFever) {
          const timer = setTimeout(() => {
              setIsFever(false);
              setCombo(0);
          }, 10000);
          return () => clearTimeout(timer);
      }
  }, [isFever]);

  useEffect(() => { isFrozenRef.current = isFrozen; }, [isFrozen]);
  useEffect(() => { isGodlikeRef.current = isGodlike; }, [isGodlike]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { bossDataRef.current = bossData; }, [bossData]);

  useEffect(() => {
    if (combo === 5) {
        setComboTierText("Great!");
        setTimeout(() => setComboTierText(null), 1000);
    } else if (combo === 10) {
        setComboTierText("UNSTOPPABLE!");
        setScreenFlash(true);
        setTimeout(() => {
            setComboTierText(null);
            setScreenFlash(false);
        }, 1000);
    } else if (combo === 15) {
        setComboTierText("GODLIKE!");
        setIsGodlike(true);
        setTimeout(() => setComboTierText(null), 2000);
    } else if (combo < 5) {
        setIsGodlike(false);
    }
  }, [combo]);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moleTimersRef = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playSound = useCallback((_type: 'hit' | 'bonus' | 'miss' | 'gameover' | 'boss_hit' | 'freeze') => {
    if (isMuted) return;
  }, [isMuted]);

  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = [
        ...ASSETS.villain,
        ASSETS.hero,
        ASSETS.bomb,
        ASSETS.hammer,
        ASSETS.coin,
        ...HAMMER_SKINS.map(h => h.src),
        '/img/bg2-game3.webp',
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

  useEffect(() => {
    if (!assetsLoaded) return;

    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    if (stored) setHighScore(parseInt(stored));
    
    const moveCursor = (e: MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
    };
    const mouseDown = () => setIsClicking(true);
    const mouseUp = () => setIsClicking(false);
    
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    return () => {
        cleanup();
        window.removeEventListener('mousemove', moveCursor);
        window.removeEventListener('mousedown', mouseDown);
        window.removeEventListener('mouseup', mouseUp);
    };
  }, [assetsLoaded]);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    Object.values(moleTimersRef.current).forEach(t => clearTimeout(t));
    moleTimersRef.current = {};
  };

  const startGame = async () => {
    try {
      const response = await gameService.joinGame(GAME_IDS.WHACK_A_MOLE);
      setParticipantId(response.participant.id);
    } catch (error) {
      return;
    }

    setScoreSubmitted(false);
    cleanup();
    setScore(0);
    setLevel(1);
    setCombo(0);
    setCoins(0);
    setShieldActive(false);
    setIsFrozen(false);
    setBossData(null);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    setActiveHoles({});
    
    timerRef.current = setInterval(() => {
      if (isFrozenRef.current) return; 

      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    scheduleNextMole();
  };

  const endGame = () => {
    cleanup();
    setGameState('gameover');
    playSound('gameover');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      triggerWinConfetti();
    }
  };

  const { refreshUser, user } = useAuth();
  const { isPremium } = useGameAccess();

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

  useEffect(() => {
    if (user?.trophies) {
      setTotalTrophies(calculateTotalTrophies(user.trophies));
    }
  }, [user?.trophies]);
  
  useEffect(() => {
    if (gameState === 'gameover' && participantId && coins > 0 && !scoreSubmitted) {
      const submitGameScore = async () => {
        try {
          setScoreSubmitted(true);
          await gameService.submitScore(participantId, {
            score: score,
            coins: coins,
            data: { level: level, highScore: highScore }
          });
          
          await refreshUser();
        } catch (error) {
          setScoreSubmitted(false);
        }
      };
      submitGameScore();
    }
  }, [gameState, score, coins, level, highScore, participantId, scoreSubmitted, refreshUser]);

  const scheduleNextMole = () => {
    if (gameState === 'gameover') return;

    if (isFrozenRef.current) {
        gameLoopRef.current = setTimeout(scheduleNextMole, 500);
        return;
    }

    let baseDelay = 800;
    baseDelay = Math.max(300, baseDelay - (levelRef.current * 50));
    
    if (isFeverRef.current) {
        baseDelay = 550;
    } else if (isGodlikeRef.current) {
        baseDelay = baseDelay * 1.3;
    }

    gameLoopRef.current = setTimeout(() => {
      spawnMole();
      scheduleNextMole();
    }, baseDelay);
  };

  const spawnMole = () => {
    const currentActive = Object.keys(activeHoles).map(Number);
    const available = Array.from({ length: GRID_SIZE }, (_, i) => i).filter(i => !currentActive.includes(i));
    
    if (available.length === 0) return;

    const holeIndex = available[Math.floor(Math.random() * available.length)];
    
    const rand = Math.random();
    let type: MoleType = 'villain';
    
    const currentIsFever = isFeverRef.current;
    const currentCombo = comboRef.current;
    const currentLevel = levelRef.current;
    const lastWasCoin = lastSpawnTypeRef.current === 'coin';

    if (currentIsFever) {
         if (lastWasCoin) type = 'trap';
         else if (rand > 0.2) type = 'coin';
         else type = 'trap';
    } else {
        if (!bossDataRef.current && currentLevel >= 2 && rand > 0.98) {
            type = 'boss';
        }
        else if (rand > 0.96) type = 'freeze';
        else if (currentCombo >= 3) {
            if (!lastWasCoin && rand > 0.6) type = 'coin';
            else if (rand > 0.4) type = 'trap'; 
        } else {
            if (!lastWasCoin && rand > 0.97) type = 'coin'; 
            else if (rand > 0.95) type = 'clock';
            else if (rand > 0.93) type = 'shield';
            else if (rand > 0.85) type = 'bonus'; 
            else if (rand > 0.75) type = 'trap'; 
        }
    }

    lastSpawnTypeRef.current = type;

    setActiveHoles(prev => ({ ...prev, [holeIndex]: type }));

    if (type === 'boss') {
        setBossData({ index: holeIndex, hp: BOSS_HP_MAX });
    }

    let duration = Math.max(MIN_MOLE_DURATION, INITIAL_MOLE_DURATION - (currentLevel * 50));
    if (currentIsFever) duration = 1100;
    if (isGodlikeRef.current) duration = duration * 1.5;
    if (type === 'boss') duration = 4000;

    const timer = setTimeout(() => {
      setActiveHoles(prev => {
        const next = { ...prev };
        delete next[holeIndex];
        return next;
      });
      if (type === 'boss') setBossData(null);
    }, duration);

    moleTimersRef.current[holeIndex] = timer;
  };

  const spawnParticles = (x: number, y: number, color: string) => {
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
          id: Date.now() + i,
          x,
          y,
          color,
          angle: (Math.PI * 2 * i) / 8,
          speed: Math.random() * 5 + 2
      }));
      setParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 500);
  };

  // UPDATED: handleWhack modified to accept generic React Events for compatibility
  const handleWhack = (index: number, e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (gameState !== 'playing') return;
    
    // Safety check: if no mole is here, it might be a miss or a ghost click
    const type = activeHoles[index];
    if (!type) {
        // Only reset combo if it's a genuine miss, not a double-fire.
        // For simplicity, we can just return here if using onPointerDown.
        setCombo(0);
        return;
    }

    setIsHitStop(true);
    setTimeout(() => setIsHitStop(false), 50);

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    if (type === 'boss') {
        if (bossData && bossData.index === index) {
            const newHp = bossData.hp - 1;
            playSound('boss_hit');
            spawnParticles(clientX, clientY, '#ef4444');
            
            if (newHp <= 0) {
                setBossData(null);
                const newHoles = { ...activeHoles };
                delete newHoles[index];
                setActiveHoles(newHoles);
                if (moleTimersRef.current[index]) clearTimeout(moleTimersRef.current[index]);
                
                const points = 500;
                setScore(s => s + points);
                setFeedbacks(prev => [...prev, { id: Date.now(), x: clientX, y: clientY, text: "BOSS DEFEATED!", color: "text-purple-400", value: points, rotation: Math.random() * 30 - 15 }]);
                triggerWinConfetti();
            } else {
                setBossData({ ...bossData, hp: newHp });
                setFeedbacks(prev => [...prev, { id: Date.now(), x: clientX, y: clientY, text: "HIT!", color: "text-white", value: 0, rotation: Math.random() * 30 - 15 }]);
            }
        }
        return;
    }

    const newHoles = { ...activeHoles };
    delete newHoles[index];
    setActiveHoles(newHoles);
    if (moleTimersRef.current[index]) clearTimeout(moleTimersRef.current[index]);

    let points = 0;
    let feedbackText = "";
    let feedbackColor = "";

    if (type === 'villain') {
      points = (10 + combo) * (isFever ? 2 : 1);
      setCombo(c => {
          const newCombo = c + 1;
          if (newCombo >= 10 && !isFever) setIsFever(true);
          return newCombo;
      });
      playSound('hit');
      spawnParticles(clientX, clientY, '#fbbf24');
      feedbackText = isFever ? `FEVER! +${points}` : `+${points}`;
      feedbackColor = isFever ? "text-yellow-300" : "text-white";
    } else if (type === 'bonus') {
      points = (50 + (combo * 2)) * (isFever ? 2 : 1);
      setCombo(c => c + 2);
      playSound('bonus');
      spawnParticles(clientX, clientY, '#facc15');
      feedbackText = "BONUS!";
      feedbackColor = "text-yellow-400";
    } else if (type === 'coin') {
      points = 50;
      setCoins(c => Math.min(c + 1, MAX_COINS));
      playSound('bonus');
      spawnParticles(clientX, clientY, '#fde047');
      feedbackText = "+1 Coin";
      feedbackColor = "text-yellow-300";
    } else if (type === 'clock') {
      setTimeLeft(t => t + 5);
      playSound('bonus');
      feedbackText = "+5s";
      feedbackColor = "text-blue-400";
    } else if (type === 'shield') {
      setShieldActive(true);
      playSound('bonus');
      feedbackText = "SHIELD UP!";
      feedbackColor = "text-cyan-400";
    } else if (type === 'freeze') {
      setIsFrozen(true);
      playSound('freeze');
      feedbackText = "FROZEN!";
      feedbackColor = "text-cyan-200";
      setTimeout(() => setIsFrozen(false), FREEZE_DURATION);
    } else if (type === 'trap') {
      if (shieldActive) {
          setShieldActive(false);
          playSound('hit');
          feedbackText = "BLOCKED!";
          feedbackColor = "text-cyan-400";
      } else {
          points = -20;
          setCombo(0);
          setIsFever(false);
          playSound('miss');
          feedbackText = "OUCH!";
          feedbackColor = "text-red-500";
          controls.start({ x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } });
          if (navigator.vibrate) navigator.vibrate(200);
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 500);
      }
    }

    const newScore = score + points;
    setScore(Math.max(0, newScore));
    
    const newLevel = Math.floor(newScore / 500) + 1;
    if (newLevel > level) {
        setLevel(newLevel);
        setFeedbacks(prev => [...prev, { id: Date.now() + 1, x: window.innerWidth / 2, y: window.innerHeight / 2, text: `LEVEL ${newLevel}!`, color: "text-purple-500", value: 0, rotation: 0 }]);
        playSound('bonus');
    }

    const id = Date.now();
    setFeedbacks(prev => [...prev, { id, x: clientX, y: clientY, text: feedbackText, color: feedbackColor, value: points, rotation: Math.random() * 30 - 15 }]);
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 800);
  };

  const triggerWinConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#FF0000', '#ffffff'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700', '#FF0000', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

 const getMoleContent = (type: MoleType, _index: number) => {
    const popEffect = "filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] transform transition-transform";
    const containerClass = "w-full h-full flex items-end justify-center pb-2 relative"; 

    // UPDATED: Sizes for items are now responsive (smaller on mobile)
    const itemSizeClass = "w-16 h-16 sm:w-28 sm:h-28"; 
    const iconSizeClass = "w-8 h-8 sm:w-16 sm:h-16"; 
    const borderSizeClass = "border-4 sm:border-[6px]";

    switch (type) {
      case 'boss':
        return (
            <div className={containerClass}>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-purple-600/40 blur-2xl rounded-full animate-pulse" />
                <div className="absolute top-0 w-20 h-3 bg-slate-900 rounded-full overflow-hidden border-2 border-white/20 z-20 shadow-lg">
                    <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-200"
                        style={{ width: `${((bossData?.hp || 0) / BOSS_HP_MAX) * 100}%` }}
                    />
                </div>
                <div className={`w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-800 to-purple-950 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.6)] ${borderSizeClass} border-purple-500 animate-bounce relative z-10 ${popEffect}`}>
                    <Skull className="w-12 h-12 sm:w-20 sm:h-20 text-white fill-current drop-shadow-md" />
                </div>
            </div>
        );
      case 'freeze':
        return (
            <div className={containerClass}>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-cyan-400/40 blur-xl rounded-full animate-pulse" />
                <div className={`${itemSizeClass} bg-gradient-to-br from-cyan-100 to-cyan-300 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(165,243,252,0.8)] ${borderSizeClass} border-white animate-pulse relative z-10 ${popEffect}`}>
                    <Snowflake className={`${iconSizeClass} text-cyan-700 fill-current animate-spin-slow`} />
                </div>
            </div>
        );
      case 'bonus':
        return (
          <div className={containerClass}>
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-yellow-400/40 blur-xl rounded-full animate-pulse" />
             <div className={`${itemSizeClass} bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(250,204,21,0.6)] ${borderSizeClass} border-yellow-100 animate-pulse relative z-10 ${popEffect}`}>
                <Zap className={`${iconSizeClass} text-black fill-current`} />
             </div>
          </div>
        );
      case 'trap':
        return (
          <div className={containerClass}>
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-red-500/50 blur-xl rounded-full animate-pulse" />
             <div className={`${itemSizeClass} bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.6)] ${borderSizeClass} border-red-300 relative z-10 ${popEffect}`}>
                <Bomb className={`${iconSizeClass} text-white fill-current animate-bounce`} />
             </div>
          </div>
        );
      case 'coin':
        return (
           <div className={containerClass}>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-yellow-400/50 blur-xl rounded-full animate-pulse" />
              <img 
                src={ASSETS.coin} 
                alt="Coin" 
                className={`${itemSizeClass} object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-bounce pointer-events-none select-none relative z-10 ${popEffect}`}
              />
           </div>
        );
      case 'clock':
        return (
          <div className={containerClass}>
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/40 blur-xl rounded-full animate-pulse" />
             <div className={`${itemSizeClass} bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.6)] ${borderSizeClass} border-blue-200 animate-pulse relative z-10 ${popEffect}`}>
                <Clock className={`${iconSizeClass} text-white fill-current`} />
             </div>
          </div>
        );
      case 'shield':
        return (
          <div className={containerClass}>
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-cyan-500/40 blur-xl rounded-full animate-pulse" />
             <div className={`${itemSizeClass} bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)] ${borderSizeClass} border-cyan-200 animate-pulse relative z-10 ${popEffect}`}>
                <Shield className={`${iconSizeClass} text-white fill-current`} />
             </div>
          </div>
        );
      default:
        // VILLAIN (Size adjusted slightly to match new logic)
        return (
           <div className={`${containerClass} overflow-visible`}>
              <img 
                src={ASSETS.villain[Math.floor(Math.random() * ASSETS.villain.length)]} 
                alt="Villain" 
                className={`w-[120%] sm:w-[140%] h-[160%] sm:h-[180%] object-contain object-bottom filter drop-shadow-[0_15px_10px_rgba(0,0,0,0.6)] hover:brightness-110 transition-all duration-75 select-none pointer-events-none relative z-10 origin-bottom transform scale-100 sm:scale-110`}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_VILLAIN; }}
              />
           </div>
        );
    }
  };

  if (!assetsLoaded) {
    return <GamingLoader progress={loadingProgress} />;
  }

  return (
    <div className={`min-h-[100dvh] ${isFever ? 'bg-red-950' : 'bg-slate-950'} text-white font-sans relative overflow-hidden flex flex-col items-center justify-center p-4 select-none touch-manipulation cursor-none transition-colors duration-700`}>
      {/* Hit Stop Global Freeze */}
      {isHitStop && (
        <style>{`
          *, *::before, *::after {
            animation-play-state: paused !important;
            transition: none !important;
          }
        `}</style>
      )}

      {/* Screen Flash */}
      <AnimatePresence>
        {screenFlash && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white z-[60] pointer-events-none mix-blend-overlay"
            />
        )}
      </AnimatePresence>

      {/* Combo Tier Text */}
      <AnimatePresence>
        {comboTierText && (
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] pointer-events-none"
            >
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[0_0_20px_rgba(234,88,12,0.6)] italic tracking-tighter transform -skew-x-12 stroke-white stroke-1 whitespace-nowrap">
                    {comboTierText}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Shield Overlay */}
      <AnimatePresence>
        {shieldActive && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 border-[8px] border-cyan-400/50 z-50 pointer-events-none shadow-[inset_0_0_50px_rgba(6,182,212,0.5)]"
            />
        )}
        {isFrozen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-cyan-500/20 z-40 pointer-events-none backdrop-blur-[2px]"
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl font-black text-cyan-200 tracking-widest opacity-50 animate-pulse">FROZEN</div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Cursor */}
      <motion.div 
        className="fixed pointer-events-none z-[100] hidden md:block top-0 left-0"
        style={{ 
            x: cursorX,
            y: cursorY,
            translateX: "-35%",
            translateY: "-35%"
        }}
        animate={{ rotate: isClicking ? -45 : 0 }}
        transition={{ 
            rotate: { type: "spring", stiffness: 500, damping: 30 },
            default: { duration: 0 }
        }}
      >
         <img 
            src={selectedHammer.src} 
            alt="Hammer" 
            style={selectedHammer.style}
            className="w-32 h-32 object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
         />
      </motion.div>

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95"
            style={{ backgroundImage: "url('/img/bg2-game3.webp')" }}
         />
         <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isFever ? 'from-red-900/60 via-red-950/80 to-black' : 'from-indigo-900/50 via-slate-950/80 to-black'} transition-colors duration-1000`} />
         <div className="absolute inset-0 opacity-30" 
              style={{ 
                  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
                  backgroundSize: '40px 40px' 
              }} 
         />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80" />
      </div>

      {/* HUD */}
      <div className="relative z-20 w-full max-w-lg mb-4 sm:mb-8">
        <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-700/50 shadow-2xl ring-1 ring-white/10">
            <button onClick={() => navigate(-1)} className="p-2 sm:p-3 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white active:scale-95">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 mx-2 sm:mx-4 flex-1">
                <div className="flex flex-col items-center justify-center bg-slate-800/50 rounded-lg py-1 sm:py-2">
                    <div className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold">Score</div>
                    <div className="text-xl sm:text-3xl font-black text-yellow-400 tabular-nums leading-none drop-shadow-lg">{score}</div>
                </div>

                <div className="flex flex-col items-center justify-center bg-slate-800/50 rounded-lg py-1 sm:py-2 relative overflow-hidden">
                     <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
                        <motion.div 
                            className={`h-full ${timeLeft < 10 ? 'bg-red-500' : 'bg-blue-500'}`} 
                            animate={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
                        />
                     </div>
                    <div className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold">Time</div>
                    <div className={`text-xl sm:text-3xl font-black tabular-nums leading-none ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-slate-800/50 rounded-lg py-1 sm:py-2">
                    <div className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold">Level</div>
                    <div className="text-lg sm:text-2xl font-black text-purple-400 tabular-nums leading-none flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" /> {level}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-slate-800/50 rounded-lg py-1 sm:py-2">
                    <div className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold">Coins</div>
                    <div className="text-lg sm:text-2xl font-black text-yellow-300 tabular-nums leading-none flex items-center gap-1">
                        <Coins className="w-3 h-3 sm:w-4 sm:h-4" /> {coins}
                    </div>
                </div>
            </div>

            <button onClick={() => setIsMuted(!isMuted)} className="p-2 sm:p-3 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white active:scale-95">
                {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
        </div>
        
        {/* Combo Meter */}
        <div className="h-3 sm:h-4 bg-slate-800/80 rounded-full mt-4 overflow-hidden relative border border-slate-700 shadow-inner">
            <motion.div 
                className={`absolute top-0 left-0 h-full ${isFever ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 animate-pulse' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(combo * 10, 100)}%` }}
                transition={{ type: "spring", stiffness: 100 }}
            />
        </div>
        <AnimatePresence>
            {isFever && (
                 <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black px-4 py-1 rounded-full border-2 border-white shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-bounce whitespace-nowrap z-50"
                 >
                    💰 COIN RUSH! 💰
                 </motion.div>
            )}
            {combo > 1 && !isFever && (
                <motion.div 
                    key={combo}
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none w-full"
                >
                    <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] italic tracking-tighter transform -skew-x-12">
                        {combo}x
                    </div>
                    <div className="text-xs md:text-sm font-bold text-cyan-200 tracking-[0.2em] uppercase drop-shadow-md animate-pulse">
                        {combo >= 3 ? "COIN CHANCE!" : "COMBO STREAK!"}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Game Grid */}
      <motion.div 
        animate={controls}
        style={{ transform: "perspective(1000px) rotateX(20deg)" }}
        className={`relative z-10 bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-[2rem] border-4 ${isFever ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)] animate-pulse' : 'border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]'} max-w-lg w-full aspect-square mx-auto transition-all duration-300`}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none rounded-[1.5rem]" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />

        <div className="grid grid-cols-3 gap-3 sm:gap-4 h-full relative">
            {Array.from({ length: GRID_SIZE }).map((_, index) => {
              const rowIndex = Math.floor(index / 3);
              const zIndex = rowIndex * 10 + 10;

              return (
              <div 
                key={index}
                className="relative group"
                style={{ zIndex }} 
                // UPDATED: Use onPointerDown for unified mouse/touch handling (prevents ghost clicks)
                onPointerDown={(e) => handleWhack(index, e)}
              >
                {/* Hole Graphic */}
                <div className="absolute inset-0 bg-black rounded-full transform scale-x-100 scale-y-90 translate-y-2 border-b-[6px] border-white/5 shadow-[inset_0_20px_20px_rgba(0,0,0,1)] ring-4 ring-slate-800" />
                
                {/* Mole Container */}
                <div className="absolute bottom-4 left-0 right-0 h-[200%] flex items-end justify-center pointer-events-none">
                    <AnimatePresence mode='wait'>
                        {activeHoles[index] && (
                            <motion.div
                                key={`${index}-${activeHoles[index]}`}
                                initial={{ y: "100%", scale: 0.5, opacity: 0 }} 
                                animate={{ y: "5%", scale: 1.1, opacity: 1 }} 
                                exit={{ y: "100%", scale: 0.5, opacity: 0 }} 
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 400, 
                                    damping: 25,
                                    mass: 0.5
                                }}
                                className="w-full h-full flex items-end justify-center cursor-pointer origin-bottom"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {getMoleContent(activeHoles[index], index)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none rounded-b-full opacity-50 z-0" />
              </div>
            )})}
        </div>
      </motion.div>

      {/* Particles */}
      {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
            animate={{ 
                x: p.x + Math.cos(p.angle) * 100, 
                y: p.y + Math.sin(p.angle) * 100, 
                opacity: 0,
                scale: 0
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed w-3 h-3 rounded-full pointer-events-none z-50"
            style={{ backgroundColor: p.color }}
          />
      ))}

      {/* Floating Feedback */}
      <AnimatePresence>
        {feedbacks.map(fb => (
          <motion.div
            key={fb.id}
            initial={{ opacity: 1, y: 0, scale: 0.5, rotate: fb.rotation }}
            animate={{ opacity: 0, y: -100, scale: 1.5, rotate: fb.rotation }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            style={{ position: 'fixed', left: fb.x, top: fb.y, pointerEvents: 'none', zIndex: 50 }}
            className={`font-black text-2xl sm:text-4xl ${fb.color} drop-shadow-lg stroke-black`}
          >
            {fb.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* CRT / Glitch Overlay */}
      <AnimatePresence>
        {glitchActive && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] pointer-events-none crt-overlay glitch-effect mix-blend-hard-light"
            />
        )}
      </AnimatePresence>


      {/* Start Screen Overlay */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl text-center max-w-sm w-full mx-auto relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter relative z-10">WHACK-A-VILLAIN</h1>
                <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base relative z-10">Clear the streets! Avoid the bombs!</p>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 relative z-10">
                    <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 shrink-0">
                            <img src={ASSETS.villain[0]} className="w-6 h-6" onError={(e) => e.currentTarget.src = PLACEHOLDER_VILLAIN} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Villain</div>
                            <div className="text-xs text-green-400 font-black">+10 Pts</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 shrink-0">
                            <Skull className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Boss</div>
                            <div className="text-xs text-purple-400 font-black">+500 Pts</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 shrink-0">
                            <Snowflake className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Freeze</div>
                            <div className="text-xs text-cyan-400 font-black">Pause Time</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 shrink-0">
                            <Bomb className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Bomb</div>
                            <div className="text-xs text-red-500 font-black">-20 Pts</div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 sm:mb-10 relative z-10">
                    <div className="text-xs text-slate-400 font-bold uppercase mb-3">Choose Your Weapon</div>
                    <div className="flex justify-center gap-4">
                        {HAMMER_SKINS.map((hammer) => (
                            <button
                                key={hammer.id}
                                onClick={() => {
                                    setSelectedHammer(hammer);
                                    setPreviewHammer(hammer);
                                    setTimeout(() => setPreviewHammer(null), 4000);
                                }}
                                className={`group relative p-2 rounded-xl transition-all duration-200 shrink-0 ${
                                    selectedHammer.id === hammer.id 
                                    ? 'bg-blue-500/20 ring-2 ring-blue-500 scale-110' 
                                    : 'bg-slate-800/50 hover:bg-slate-800 hover:scale-105'
                                }`}
                            >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                                    <img 
                                        src={hammer.src} 
                                        alt={hammer.name}
                                        style={hammer.style}
                                        className="w-full h-full object-contain drop-shadow-md"
                                    />
                                </div>
                                <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase whitespace-nowrap transition-colors ${
                                    selectedHammer.id === hammer.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'
                                }`}>
                                    {hammer.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={startGame}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-base sm:text-lg uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 relative z-10"
                >
                    <Play className="fill-current w-5 h-5" /> Start Game
                </button>
            </motion.div>
        </div>
      )}

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              // UPDATED: Added max-h and overflow for landscape/small screens, reduced padding for mobile
              className="bg-slate-900 border border-slate-700 p-5 sm:p-8 rounded-3xl text-center max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-red-600" />

              <div className="flex justify-center mb-4 sm:mb-6">
                 <div className="p-3 sm:p-4 rounded-full bg-yellow-500/20 text-yellow-400 ring-4 ring-yellow-500/20 animate-bounce">
                   <Trophy className="w-8 h-8 sm:w-12 sm:h-12" />
                 </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black uppercase mb-2 text-white">
                Time's Up!
              </h2>
              
              {/* Stats Grid - Adjusted gaps and padding for mobile */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 bg-black/20 p-3 sm:p-4 rounded-xl">
                 <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold">Final Score</div>
                    <div className="text-2xl sm:text-4xl font-black text-yellow-400">{score}</div>
                 </div>
                 <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold">High Score</div>
                    <div className="text-2xl sm:text-4xl font-black text-purple-400">{Math.max(score, highScore)}</div>
                 </div>
                 <div className="text-center col-span-2 mt-2 border-t border-slate-700 pt-2">
                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold">Coins Collected</div>
                    <div className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center justify-center gap-2">
                        <Coins className="w-5 h-5 sm:w-6 sm:h-6" /> {coins}
                    </div>
                 </div>
                 <div className="text-center col-span-2 mt-2 border-t border-slate-700 pt-2">
                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold">Total Trophies</div>
                    <div className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> 
                        {totalTrophies}
                    </div>
                 </div>
              </div>

              {/* Trophy Section - Scale adjustments */}
              <div className="mb-6 sm:mb-8">
                {(() => {
                  const trophy = getTrophyFromScore('whack-a-mole', score);
                  if (trophy !== 'NONE') {
                    return (
                      <div className="flex flex-col items-center animate-bounce-slow">
                        <span className="text-5xl sm:text-6xl mb-2 filter drop-shadow-lg">{getTrophyIcon(trophy)}</span>
                        <span className="text-lg sm:text-xl font-bold" style={{ color: getTrophyColor(trophy) }}>
                          {trophy} TROPHY
                        </span>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">New Achievement Unlocked!</p>
                      </div>
                    );
                  }
                  return <p className="text-gray-500 text-xs sm:text-sm">Keep playing to earn trophies!</p>;
                })()}
              </div>

              {/* Buttons - Mobile friendly sizing */}
              <div className={`grid ${isPremium ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                <button
                  onClick={() => navigate('/games/villain-hunt')}
                  className="w-full py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider transition-colors bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  Home
                </button>
                
                {isPremium && (
                  <button
                    onClick={startGame}
                    className="w-full py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Play Again
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hammer Preview Overlay */}
      <AnimatePresence>
        {previewHammer && (
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
            >
                <div className="flex flex-col items-center">
                    <motion.img
                        src={previewHammer.src}
                        style={previewHammer.style}
                        className="w-64 h-64 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                        animate={{ 
                            rotate: [0, -10, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    />
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 text-3xl font-black text-white uppercase tracking-widest drop-shadow-lg"
                    >
                        {previewHammer.name} Equipped!
                    </motion.div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhackAMoleGame;