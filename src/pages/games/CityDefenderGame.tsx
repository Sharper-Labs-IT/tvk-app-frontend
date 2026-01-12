import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, RotateCcw, Home, Trophy, Shield, Clock, Bomb, Crosshair, Play, Skull, Timer } from 'lucide-react';
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
            TVK CITY DEFENDER
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
type GameMode = 'classic' | 'blitz' | 'hardcore';
type GameState = 'start' | 'playing' | 'gameover';

interface Enemy {
  id: number;
  x: number;
  y: number;
  type: 'villain1' | 'villain2' | 'alien' | 'villain3';
  speed: number;
  angle: number;
  category: 'air' | 'ground';
  frozen?: boolean;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'shield' | 'slow' | 'nuke' | 'auto';
  vx: number;
  vy: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  scale?: number;
}

// --- Constants ---
const CENTER_X = 50;
const CENTER_Y = 50;
const BASE_SPAWN_RATE = 1500;

const COMBO_SCENARIOS = [
  { alien: "He's too fast!", vijay: "I am Waiting!" },
  { alien: "We can't hit him!", vijay: "Thalaiva!" },
  { alien: "Retreat!", vijay: "Unstoppable!" },
  { alien: "Impossible!", vijay: "Victory is Ours!" },
  { alien: "My eyes!", vijay: "Mass!" },
  { alien: "What is this power?", vijay: "Class!" },
  { alien: "Run away!", vijay: "Theri!" },
];

const ENEMY_TYPES = [
  { type: 'villain1', img: '/img/enemy1.png', speed: 0.2, score: 10, category: 'air' },
  { type: 'villain2', img: '/img/enemy2.png', speed: 0.12, score: 20, category: 'ground' },
  { type: 'alien', img: '/img/angry-alien.webp', speed: 0.25, score: 30, category: 'air' },
  { type: 'villain3', img: '/img/enemy3.png', speed: 0.3, score: 15, category: 'ground' },
] as const;

const CityDefenderGame: React.FC = () => {
  const navigate = useNavigate();
  
  // --- Loading State ---
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // --- State ---
  const [gameState, setGameState] = useState<GameState>('start');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [rage, setRage] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // For Blitz mode
  
  // Game Entities
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  
  // Active Effects
  const [isRageActive, setIsRageActive] = useState(false);
  const [activeShield, setActiveShield] = useState(false);
  const [timeSlow, setTimeSlow] = useState(false);
  const [autoAttack, setAutoAttack] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);

  // Inventory
  const [inventory, setInventory] = useState<PowerUp['type'][]>([]);

  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'vijay' | 'alien'>('vijay');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSide, setFeedbackSide] = useState<'left' | 'right'>('right'); 
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [totalTrophies, setTotalTrophies] = useState<number>(0);

  // Refs
  const enemiesRef = useRef<Enemy[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const frameRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerUpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAttackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const activeShieldRef = useRef(false); 
  const gameStateRef = useRef<GameState>('start');
  const gameModeRef = useRef<GameMode>('classic');
  const comboRef = useRef(0);
  const rageRef = useRef(0);

  // --- Helpers ---
  // --- Preload Images ---
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = [
        ...ENEMY_TYPES.map(e => e.img),
        '/img/game-bg.webp',
        '/img/Game.png',
        '/img/angry-vijay.png',
        '/img/angry-alien.webp',
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

  // --- Helpers ---
  const addFloatingText = (x: number, y: number, text: string, color: string = 'text-yellow-400', scale: number = 1, duration: number = 1000) => {
    const newText = { id: Date.now() + Math.random(), x, y, text, color, scale };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, duration);
  };

  const triggerShake = () => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);
  };

  // --- Spawning Logic ---
  const spawnEntity = useCallback((isPowerUp = false) => {
    if (gameStateRef.current !== 'playing') return;

    const edge = Math.floor(Math.random() * 4);
    let startX = 0, startY = 0;

    switch (edge) {
      case 0: startX = Math.random() * 100; startY = -10; break;
      case 1: startX = 110; startY = Math.random() * 100; break;
      case 2: startX = Math.random() * 100; startY = 110; break;
      case 3: startX = -10; startY = Math.random() * 100; break;
    }

    if (isPowerUp) {
      const types: PowerUp['type'][] = ['shield', 'slow', 'nuke', 'auto'];
      // Random spawn within 10-90% of screen
      const spawnX = 10 + Math.random() * 80;
      const spawnY = 10 + Math.random() * 80;
      
      const newPowerUp: PowerUp = {
        id: Date.now(),
        x: spawnX,
        y: spawnY,
        type: types[Math.floor(Math.random() * types.length)],
        // Random drift velocity
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05
      };
      powerUpsRef.current.push(newPowerUp);
      setPowerUps([...powerUpsRef.current]);
    } else {
      const dx = CENTER_X - startX;
      const dy = CENTER_Y - startY;
      const angle = Math.atan2(dy, dx);
      const typeIdx = Math.floor(Math.random() * ENEMY_TYPES.length);
      const enemyType = ENEMY_TYPES[typeIdx];

      // Hardcore mode speed boost
      const speedMultiplier = gameModeRef.current === 'hardcore' ? 1.5 : 1;

      const newEnemy: Enemy = {
        id: Date.now() + Math.random(),
        x: startX,
        y: startY,
        type: enemyType.type,
        speed: enemyType.speed * speedMultiplier,
        angle: angle,
        category: enemyType.category
      };
      enemiesRef.current.push(newEnemy);
      setEnemies([...enemiesRef.current]);
    }
  }, []);

  // --- Game Loop ---
  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    // 1. Handle Enemies
    const currentEnemies = enemiesRef.current;
    const nextEnemies: Enemy[] = [];
    let damageTaken = false;

    currentEnemies.forEach(enemy => {
      const speedModifier = timeSlow ? 0.2 : 1;
      
      enemy.x += Math.cos(enemy.angle) * enemy.speed * speedModifier;
      enemy.y += Math.sin(enemy.angle) * enemy.speed * speedModifier;

      const dist = Math.sqrt(Math.pow(enemy.x - CENTER_X, 2) + Math.pow(enemy.y - CENTER_Y, 2));
      
      if (dist < 20) { 
        if (!activeShieldRef.current) {
          damageTaken = true;
        } else {
          // Shield absorbs hit
          addFloatingText(50, 50, "BLOCKED!", "text-blue-400 font-bold");
        }
      } else {
        nextEnemies.push(enemy);
      }
    });

    if (damageTaken) {
      triggerShake();
      setCombo(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) endGame();
        return newLives;
      });
    }

    enemiesRef.current = nextEnemies;
    setEnemies([...nextEnemies]);

    // 2. Handle Powerups
    const currentPowerUps = powerUpsRef.current;
    const nextPowerUps: PowerUp[] = [];
    currentPowerUps.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce off edges (keep within 5-95%)
      if (p.x <= 5 || p.x >= 95) p.vx *= -1;
      if (p.y <= 5 || p.y >= 95) p.vy *= -1;

      // Keep alive if within bounds (or just keep them alive until clicked/timeout)
      // We'll just keep them floating
      nextPowerUps.push(p);
    });
    powerUpsRef.current = nextPowerUps;
    setPowerUps([...nextPowerUps]);

    frameRef.current = requestAnimationFrame(gameLoop);
  }, [timeSlow]);

  const triggerConversation = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const scenario = COMBO_SCENARIOS[Math.floor(Math.random() * COMBO_SCENARIOS.length)];
    
    setFeedbackType('alien');
    setFeedbackText(scenario.alien);
    setFeedbackSide('left');
    setShowFeedback(true);

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackType('vijay');
      setFeedbackText(scenario.vijay);
      setFeedbackSide('right');
      
      feedbackTimeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 2500);
    }, 2000);
  };

  const activatePowerUp = (type: PowerUp['type']) => {
     switch (type) {
      case 'shield':
        setActiveShield(true);
        activeShieldRef.current = true;
        addFloatingText(50, 45, "SHIELD UP!", "text-blue-400 font-bold text-xl");
        setTimeout(() => { setActiveShield(false); activeShieldRef.current = false; }, 5000);
        break;
      case 'slow':
        setTimeSlow(true);
        addFloatingText(50, 45, "SLOW MOTION!", "text-green-400 font-bold text-xl");
        setTimeout(() => setTimeSlow(false), 4000);
        break;
      case 'nuke':
        triggerShake();
        enemiesRef.current = [];
        setEnemies([]);
        addFloatingText(50, 50, "BOOM!", "text-orange-500 font-black text-4xl");
        break;
      case 'auto':
        setAutoAttack(true);
        addFloatingText(50, 45, "AUTO FIRE!", "text-red-500 font-bold text-xl");
        // Auto attack logic
        if (autoAttackTimerRef.current) clearInterval(autoAttackTimerRef.current);
        autoAttackTimerRef.current = setInterval(() => {
            if (enemiesRef.current.length > 0) {
                const target = enemiesRef.current[0];
                handleEnemyClick(target.id, target.type, target.x, target.y);
            }
        }, 200); // Attack every 200ms
        setTimeout(() => {
            setAutoAttack(false);
            if (autoAttackTimerRef.current) clearInterval(autoAttackTimerRef.current);
        }, 5000);
        break;
    }
  };

  const usePowerUp = (index: number) => {
    if (gameStateRef.current !== 'playing') return;
    
    const type = inventory[index];
    // Remove from inventory
    const newInventory = [...inventory];
    newInventory.splice(index, 1);
    setInventory(newInventory);

    // Activate PowerUp
    activatePowerUp(type);
  };

  // --- Interactions ---

  const handleEnemyClick = (id: number, type: string, x: number, y: number) => {
    if (gameStateRef.current !== 'playing' || isRageActive) return;

    const enemyConfig = ENEMY_TYPES.find(e => e.type === type);
    let points: number = enemyConfig ? enemyConfig.score : 10;
    
    // Blitz Mode: Double Points
    if (gameModeRef.current === 'blitz') points *= 2;

    // Combo Multiplier
    const multiplier = 1 + (Math.floor(comboRef.current / 5) * 0.5);
    points = Math.floor(points * multiplier);

    setScore(prev => {
      const newScore = prev + points;
      scoreRef.current = newScore;
      return newScore;
    });

    setRage(prev => {
        const newRage = Math.min(prev + 5, 100);
        rageRef.current = newRage;
        return newRage;
    });
    
    setCombo(prev => {
        const newCombo = prev + 1;
        comboRef.current = newCombo;
        // Hero Quote on high combo (every 5 hits)
        if (newCombo % 5 === 0) {
            triggerConversation();
        }
        return newCombo;
    });

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
        setCombo(0);
        comboRef.current = 0;
    }, 2500);

    addFloatingText(x, y, `+${points}`, multiplier > 1 ? 'text-purple-400' : 'text-yellow-400');

    enemiesRef.current = enemiesRef.current.filter(e => e.id !== id);
    setEnemies([...enemiesRef.current]);
  };

  const handlePowerUpClick = (id: number, type: PowerUp['type']) => {
    if (gameStateRef.current !== 'playing') return;
    
    powerUpsRef.current = powerUpsRef.current.filter(p => p.id !== id);
    setPowerUps([...powerUpsRef.current]);

    // Add to inventory if space
    setInventory(prev => {
        if (prev.length < 3) {
            return [...prev, type];
        }
        return prev;
    });
  };

  const activateRage = () => {
    if (rage < 100) return;
    
    setIsRageActive(true);
    setRage(0);
    triggerShake();
    
    enemiesRef.current = [];
    setEnemies([]);
    
    addFloatingText(50, 50, "THALAIVA MODE!", "text-yellow-500 font-black text-5xl", 2);

    setTimeout(() => {
      setIsRageActive(false);
    }, 4000);
  };

  const startGame = async (mode: GameMode) => {
    try {
      const response = await gameService.joinGame(GAME_IDS.CITY_DEFENDER);
      setParticipantId(response.participant.id);
    } catch (error) {
      return;
    }

    setScoreSubmitted(false);
    setGameMode(mode);
    gameModeRef.current = mode;
    setGameState('playing');
    gameStateRef.current = 'playing';
    setScore(0);
    setRage(0);
    setCombo(0);
    setEnemies([]);
    setPowerUps([]);
    enemiesRef.current = [];
    powerUpsRef.current = [];
    
    if (mode === 'hardcore') setLives(1);
    else setLives(5);

    if (mode === 'blitz') {
        setTimeLeft(60);
        gameTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    spawnTimerRef.current = setInterval(() => spawnEntity(false), BASE_SPAWN_RATE);
    powerUpTimerRef.current = setInterval(() => spawnEntity(true), 8000);
    frameRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    setGameState('gameover');
    gameStateRef.current = 'gameover';
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (powerUpTimerRef.current) clearInterval(powerUpTimerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (autoAttackTimerRef.current) clearInterval(autoAttackTimerRef.current);
    if (conversationTimerRef.current) clearInterval(conversationTimerRef.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    
    if (scoreRef.current > 200) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
  };

  // --- Backend Integration ---
  const { refreshUser, user } = useAuth();
  const { isPremium } = useGameAccess();

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
    if (gameState === 'gameover' && participantId && !scoreSubmitted) {
      const submitGameScore = async () => {
        try {
          setScoreSubmitted(true);
          // City Defender awards score as coins
          const earnedCoins = Math.floor(score / 10); // Convert score to coins
          await gameService.submitScore(participantId, {
            score: score,
            coins: earnedCoins,
            data: { rage: rage }
          });
          
          // Refresh user data from backend to get updated coins and trophies
          await refreshUser();
        } catch (error) {
          setScoreSubmitted(false);
        }
      };
      submitGameScore();
    }
  }, [gameState, score, rage, participantId, scoreSubmitted, refreshUser]);

  // --- Effects ---
  useEffect(() => {
    if (gameState === 'playing') {
        // Start continuous conversation loop
        const startDelay = setTimeout(() => {
            triggerConversation();
            conversationTimerRef.current = setInterval(() => {
                triggerConversation();
            }, 8000); // Every 8 seconds
        }, 2000);

        return () => {
            clearTimeout(startDelay);
            if (conversationTimerRef.current) clearInterval(conversationTimerRef.current);
        };
    } else {
        if (conversationTimerRef.current) clearInterval(conversationTimerRef.current);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
        frameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [gameState, gameLoop]);

  // --- Loading Screen ---
  if (!assetsLoaded) {
    return <GamingLoader progress={loadingProgress} />;
  }

  return (
    <div className={`min-h-screen bg-gray-900 relative overflow-hidden touch-none select-none ${shakeScreen ? 'animate-shake' : ''}`}>
      
      {/* Background */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${lives === 1 ? 'opacity-80 bg-red-900/20' : 'opacity-30'}`}
        style={{
          backgroundImage: "url('/img/game-bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1
        }}
      />

      {/* --- Start Screen --- */}
      <AnimatePresence>
        {gameState === 'start' && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 mb-2 md:mb-4 drop-shadow-lg">
                        CITY DEFENDER
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl">Protect the city. Become the Hero.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                    {/* Classic Mode */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startGame('classic')}
                        className="bg-gray-800 border-2 border-blue-500/50 p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-gray-700 transition-colors group"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
                            <Play className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">Classic</h3>
                            <p className="text-sm text-gray-400">Endless defense. 5 Lives.</p>
                        </div>
                    </motion.button>

                    {/* Blitz Mode */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startGame('blitz')}
                        className="bg-gray-800 border-2 border-yellow-500/50 p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-gray-700 transition-colors group"
                    >
                        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/40 transition-colors">
                            <Timer className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">Blitz</h3>
                            <p className="text-sm text-gray-400">60 Seconds. Double Points.</p>
                        </div>
                    </motion.button>

                    {/* Hardcore Mode */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startGame('hardcore')}
                        className="bg-gray-800 border-2 border-red-500/50 p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-gray-700 transition-colors group"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/40 transition-colors">
                            <Skull className="w-8 h-8 text-red-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">Hardcore</h3>
                            <p className="text-sm text-gray-400">1 Life. Faster Enemies.</p>
                        </div>
                    </motion.button>
                </div>
                
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/games')}
                    className="mt-8 px-8 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                    <Home className="w-5 h-5" />
                    Back to Menu
                </motion.button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- UI HUD --- */}
      {gameState === 'playing' && (
        <>
        {/* Conversation / Feedback UI */}
        <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-20 md:top-24 z-50 flex w-full px-2 md:px-12 pointer-events-none ${
              feedbackSide === 'right' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`flex items-end gap-2 md:gap-4 ${feedbackSide === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-12 h-12 md:w-24 md:h-24 rounded-full border-2 md:border-4 shadow-lg overflow-hidden bg-black ${
                    feedbackType === 'vijay' ? 'border-yellow-400' : 'border-red-500'
                }`}>
                    <img 
                        src={feedbackType === 'vijay' ? '/img/Game.png' : '/img/angry-alien.webp'} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Speech Bubble */}
                <motion.div
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className={`relative px-6 py-3 rounded-2xl border-2 shadow-xl ${
                     feedbackType === 'vijay' 
                       ? 'bg-yellow-400 border-yellow-200 text-black' 
                       : 'bg-red-600 border-red-400 text-white'
                   }`}
                 >
                    <p className="font-black uppercase italic text-sm md:text-xl whitespace-nowrap">
                      "{feedbackText}"
                    </p>
                    
                    {/* Tail */}
                    <div className={`absolute w-4 h-4 transform border-r-2 border-b-2 ${
                       feedbackType === 'vijay' ? 'bg-yellow-400 border-yellow-200' : 'bg-red-600 border-red-400'
                    } ${
                        feedbackSide === 'right' 
                          ? 'right-[-8px] bottom-4 -rotate-45'
                          : 'left-[-8px] bottom-4 rotate-[135deg]'
                    }`}></div>
                 </motion.div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Inventory UI */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2 md:gap-4 pointer-events-auto">
            {[0, 1, 2].map((index) => (
                <div 
                    key={index}
                    onClick={() => inventory[index] && usePowerUp(index)}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center transition-all ${
                        inventory[index] 
                            ? 'bg-black/60 border-yellow-400 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                            : 'bg-black/30 border-white/20'
                    }`}
                >
                    {inventory[index] && (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            inventory[index] === 'shield' ? 'bg-blue-500' :
                            inventory[index] === 'slow' ? 'bg-green-500' :
                            inventory[index] === 'nuke' ? 'bg-orange-500' :
                            'bg-purple-500'
                        }`}>
                            {inventory[index] === 'shield' && <Shield className="w-6 h-6 text-white" />}
                            {inventory[index] === 'slow' && <Clock className="w-6 h-6 text-white" />}
                            {inventory[index] === 'nuke' && <Bomb className="w-6 h-6 text-white" />}
                            {inventory[index] === 'auto' && <Crosshair className="w-6 h-6 text-white" />}
                        </div>
                    )}
                    {/* Slot Number */}
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 rounded-full text-[10px] flex items-center justify-center text-white border border-gray-500">
                        {index + 1}
                    </div>
                </div>
            ))}
        </div>

        {/* Big Combo Display */}
        <AnimatePresence>
            {combo > 1 && (
                <motion.div
                    initial={{ scale: 0, y: -50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key="combo-display"
                    className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none"
                >
                    <div className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-pulse">
                        {combo}x
                    </div>
                    <div className="text-2xl font-bold text-white tracking-widest uppercase drop-shadow-md">
                        COMBO!
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
            
            {/* Left Stats */}
            <div className="flex flex-col gap-2">
            {/* Score Board */}
            <div className="bg-black/60 backdrop-blur-md px-3 py-2 md:px-5 md:py-3 rounded-2xl border border-white/10 text-white flex flex-col items-start gap-1 shadow-lg">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                    <span className="text-sm md:text-xl font-black tracking-wider">{score}</span>
                </div>
                {gameMode === 'blitz' && (
                    <div className={`text-lg font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        Time: {timeLeft}s
                    </div>
                )}
            </div>

            {/* Lives */}
            <div className="flex gap-1 mt-1">
                {[...Array(gameMode === 'hardcore' ? 1 : 5)].map((_, i) => (
                <Heart 
                    key={i} 
                    className={`w-4 h-4 md:w-6 md:h-6 transition-all duration-300 ${i < lives ? 'text-red-500 fill-red-500 scale-100' : 'text-gray-700 scale-75'}`} 
                />
                ))}
            </div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-col items-end gap-4 pointer-events-auto">
            <button 
                onClick={() => setGameState('start')}
                className="bg-white/10 p-2 rounded-full hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            >
                <Home className="w-6 h-6" />
            </button>
            
            {/* Ultimate / Rage Meter */}
            <div className="flex flex-col items-center gap-1">
                <div 
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${rage >= 100 ? 'scale-110 cursor-pointer hover:scale-125 shadow-[0_0_30px_rgba(234,179,8,0.8)]' : 'opacity-80'}`}
                    onClick={activateRage}
                >
                    {/* Meter Ring */}
                    <svg className="w-full h-full -rotate-90 drop-shadow-lg">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="black" className="text-black/50" />
                    <circle 
                        cx="40" cy="40" r="36" 
                        stroke="currentColor" 
                        strokeWidth="6" 
                        fill="transparent" 
                        className={`${rage >= 100 ? 'text-yellow-400' : 'text-blue-500'} transition-all duration-300`}
                        strokeDasharray={226}
                        strokeDashoffset={226 - (226 * rage) / 100}
                        strokeLinecap="round"
                    />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {rage >= 100 ? (
                            <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400 animate-bounce" />
                        ) : (
                            <span className="text-white font-bold text-xs">{rage}%</span>
                        )}
                    </div>
                </div>
                {rage >= 100 && <span className="text-yellow-400 font-black text-xs animate-pulse tracking-widest">BEAST MODE</span>}
            </div>
            </div>
        </div>
        </>
      )}

      {/* --- Game Area --- */}
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Floating Text Overlay */}
        {floatingTexts.map(ft => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 1, y: `${ft.y}vh`, x: `${ft.x}vw`, scale: 0.5 }}
            animate={{ opacity: 0, y: `${ft.y - 10}vh`, scale: ft.scale || 1 }}
            transition={{ duration: 0.8 }}
            className={`absolute pointer-events-none z-50 font-black text-shadow ${ft.color}`}
            style={{ fontSize: '1.5rem', textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
          >
            {ft.text}
          </motion.div>
        ))}

        {/* Hero (Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-80 md:h-80 z-30">
          {/* Shield Effect */}
          <AnimatePresence>
            {activeShield && (
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 rounded-full border-4 border-blue-400 bg-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.5)] animate-pulse-slow z-40"
                />
            )}
          </AnimatePresence>

          {/* Auto Attack Effect */}
          {autoAttack && (
             <div className="absolute inset-0 border-4 border-red-500/50 rounded-full animate-ping" />
          )}

          {/* Super Aura when Rage is active */}
          {isRageActive && (
             <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl animate-pulse scale-150" />
          )}

          <img 
            src={isRageActive ? "/img/angry-vijay.png" : "/img/Game.png"} 
            alt="Hero" 
            className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-300 ${isRageActive ? 'scale-125' : ''}`}
          />
        </div>

        {/* Powerups */}
        <AnimatePresence>
            {powerUps.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute w-12 h-12 md:w-16 md:h-16 z-[60] cursor-pointer animate-float"
                    style={{ 
                        left: `${p.x}vw`, 
                        top: `${p.y}vh`, 
                        transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => handlePowerUpClick(p.id, p.type)}
                >
                    <div className={`w-full h-full rounded-full flex items-center justify-center border-2 shadow-[0_0_20px_rgba(255,255,255,0.5)] ${
                        p.type === 'shield' ? 'bg-blue-600/80 border-blue-400' :
                        p.type === 'slow' ? 'bg-green-600/80 border-green-400' :
                        p.type === 'auto' ? 'bg-purple-600/80 border-purple-400' :
                        'bg-red-600/80 border-red-400'
                    }`}>
                        {p.type === 'shield' && <Shield className="text-white w-8 h-8" />}
                        {p.type === 'slow' && <Clock className="text-white w-8 h-8" />}
                        {p.type === 'nuke' && <Bomb className="text-white w-8 h-8" />}
                        {p.type === 'auto' && <Crosshair className="text-white w-8 h-8" />}
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>

        {/* Enemies */}
        <AnimatePresence>
          {enemies.map(enemy => {
            const enemyConfig = ENEMY_TYPES.find(e => e.type === enemy.type);
            const isBigVillain = enemy.type === 'villain2' || enemy.type === 'villain3';
            const isAir = enemy.category === 'air';
            
            return (
              <motion.div
                key={enemy.id}
                initial={isAir ? { scale: 0, opacity: 0 } : { opacity: 1 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: `${enemy.x}vw`, 
                  y: `${enemy.y}vh`,
                }}
                exit={{ scale: 1.5, opacity: 0, filter: 'brightness(2)' }} // Flash on death
                transition={{ duration: 0 }}
                className="absolute top-0 left-0"
                style={{ 
                  zIndex: isAir ? 40 : 20,
                  cursor: 'pointer',
                  filter: isAir ? 'drop-shadow(0px 40px 20px rgba(0,0,0,0.6))' : 'none'
                }}
                onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
                    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
                    handleEnemyClick(enemy.id, enemy.type, x, y);
                }}
              >
                <div 
                    className={`relative -translate-x-1/2 -translate-y-1/2 ${isAir ? 'animate-bounce-slow' : ''} ${isBigVillain ? 'w-40 h-40 md:w-80 md:h-80' : 'w-28 h-28 md:w-52 md:h-52'}`}
                >
                   <img 
                    src={enemyConfig?.img} 
                    alt="Enemy" 
                    className={`w-full h-full object-contain transition-transform ${!isAir ? 'drop-shadow-xl' : ''}`}
                    style={{ 
                      transform: `rotate(${enemy.x < 50 ? 0 : 0}deg)`,
                    }} 
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gray-900/90 border-2 border-yellow-500/50 p-6 md:p-8 rounded-[2rem] text-center max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 animate-gradient" />
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800 rounded-xl p-6">
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Final Score</p>
                  <p className="text-4xl font-bold text-yellow-400">{score}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Total Trophies</p>
                  <p className="text-4xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    {totalTrophies}
                  </p>
                </div>
              </div>

              {/* Trophy Section */}
              <div className="mb-8">
                {(() => {
                  const trophy = getTrophyFromScore('city-defender', score);
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
                Body: { game: 'city-defender', score: score, trophy: getTrophyFromScore('city-defender', score) }
              */}

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setGameState('start')}
                  className="px-6 py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-all active:scale-95"
                >
                  Menu
                </button>
                {isPremium && (
                  <button 
                    onClick={() => startGame(gameMode)}
                    className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-lg hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-6 h-6" />
                    REPLAY
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS for custom animations */}
      <style>{`
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default CityDefenderGame;