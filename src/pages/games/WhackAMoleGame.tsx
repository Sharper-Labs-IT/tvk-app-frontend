import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Home, Zap, Volume2, VolumeX, Bomb, Play, Coins, Clock, Shield, Snowflake, Skull, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Constants ---
const GAME_DURATION = 60; // Increased duration
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
    '/img/villain-1.webp',
    '/img/villain-2.webp',
    '/img/villain-3.webp',
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

  // --- Combo Tiers Effect ---
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
  
  // --- Cursor Motion Values ---
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // --- Refs ---
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moleTimersRef = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Audio (Simulated) ---
  const playSound = useCallback((type: 'hit' | 'bonus' | 'miss' | 'gameover' | 'boss_hit' | 'freeze') => {
    if (isMuted) return;
    console.log(`Playing sound: ${type}`);
  }, [isMuted]);

  // --- Initialization ---
  useEffect(() => {
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
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    Object.values(moleTimersRef.current).forEach(t => clearTimeout(t));
    moleTimersRef.current = {};
  };

  // --- Game Logic ---
  const startGame = () => {
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
    
    // Start Timer
    timerRef.current = setInterval(() => {
      if (isFrozenRef.current) return; // Pause timer if frozen

      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start Game Loop
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

  const scheduleNextMole = () => {
    if (gameState === 'gameover') return;

    // If frozen, check again in 500ms but don't spawn
    if (isFrozenRef.current) {
        gameLoopRef.current = setTimeout(scheduleNextMole, 500);
        return;
    }

    // If Boss is active, don't spawn new moles until boss is cleared or despawns (optional, but cleaner)
    // Actually, let's allow minions with boss for chaos
    
    let baseDelay = 800;
    // Speed up as level increases
    baseDelay = Math.max(300, baseDelay - (levelRef.current * 50));
    
    if (isFeverRef.current) {
        baseDelay = 400; // Slower speed for Coin Rush (was 250)
    } else if (isGodlikeRef.current) {
        baseDelay = baseDelay * 1.3; // Slow down spawn rate for Godlike
    }

    gameLoopRef.current = setTimeout(() => {
      spawnMole();
      scheduleNextMole();
    }, baseDelay);
  };

  const spawnMole = () => {
    // Find empty holes
    const currentActive = Object.keys(activeHoles).map(Number);
    const available = Array.from({ length: GRID_SIZE }, (_, i) => i).filter(i => !currentActive.includes(i));
    
    if (available.length === 0) return;

    // Pick random hole
    const holeIndex = available[Math.floor(Math.random() * available.length)];
    
    // Determine type
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
        // Boss Spawn Chance (Only if no boss active and level > 2)
        if (!bossDataRef.current && currentLevel >= 2 && rand > 0.98) {
            type = 'boss';
        }
        // Freeze Spawn Chance
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

    // Set active
    setActiveHoles(prev => ({ ...prev, [holeIndex]: type }));

    if (type === 'boss') {
        setBossData({ index: holeIndex, hp: BOSS_HP_MAX });
    }

    // Schedule removal
    let duration = Math.max(MIN_MOLE_DURATION, INITIAL_MOLE_DURATION - (currentLevel * 50));
    if (currentIsFever) duration = 600;
    if (isGodlikeRef.current) duration = duration * 1.5; // Slow down mole duration for Godlike
    if (type === 'boss') duration = 4000; // Boss stays longer

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

  const handleWhack = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing') return;
    
    const type = activeHoles[index];
    if (!type) {
        setCombo(0);
        return;
    }

    // Hit Stop Effect
    setIsHitStop(true);
    setTimeout(() => setIsHitStop(false), 50);

    // Get coordinates
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    // Handle Boss Logic
    if (type === 'boss') {
        if (bossData && bossData.index === index) {
            const newHp = bossData.hp - 1;
            playSound('boss_hit');
            spawnParticles(clientX, clientY, '#ef4444'); // Red particles
            
            if (newHp <= 0) {
                // Boss Defeated
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
                // Visual shake handled by component re-render or local state in sub-component ideally, 
                // but here we can just show a small feedback
                setFeedbacks(prev => [...prev, { id: Date.now(), x: clientX, y: clientY, text: "HIT!", color: "text-white", value: 0, rotation: Math.random() * 30 - 15 }]);
            }
        }
        return;
    }

    // Clear mole immediately
    const newHoles = { ...activeHoles };
    delete newHoles[index];
    setActiveHoles(newHoles);
    if (moleTimersRef.current[index]) clearTimeout(moleTimersRef.current[index]);

    // Calculate Score
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
          
          // Glitch Effect
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 500);
      }
    }

    // Level Up Logic
    const newScore = score + points;
    setScore(Math.max(0, newScore));
    
    const newLevel = Math.floor(newScore / 500) + 1;
    if (newLevel > level) {
        setLevel(newLevel);
        setFeedbacks(prev => [...prev, { id: Date.now() + 1, x: window.innerWidth / 2, y: window.innerHeight / 2, text: `LEVEL ${newLevel}!`, color: "text-purple-500", value: 0, rotation: 0 }]);
        playSound('bonus');
    }

    // Add Feedback
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

  // --- Render Helpers ---
  const getMoleContent = (type: MoleType, _index: number) => {
    switch (type) {
      case 'boss':
        return (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 bg-purple-600/30 blur-2xl rounded-full animate-pulse" />
                <div className="absolute -top-4 w-16 h-2 bg-slate-700 rounded-full overflow-hidden border border-white/20 z-20">
                    <div 
                        className="h-full bg-red-500 transition-all duration-200"
                        style={{ width: `${((bossData?.hp || 0) / BOSS_HP_MAX) * 100}%` }}
                    />
                </div>
                <div className="w-24 h-24 bg-purple-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.6)] border-4 border-purple-500 animate-bounce relative z-10">
                    <Skull className="w-12 h-12 text-white fill-current" />
                </div>
            </div>
        );
      case 'freeze':
        return (
            <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full animate-pulse" />
                <div className="w-20 h-20 bg-cyan-200 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(165,243,252,0.8)] border-4 border-white animate-pulse relative z-10">
                    <Snowflake className="w-10 h-10 text-cyan-600 fill-current animate-spin-slow" />
                </div>
            </div>
        );
      case 'bonus':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
             <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full animate-pulse" />
             <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.6)] border-4 border-yellow-200 animate-pulse relative z-10">
                <Zap className="w-10 h-10 text-black fill-current" />
             </div>
          </div>
        );
      case 'trap':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
             <div className="absolute inset-0 bg-red-500/40 blur-xl rounded-full animate-pulse" />
             <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.6)] border-4 border-red-400 relative z-10">
                <Bomb className="w-10 h-10 text-white fill-current animate-bounce" />
             </div>
          </div>
        );
      case 'coin':
        return (
           <div className="w-full h-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-yellow-400/40 blur-xl rounded-full animate-pulse" />
              <img 
                src={ASSETS.coin} 
                alt="Coin" 
                className="w-[80%] h-[80%] object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce pointer-events-none select-none relative z-10"
              />
           </div>
        );
      case 'clock':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
             <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
             <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] border-4 border-blue-300 animate-pulse relative z-10">
                <Clock className="w-10 h-10 text-white fill-current" />
             </div>
          </div>
        );
      case 'shield':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
             <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full animate-pulse" />
             <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] border-4 border-cyan-300 animate-pulse relative z-10">
                <Shield className="w-10 h-10 text-white fill-current" />
             </div>
          </div>
        );
      default:
        return (
           <div className="w-full h-full flex items-center justify-center relative">
              <img 
                src={ASSETS.villain[Math.floor(Math.random() * ASSETS.villain.length)]} 
                alt="Villain" 
                className="w-[90%] h-[90%] object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] filter hover:brightness-125 hover:scale-105 transition-all duration-75 select-none pointer-events-none rounded-full relative z-10"
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_VILLAIN; }}
              />
           </div>
        );
    }
  };

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

        <div className="grid grid-cols-3 gap-3 sm:gap-4 h-full">
            {Array.from({ length: GRID_SIZE }).map((_, index) => (
              <div 
                key={index}
                className="relative group"
                onMouseDown={(e) => handleWhack(index, e)}
                onTouchStart={(e) => handleWhack(index, e)}
              >
                <div className="absolute inset-0 bg-black/60 rounded-full transform scale-x-100 scale-y-90 translate-y-2 border-b-4 border-white/5 shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] ring-4 ring-slate-800" />
                
                <div className="absolute inset-0 rounded-full overflow-hidden">
                    <AnimatePresence mode='wait'>
                        {activeHoles[index] && (
                            <motion.div
                                key={`${index}-${activeHoles[index]}`}
                                initial={{ y: "110%" }}
                                animate={{ y: "10%" }}
                                exit={{ y: "110%" }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            >
                                {getMoleContent(activeHoles[index], index)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none rounded-b-full opacity-50" />
              </div>
            ))}
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
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-red-600" />

              <div className="flex justify-center mb-6">
                 <div className="p-4 rounded-full bg-yellow-500/20 text-yellow-400 ring-4 ring-yellow-500/20 animate-bounce">
                   <Trophy size={48} />
                 </div>
              </div>
              
              <h2 className="text-3xl font-black uppercase mb-2 text-white">
                Time's Up!
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8 bg-black/20 p-4 rounded-xl">
                 <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold">Final Score</div>
                    <div className="text-4xl font-black text-yellow-400">{score}</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold">High Score</div>
                    <div className="text-4xl font-black text-purple-400">{Math.max(score, highScore)}</div>
                 </div>
                 <div className="text-center col-span-2 mt-2 border-t border-slate-700 pt-2">
                    <div className="text-xs text-slate-500 uppercase font-bold">Coins Collected</div>
                    <div className="text-2xl font-black text-yellow-300 flex items-center justify-center gap-2">
                        <Coins className="w-6 h-6" /> {coins}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/game/villain-hunt')}
                  className="w-full py-4 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider transition-colors bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2"
                >
                  <Home size={18} />
                  Home
                </button>
                
                <button
                  onClick={startGame}
                  className="w-full py-4 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                >
                  <RotateCcw size={18} />
                  Play Again
                </button>
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
