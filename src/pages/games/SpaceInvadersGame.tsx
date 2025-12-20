import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Play, Pause, Volume2, VolumeX, SkipForward, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
/* import { getTrophyFromScore, getTrophyIcon, getTrophyColor } from '../../utils/trophySystem'; */
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
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            TVK SPACE INVADERS
          </h1>
          <p className="text-slate-400 text-xs md:text-sm tracking-[0.3em] uppercase mt-2 font-bold">
            System Initialization
          </p>
        </motion.div>

        {/* Progress Bar Container */}
        <div className="w-full h-3 md:h-4 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 backdrop-blur-sm relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {/* Animated Progress Fill */}
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-300 relative"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/20" />
            <motion.div 
              className="absolute top-0 bottom-0 w-10 bg-white/30 skew-x-[-20deg] blur-sm"
              animate={{ x: ["-100%", "500%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Percentage & Status Text */}
        <div className="w-full flex justify-between items-center mt-3 font-mono text-[10px] md:text-sm text-yellow-500/80">
          <span className="animate-pulse">LOADING ASSETS...</span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

// --- STORY CONTENT ---
const STORY_LINES = [
  "The year is 2026...",
  "The Galaxy of Truth is under siege",
  "The 'Haters' Fleet has blocked out the sun",
  "They believe their negativity is absolute",
  "But one spark remains...",
  "One warrior who fights not for himself...",
  "But for the people",
  "COMMANDER VJ",
  "The time has come to break the silence",
  "MISSION: PROTECT THE GALAXY"
];

// Game Constants
const DEFAULT_CANVAS_WIDTH = 1280;
const DEFAULT_CANVAS_HEIGHT = 960; // Desktop aspect ratio (4:3)
const MOBILE_CANVAS_HEIGHT = 1920; // Mobile aspect ratio (Tall)

// UPDATED SIZES:
const PLAYER_WIDTH = 200; 
const PLAYER_HEIGHT = 260; 
const BULLET_WIDTH = 8; 
const BULLET_HEIGHT = 30; 
const ENEMY_WIDTH = 90; 
const ENEMY_HEIGHT = 90; 
const ENEMY_ROWS = 4;
const ENEMY_COLS = 10;
const PARTICLE_COUNT = 15;

const KILL_SCENARIOS = [
  { alien: "Unit 45 destroyed! He's too strong!", vijay: "I am the storm that is approaching!" },
  { alien: "Our defenses are crumbling!", vijay: "Your tyranny ends today!" },
  { alien: "He is wiping us out!", vijay: "For every tear shed, you will pay!" },
  { alien: "Retreat! He is unstoppable!", vijay: "There is no escape from justice!" },
  { alien: "My brother! You will pay!", vijay: "Don't start a war you can't win!" },
  { alien: "Impossible! Our fleet is infinite!", vijay: "Then I will fight for eternity!" },
  { alien: "He fights like a demon!", vijay: "I fight with the heart of a lion!" },
  { alien: "Stop him! He's breaking the formation!", vijay: "Your formation is as weak as your cause!" },
  { alien: "We are losing ground!", vijay: "This is my land! Get out!" },
  { alien: "How does he have this power?", vijay: "The power of the people is with me!" },
  { alien: "Another unit down! Reinforcements!", vijay: "Send them all! I am ready!" },
  { alien: "He is relentless!", vijay: "I will not rest until you are gone!" },
  { alien: "Our technology is superior!", vijay: "But your spirit is hollow!" }
];

const HIT_SCENARIOS = [
  { alien: "Direct hit! His shield is failing!", vijay: "Pain only makes me stronger!" },
  { alien: "Look at him bleed!", vijay: "I bleed for my people. I will not fall!" },
  { alien: "Give up, earthling!", vijay: "I will never kneel before you!" },
  { alien: "Target acquired. He is weak!", vijay: "You mistake my silence for weakness!" },
  { alien: "Got him! Finish him off!", vijay: "I am just warming up!" },
  { alien: "He is slowing down!", vijay: "I'm just catching my breath!" },
  { alien: "Shields critical! Finish him!", vijay: "My will is my shield!" },
  { alien: "You cannot win this war!", vijay: "I have already won the hearts of the people!" },
  { alien: "Feel the burn of our lasers!", vijay: "This fire only fuels my rage!" },
  { alien: "One more hit and he is done!", vijay: "I can do this all day!" },
  { alien: "Your resistance is futile!", vijay: "Resistance is my duty!" },
  { alien: "See? You are mortal!", vijay: "Mortal, but my legacy is eternal!" }
];

const START_SCENARIOS = [
  { alien: "Prepare for annihilation!", vijay: "I will protect this galaxy!" },
  { alien: "Surrender now, earthling!", vijay: "Never! I stand for justice!" },
  { alien: "Your world is ours!", vijay: "Not while I'm still standing!" },
  { alien: "Finish him!", vijay: "Bring it on!" },
  { alien: "We have come to conquer!", vijay: "And you will leave in defeat!" },
  { alien: "Bow before your new masters!", vijay: "I bow to no one but the people!" },
  { alien: "This planet is ripe for the taking!", vijay: "You'll have to go through me first!" },
  { alien: "Fear us!", vijay: "I fear nothing but failure!" },
  { alien: "Your time is up, hero!", vijay: "My time has just begun!" },
  { alien: "Look at the little hero trying to save them.", vijay: "Watch closely, you might learn something." }
];

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;
}

interface Enemy extends GameObject {
  type: number;
}

interface Bullet extends GameObject {
  dy: number;
}

interface Coin extends GameObject {
  dy: number;
  value: number;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

const SpaceInvadersGame: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Dynamic Game Dimensions ---
  const [gameWidth] = useState(DEFAULT_CANVAS_WIDTH);
  const [gameHeight, setGameHeight] = useState(DEFAULT_CANVAS_HEIGHT);

  useEffect(() => {
    const handleResize = () => {
      // If mobile portrait, use tall aspect ratio
      if (window.innerHeight > window.innerWidth) {
        setGameHeight(MOBILE_CANVAS_HEIGHT);
      } else {
        setGameHeight(DEFAULT_CANVAS_HEIGHT);
      }
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // --- Loading State ---
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [gameState, setGameState] = useState<
    'intro' | 'start' | 'playing' | 'paused' | 'gameover' | 'victory'
  >('intro');
  const [isMuted, setIsMuted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [participantId, setParticipantId] = useState<number | null>(null);

  // --- Backend Integration ---
  const { refreshUser, user } = useAuth();
  const { isPremium } = useGameAccess();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [totalTrophies, setTotalTrophies] = useState<number>(0);

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
    if ((gameState === 'gameover' || gameState === 'victory') && participantId && collectedCoins > 0 && !scoreSubmitted) {
      const submitGameScore = async () => {
        try {
          setScoreSubmitted(true);
          await gameService.submitScore(participantId, {
            score: score,
            coins: collectedCoins,
            data: { lives: lives }
          });
          await refreshUser();
        } catch (error) {
          setScoreSubmitted(false);
        }
      };
      submitGameScore();
    }
  }, [gameState, score, collectedCoins, lives, participantId, scoreSubmitted, refreshUser]);

  // --- Story State ---
  const [storyIndex, setStoryIndex] = useState(0);

  // --- Feedback State ---
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'vijay' | 'alien'>('vijay');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSide, setFeedbackSide] = useState<'left' | 'right'>('right'); 
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFeedbackTimeRef = useRef(0);

  // Assets Refs
  const playerImageRef = useRef<HTMLImageElement>(new Image());
  const enemyImageRef = useRef<HTMLImageElement>(new Image());
  const backgroundImageRef = useRef<HTMLImageElement>(new Image());

  // Game State Refs
  const playerRef = useRef<GameObject>({
    x: 0, // Set in initGame
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    color: '#DC2626',
    active: true,
  });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastShotTimeRef = useRef(0);
  const lastEnemyShotTimeRef = useRef(0);
  const enemyDirectionRef = useRef(1);
  const enemyMoveTimerRef = useRef(0);
  const enemyMoveIntervalRef = useRef(1000);
  const animationFrameRef = useRef<number>(0);

  // --- Preload Images ---
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = [
        '/img/r.webp',
        '/img/angry-alien.webp',
        '/img/space.webp',
        '/img/angry-vijay.png',
        '/img/game-over.webp',
        '/img/game-won.webp',
        '/img/sad.png',
        '/img/happy.webp'
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

  // Initialize Assets
  useEffect(() => {
    if (!assetsLoaded) return;

    playerImageRef.current.src = '/img/r.webp';
    enemyImageRef.current.src = '/img/angry-alien.webp';
    backgroundImageRef.current.src = '/img/space.webp';
    
    // Initialize Stars
    const stars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * gameWidth,
        y: Math.random() * gameHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5,
        brightness: Math.random(),
      });
    }
    starsRef.current = stars;
  }, [assetsLoaded, gameWidth, gameHeight]);

  // --- Story Logic ---
  const advanceStory = () => {
    if (storyIndex < STORY_LINES.length - 1) {
      setStoryIndex(prev => prev + 1);
    } else {
      setGameState('start');
    }
  };

  const skipStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGameState('start');
  };

  useEffect(() => {
    if (gameState !== 'intro') return;
    const timer = setTimeout(() => {
        advanceStory();
    }, 4000);
    return () => clearTimeout(timer);
  }, [gameState, storyIndex]);


  const triggerConversation = (type: 'kill' | 'hit' | 'start') => {
    const now = Date.now();
    if (type !== 'start' && now - lastFeedbackTimeRef.current < 4000) return; 

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const scenarios = type === 'kill' ? KILL_SCENARIOS : type === 'hit' ? HIT_SCENARIOS : START_SCENARIOS;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    setFeedbackType('alien');
    setFeedbackText(scenario.alien);
    setFeedbackSide('left');
    setShowFeedback(true);
    lastFeedbackTimeRef.current = now;

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackType('vijay');
      setFeedbackText(scenario.vijay);
      setFeedbackSide('right');
      
      feedbackTimeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }, 2000);
  };

  const initEnemies = () => {
    const enemies: Enemy[] = [];
    const enemyGap = 20;
    const totalEnemyWidth = ENEMY_COLS * ENEMY_WIDTH + (ENEMY_COLS - 1) * enemyGap;
    const startX = (gameWidth - totalEnemyWidth) / 2;

    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        enemies.push({
          x: startX + col * (ENEMY_WIDTH + enemyGap),
          y: 80 + row * (ENEMY_HEIGHT + enemyGap),
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          color: row === 0 ? '#ff0000' : row === 1 ? '#ff00ff' : '#00ffff',
          active: true,
          type: row,
        });
      }
    }
    enemiesRef.current = enemies;
    enemyMoveIntervalRef.current = 400; // Increased speed from 800
  };

  const initGame = async () => {
    try {
      const response = await gameService.joinGame(GAME_IDS.SPACE_INVADERS);
      setParticipantId(response.participant.id);
    } catch (error) {
      return;
    }

    setScoreSubmitted(false);
    setScore(0);
    setLives(3);
    setCollectedCoins(0);
    
    // IMPORTANT: Reset player position based on CURRENT gameHeight
    playerRef.current = {
      x: gameWidth / 2 - PLAYER_WIDTH / 2,
      y: gameHeight - PLAYER_HEIGHT - 20, // Bottom margin
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: '#DC2626',
      active: true,
    };
    
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    initEnemies();
    setGameState('playing');
    setTimeout(() => triggerConversation('start'), 500);
  };

  const playSound = (_: 'shoot' | 'explosion' | 'win' | 'lose' | 'coin') => {
    if (isMuted) return;
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (gameState === 'intro' || gameState === 'start') {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx) {
             ctx.fillStyle = '#000000';
             ctx.fillRect(0, 0, gameWidth, gameHeight);
          }
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const update = (timestamp: number) => {
      ctx.clearRect(0, 0, gameWidth, gameHeight);
      
      // Draw Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, gameWidth, gameHeight);

      // Update and Draw Stars
      ctx.fillStyle = '#ffffff';
      starsRef.current.forEach(star => {
        star.y += star.speed;
        if (star.y > gameHeight) {
          star.y = 0;
          star.x = Math.random() * gameWidth;
        }
        ctx.globalAlpha = 0.5 + Math.sin(timestamp * 0.005 + star.x) * 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Player Movement
      if (keysRef.current['ArrowLeft'] && playerRef.current.x > 0) {
        playerRef.current.x -= 5;
      }
      if (keysRef.current['ArrowRight'] && playerRef.current.x < gameWidth - PLAYER_WIDTH) {
        playerRef.current.x += 5;
      }

      // Keep Player at correct bottom position (in case of resize mid-game)
      playerRef.current.y = gameHeight - PLAYER_HEIGHT - 20;

      // Player Shooting
      if (keysRef.current['Space'] && timestamp - lastShotTimeRef.current > 300) {
        bulletsRef.current.push({
          x: playerRef.current.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
          y: playerRef.current.y,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          color: '#ffff00',
          active: true,
          dy: -8,
        });
        lastShotTimeRef.current = timestamp;
        playSound('shoot');
      }

      // Update Bullets
      bulletsRef.current.forEach((bullet) => {
        bullet.y += bullet.dy;
        if (bullet.y < 0) bullet.active = false;
      });
      bulletsRef.current = bulletsRef.current.filter((b) => b.active);

      // Enemy Movement Logic
      if (timestamp - enemyMoveTimerRef.current > enemyMoveIntervalRef.current) {
        let touchEdge = false;
        enemiesRef.current.forEach((enemy) => {
          if (!enemy.active) return;
          if (
            (enemy.x <= 0 && enemyDirectionRef.current === -1) ||
            (enemy.x >= gameWidth - ENEMY_WIDTH && enemyDirectionRef.current === 1)
          ) {
            touchEdge = true;
          }
        });

        if (touchEdge) {
          enemyDirectionRef.current *= -1;
          enemiesRef.current.forEach((enemy) => {
            enemy.y += 20;
            if (enemy.active && enemy.y + enemy.height >= playerRef.current.y) {
              setGameState('gameover');
              playSound('lose');
            }
          });
          enemyMoveIntervalRef.current = Math.max(100, enemyMoveIntervalRef.current * 0.9);
        } else {
          enemiesRef.current.forEach((enemy) => {
            enemy.x += 20 * enemyDirectionRef.current;
          });
        }
        enemyMoveTimerRef.current = timestamp;
      }

      // Enemy Shooting
      if (timestamp - lastEnemyShotTimeRef.current > 1000) {
        const activeEnemies = enemiesRef.current.filter((e) => e.active);
        if (activeEnemies.length > 0) {
          const randomEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
          enemyBulletsRef.current.push({
            x: randomEnemy.x + ENEMY_WIDTH / 2,
            y: randomEnemy.y + ENEMY_HEIGHT,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            color: '#ff0000',
            active: true,
            dy: 5,
          });
          lastEnemyShotTimeRef.current = timestamp;
        }
      }

      // Update Enemy Bullets
      enemyBulletsRef.current.forEach((bullet) => {
        bullet.y += bullet.dy;
        if (bullet.y > gameHeight) bullet.active = false;
      });
      enemyBulletsRef.current = enemyBulletsRef.current.filter((b) => b.active);

      // Collision Detection
      bulletsRef.current.forEach((bullet) => {
        enemiesRef.current.forEach((enemy) => {
          if (
            enemy.active &&
            bullet.active &&
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            enemy.active = false;
            bullet.active = false;
            setScore((prev) => prev + 100);
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
            playSound('explosion');
            if (Math.random() < 0.3) triggerConversation('kill');

            if (Math.random() < 0.4) {
              coinsRef.current.push({
                x: enemy.x + enemy.width / 2 - 20,
                y: enemy.y,
                width: 40,
                height: 40,
                color: '#FFD700',
                active: true,
                dy: 3,
                value: 1,
              });
            }
          }
        });
      });

      // Update Coins
      coinsRef.current.forEach((coin) => {
        coin.y += coin.dy;
        if (coin.y > gameHeight) coin.active = false;
      });
      coinsRef.current = coinsRef.current.filter((c) => c.active);

      // Coin Collection
      coinsRef.current.forEach((coin) => {
        if (
          coin.active &&
          coin.x < playerRef.current.x + playerRef.current.width &&
          coin.x + coin.width > playerRef.current.x &&
          coin.y < playerRef.current.y + playerRef.current.height &&
          coin.y + coin.height > playerRef.current.y
        ) {
          coin.active = false;
          setCollectedCoins((prev) => prev + 1);
          setScore((prev) => prev + 50);
          playSound('coin');
        }
      });

      // Enemy Bullets hitting Player
      enemyBulletsRef.current.forEach((bullet) => {
        if (
          bullet.active &&
          bullet.x < playerRef.current.x + playerRef.current.width &&
          bullet.x + bullet.width > playerRef.current.x &&
          bullet.y < playerRef.current.y + playerRef.current.height &&
          bullet.y + bullet.height > playerRef.current.y
        ) {
          bullet.active = false;
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameover');
              playSound('lose');
            } else {
                triggerShake();
                triggerConversation('hit');
            }
            return newLives;
          });
          createParticles(
            playerRef.current.x + playerRef.current.width / 2,
            playerRef.current.y + playerRef.current.height / 2,
            '#DC2626'
          );
        }
      });

      if (enemiesRef.current.every((e) => !e.active)) {
        setGameState('victory');
        playSound('win');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      particlesRef.current.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.05;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      // Draw Player
      if (playerImageRef.current.complete && playerImageRef.current.naturalWidth > 0) {
          ctx.drawImage(playerImageRef.current, playerRef.current.x, playerRef.current.y, PLAYER_WIDTH, PLAYER_HEIGHT);
      } else {
          ctx.fillStyle = playerRef.current.color;
          ctx.beginPath();
          ctx.moveTo(playerRef.current.x + PLAYER_WIDTH / 2, playerRef.current.y);
          ctx.lineTo(playerRef.current.x + PLAYER_WIDTH, playerRef.current.y + PLAYER_HEIGHT);
          ctx.lineTo(playerRef.current.x, playerRef.current.y + PLAYER_HEIGHT);
          ctx.fill();
      }

      // Draw Enemies
      enemiesRef.current.forEach((enemy) => {
        if (enemy.active) {
            if (enemyImageRef.current.complete && enemyImageRef.current.naturalWidth > 0) {
                ctx.drawImage(enemyImageRef.current, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                ctx.fillStyle = enemy.color;
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        }
      });

      // Draw Bullets
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffff00';
      ctx.fillStyle = '#ffff00';
      bulletsRef.current.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
      ctx.shadowBlur = 0;

      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0000';
      ctx.fillStyle = '#ff0000';
      enemyBulletsRef.current.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
      ctx.shadowBlur = 0;

      // Draw Coins
      coinsRef.current.forEach((coin) => {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2 - 6, coin.y + coin.height / 2 - 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#B8860B';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('₹', coin.x + 12, coin.y + 28);
      });

      // Draw Particles
      particlesRef.current.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, gameWidth, gameHeight]);

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  };

  // --- Loading Screen ---
  if (!assetsLoaded) {
    return <GamingLoader progress={loadingProgress} />;
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col relative overflow-hidden font-sans select-none">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: "url('/img/space.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* --- INTRO STORY OVERLAY --- */}
      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center cursor-pointer"
            onClick={advanceStory}
          >
             <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute bg-white rounded-full animate-pulse" 
                         style={{
                             top: `${Math.random() * 100}%`,
                             left: `${Math.random() * 100}%`,
                             width: `${Math.random() * 3}px`,
                             height: `${Math.random() * 3}px`,
                             animationDuration: `${Math.random() * 3 + 1}s`
                         }} 
                    />
                ))}
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={storyIndex}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 1.1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-4xl relative z-10 px-4"
                >
                    <p className={`font-mono font-bold leading-relaxed tracking-wider break-words
                        ${storyIndex === STORY_LINES.length - 1 ? 'text-3xl md:text-5xl lg:text-7xl text-red-500 uppercase' : 'text-lg md:text-2xl lg:text-4xl text-yellow-400'}
                    `}>
                        {STORY_LINES[storyIndex]}
                    </p>
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4 text-gray-500">
                <p className="text-xs md:text-sm animate-pulse">Tap screen to continue</p>
                <button 
                    onClick={skipStory}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-800 hover:text-white transition-colors text-[10px] md:text-xs uppercase tracking-widest"
                >
                    <SkipForward size={14} /> Skip Intro
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / HUD - Sits at the top */}
      {gameState !== 'intro' && (
      <div className="z-20 w-full flex justify-between items-center p-2 md:p-4 text-white bg-red-900/80 backdrop-blur-sm border-b border-yellow-500/50 shadow-lg shadow-red-900/20 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => navigate('/game/protect-area')}
            className="p-1.5 md:p-2 hover:bg-red-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs text-yellow-200 uppercase tracking-wider font-bold">
              Score
            </span>
            <span className="text-lg md:text-2xl font-bold font-mono text-white drop-shadow-md leading-none">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-xs text-yellow-200 uppercase tracking-wider mb-0.5 md:mb-1 font-bold">
              Coins
            </span>
            <div className="flex items-center gap-1 bg-yellow-900/50 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-yellow-500/30">
              <span className="text-yellow-400 text-sm md:text-lg">🪙</span>
              <span className="text-white font-bold font-mono text-xs md:text-base">{collectedCoins}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-xs text-yellow-200 uppercase tracking-wider mb-0.5 md:mb-1 font-bold">
              Lives
            </span>
            <div className="flex gap-1">
              {[...Array(Math.max(0, lives))].map((_, i) => (
                <Heart 
                    key={i} 
                    className="w-4 h-4 md:w-6 md:h-6 text-red-500 fill-red-500 drop-shadow-sm" 
                />
              ))}
            </div>
          </div>

          <div className="flex gap-1 md:gap-2">
            <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 md:p-2 hover:bg-red-800 rounded-full transition-colors text-yellow-400"
            >
                {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
            </button>

            <button
                onClick={() => setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'))}
                className="p-1.5 md:p-2 hover:bg-red-800 rounded-full transition-colors text-yellow-400"
            >
                {gameState === 'playing' ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Main Game Area - Flex Grow to take available space */}
      <div className="flex-1 flex items-center justify-center relative w-full overflow-hidden p-2">
        {/* Feedback Overlay - Positioned RELATIVE to this container on Desktop, Absolute on Mobile */}
        <AnimatePresence>
          {showFeedback && gameState === 'playing' && (
            <motion.div
              key={`${feedbackSide}-${feedbackText}`}
              initial={{ x: feedbackSide === 'right' ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: feedbackSide === 'right' ? 300 : -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`absolute z-[60] flex pointer-events-none 
                 ${/* MOBILE: Always top to avoid controls */ 'top-4 items-start'}
                 ${/* DESKTOP: Bottom for hero, top for alien */ 'md:top-auto md:bottom-10 md:items-end'}
                 ${feedbackType === 'alien' ? 'md:top-20 md:bottom-auto md:items-start' : ''}
                 ${feedbackSide === 'right' ? 'right-0 md:right-10' : 'left-0 md:left-10'}
              `}
            >
              <div className={`flex ${feedbackType === 'alien' ? 'items-start' : 'items-end'} ${feedbackSide === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <img 
                    src={feedbackType === 'vijay' ? "/img/angry-vijay.png" : "/img/angry-alien.webp"} 
                    alt={feedbackType === 'vijay' ? "Vijay" : "Alien"} 
                    className={`w-16 sm:w-24 md:w-56 h-auto drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] filter brightness-110 relative z-10 ${
                        feedbackSide === 'left' ? 'scale-x-[-1]' : ''
                    }`}
                  />

                  <div className={`z-20 ${
                      /* Mobile margin adjustments */
                      feedbackType === 'alien' ? 'mt-2 sm:mt-8 md:mt-12' : 'mb-8 sm:mb-16 md:mb-28'
                  } ${
                      /* Desktop margin adjustments to align with new "Top" mobile position */
                      'mt-4 md:mt-auto md:mb-28' 
                  } ${
                      feedbackSide === 'right' ? 'mr-[-10px] md:mr-[-40px]' : 'ml-[-10px] md:ml-[-40px]'
                  }`}>
                     <motion.div
                       initial={{ scale: 0, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className={`relative px-3 py-1.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl border-2 shadow-xl ${
                         feedbackType === 'vijay' 
                           ? 'bg-yellow-400 border-yellow-200 text-black' 
                           : 'bg-red-600 border-red-400 text-white'
                       }`}
                     >
                        <p className="font-black uppercase italic text-[10px] sm:text-base md:text-xl whitespace-normal text-center leading-tight max-w-[160px] md:max-w-none">
                          "{feedbackText}"
                        </p>
                        
                        <div className={`absolute w-3 h-3 md:w-4 md:h-4 transform border-r-2 border-b-2 ${
                           feedbackType === 'vijay' ? 'bg-yellow-400 border-yellow-200' : 'bg-red-600 border-red-400'
                        } ${
                            /* Tail position logic */
                            'bottom-[-6px] md:bottom-[-8px]' 
                        } ${
                            feedbackType === 'alien' ? 'top-[-6px] md:top-[-8px] bottom-auto' : ''
                        } ${
                            feedbackSide === 'right' 
                              ? (feedbackType === 'alien' ? 'right-4 md:right-6 rotate-[225deg]' : 'right-4 md:right-6 rotate-45')
                              : (feedbackType === 'alien' ? 'left-4 md:left-6 rotate-[315deg]' : 'left-4 md:left-6 rotate-[135deg]')
                        }`}></div>
                     </motion.div>
                  </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Canvas */}
        <div className={`relative z-10 shadow-2xl shadow-red-600/20 rounded-lg overflow-hidden border-2 md:border-4 border-yellow-600 transition-transform duration-100 w-full max-w-5xl h-full max-h-full ${isShaking ? 'translate-x-2 translate-y-2' : ''}`}>
          <canvas
            ref={canvasRef}
            width={gameWidth}
            height={gameHeight}
            className="bg-black block w-full h-full object-contain" 
          />

          {/* Overlays (Start/Pause/GameOver) - Kept inside canvas container */}
          {gameState === 'start' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 md:p-8 text-center backdrop-blur-sm z-50">
              <h1 className="text-3xl md:text-6xl font-extrabold mb-2 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 drop-shadow-lg tracking-tighter leading-tight">
                VJ'S
                <br />
                GALAXY FORCE
              </h1>
              <p className="mb-4 md:mb-8 text-yellow-100 text-xs md:text-lg max-w-md font-medium px-4">
                Lead the TVK fleet and defend the galaxy! <br className="hidden md:block"/>
                Use{' '}
                <span className="text-red-500 font-bold bg-white/10 px-1 md:px-2 rounded">Arrow Keys</span> to
                move and{' '}
                <span className="text-red-500 font-bold bg-white/10 px-1 md:px-2 rounded">Space</span> to
                fire.
              </p>
              <button
                onClick={initGame}
                className="group relative px-6 py-3 md:px-10 md:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-red-600/50 border-2 border-yellow-400"
              >
                <span className="flex items-center gap-2 text-base md:text-xl uppercase tracking-wide">
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  Start Mission
                </span>
              </button>
              <button 
                  onClick={() => { setGameState('intro'); setStoryIndex(0); }}
                  className="mt-4 md:mt-6 text-yellow-500 hover:text-yellow-400 underline text-xs md:text-sm"
              >
                  Replay Intro Story
              </button>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm z-50">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-yellow-400 tracking-widest">PAUSED</h2>
              <button
                onClick={() => setGameState('playing')}
                className="px-6 py-2 md:px-8 md:py-3 bg-red-600 hover:bg-red-500 rounded-full font-bold transition-colors flex items-center gap-2 border border-yellow-400 text-sm md:text-base"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                RESUME ACTION
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-md p-4 z-50"
              style={{
                backgroundImage: "url('/img/game-over.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.9,
              }}
            >
              <div className="absolute inset-0 bg-black/90" />
              <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
                <img src="/img/sad.png" alt="Game Over" className="w-24 md:w-64 mb-4 md:mb-6" />
                <h2 className="text-3xl md:text-5xl font-bold mb-1 md:mb-2 text-red-500 tracking-tighter text-center">
                  I AM WAITING...
                </h2>
                <p className="text-sm md:text-xl text-gray-400 mb-4 md:mb-6">Mission Failed</p>
                
                <div className="flex flex-col gap-2 md:gap-4 mb-4 md:mb-8 w-full items-center">
                  <div className="flex gap-4 md:gap-8 justify-center">
                    <p className="text-xl md:text-3xl font-mono">
                      Score: <span className="text-yellow-400">{score}</span>
                    </p>
                    <p className="text-xl md:text-3xl font-mono">
                      Coins: <span className="text-yellow-400">{collectedCoins}</span>
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <p className="text-base md:text-2xl font-mono flex items-center gap-2">
                      Total Trophies: <span className="text-yellow-400">{totalTrophies}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto px-6">
                  <button
                    onClick={initGame}
                    className="w-full md:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 text-sm md:text-base"
                  >
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                    ONCE MORE
                  </button>
                  <button
                    onClick={() => navigate('/game/protect-area')}
                    className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full font-bold transition-colors text-sm md:text-base"
                  >
                    EXIT
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'victory' && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-md p-4 z-50"
              style={{
                backgroundImage: "url('/img/game-won.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.9,
              }}
            >
              <div className="absolute inset-0 bg-black/90" />
              <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
                <img src="/img/happy.webp" alt="Victory" className="w-24 md:w-64 mb-4 md:mb-6" />
                <h2 className="text-3xl md:text-5xl font-bold mb-1 md:mb-2 text-yellow-400 tracking-tighter text-center">
                  VERITHANAM!
                </h2>
                <p className="text-sm md:text-xl text-gray-300 mb-4 md:mb-6">Mission Accomplished</p>
                
                <div className="flex flex-col gap-2 md:gap-4 mb-4 md:mb-8 w-full items-center">
                  <div className="flex gap-4 md:gap-8 justify-center">
                    <p className="text-xl md:text-3xl font-mono">
                      Score: <span className="text-yellow-400">{score}</span>
                    </p>
                    <p className="text-xl md:text-3xl font-mono">
                      Coins: <span className="text-yellow-400">{collectedCoins}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto px-6">
                  {isPremium && (
                    <button
                      onClick={initGame}
                      className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 rounded-full font-bold transition-colors flex items-center justify-center gap-2 border border-yellow-400 shadow-lg shadow-red-600/30 text-sm md:text-base"
                    >
                      <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                      PLAY AGAIN
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/game/protect-area')}
                    className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full font-bold transition-colors text-sm md:text-base"
                  >
                    EXIT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Controls - Dedicated Bottom Section */}
      {gameState !== 'intro' && (
      <div className="w-full bg-slate-900/80 backdrop-blur-md border-t border-slate-700 p-4 md:hidden z-30 shrink-0 pb-safe">
        <div className="flex gap-4 items-center justify-between max-w-sm mx-auto">
          {/* Movement Controls */}
          <div className="flex gap-4">
            <button
              className="w-16 h-16 bg-slate-800/90 rounded-full flex items-center justify-center active:bg-slate-700 active:scale-95 transition-transform border-2 border-slate-600 shadow-lg"
              onTouchStart={(e) => { e.preventDefault(); keysRef.current['ArrowLeft'] = true; }}
              onTouchEnd={(e) => { e.preventDefault(); keysRef.current['ArrowLeft'] = false; }}
            >
              <ArrowLeft className="w-8 h-8 text-white" />
            </button>
            <button
              className="w-16 h-16 bg-slate-800/90 rounded-full flex items-center justify-center active:bg-slate-700 active:scale-95 transition-transform border-2 border-slate-600 shadow-lg"
              onTouchStart={(e) => { e.preventDefault(); keysRef.current['ArrowRight'] = true; }}
              onTouchEnd={(e) => { e.preventDefault(); keysRef.current['ArrowRight'] = false; }}
            >
              <ArrowLeft className="w-8 h-8 text-white rotate-180" />
            </button>
          </div>
          
          {/* Fire Control */}
          <button
            className="flex-1 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center active:from-red-700 active:to-red-800 active:scale-95 transition-transform border-2 border-red-400 shadow-lg shadow-red-900/50"
            onTouchStart={(e) => { e.preventDefault(); keysRef.current['Space'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); keysRef.current['Space'] = false; }}
          >
            <span className="font-black text-white text-xl tracking-widest italic">FIRE</span>
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default SpaceInvadersGame;