import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, RotateCcw, Home, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
interface Enemy {
  id: number;
  x: number;
  y: number;
  type: 'villain1' | 'villain2' | 'alien';
  speed: number;
  angle: number;
}

// --- Constants ---
const CENTER_X = 50;
const CENTER_Y = 50;
const SPAWN_RATE_MS = 1500;

const ENEMY_TYPES = [
  { type: 'villain1', img: '/img/villain-1.webp', speed: 0.15, score: 10 },
  { type: 'villain2', img: '/img/villain-2.webp', speed: 0.2, score: 20 },
  { type: 'alien', img: '/img/angry-alien.webp', speed: 0.25, score: 30 },
] as const;

const CityDefenderGame: React.FC = () => {
  const navigate = useNavigate();
  
  // Game State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [rage, setRage] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [isRageActive, setIsRageActive] = useState(false);
  
  // Refs for game loop to avoid closure staleness
  const enemiesRef = useRef<Enemy[]>([]);
  const frameRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);

  // --- Game Logic ---

  const spawnEnemy = useCallback(() => {
    if (isGameOverRef.current) return;

    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let startX = 0, startY = 0;

    switch (edge) {
      case 0: startX = Math.random() * 100; startY = -10; break;
      case 1: startX = 110; startY = Math.random() * 100; break;
      case 2: startX = Math.random() * 100; startY = 110; break;
      case 3: startX = -10; startY = Math.random() * 100; break;
    }

    // Calculate angle towards center
    const dx = CENTER_X - startX;
    const dy = CENTER_Y - startY;
    const angle = Math.atan2(dy, dx);

    const typeIdx = Math.floor(Math.random() * ENEMY_TYPES.length);
    const enemyType = ENEMY_TYPES[typeIdx];

    const newEnemy: Enemy = {
      id: Date.now() + Math.random(),
      x: startX,
      y: startY,
      type: enemyType.type,
      speed: enemyType.speed,
      angle: angle
    };

    enemiesRef.current.push(newEnemy);
    setEnemies([...enemiesRef.current]);
  }, []);

  const gameLoop = useCallback(() => {
    if (isGameOverRef.current) return;

    const currentEnemies = enemiesRef.current;
    const nextEnemies: Enemy[] = [];
    let damageTaken = false;

    currentEnemies.forEach(enemy => {
      // Move enemy
      enemy.x += Math.cos(enemy.angle) * enemy.speed;
      enemy.y += Math.sin(enemy.angle) * enemy.speed;

      // Check collision with center (Hero)
      const dist = Math.sqrt(Math.pow(enemy.x - CENTER_X, 2) + Math.pow(enemy.y - CENTER_Y, 2));
      
      if (dist < 8) { // Threshold for hitting hero
        damageTaken = true;
      } else {
        nextEnemies.push(enemy);
      }
    });

    if (damageTaken) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          endGame();
        }
        return newLives;
      });
      // Visual feedback for damage could go here
    }

    enemiesRef.current = nextEnemies;
    setEnemies([...nextEnemies]);

    frameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const endGame = () => {
    isGameOverRef.current = true;
    setIsGameOver(true);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    
    // Fire confetti if score is good
    if (scoreRef.current > 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleEnemyClick = (id: number, type: string) => {
    if (isGameOver || isRageActive) return;

    const enemyConfig = ENEMY_TYPES.find(e => e.type === type);
    const points = enemyConfig ? enemyConfig.score : 10;

    setScore(prev => {
      const newScore = prev + points;
      scoreRef.current = newScore;
      return newScore;
    });

    setRage(prev => Math.min(prev + 10, 100));

    enemiesRef.current = enemiesRef.current.filter(e => e.id !== id);
    setEnemies([...enemiesRef.current]);
  };

  const activateRage = () => {
    if (rage < 100) return;
    
    setIsRageActive(true);
    setRage(0);
    
    // Clear all enemies
    enemiesRef.current = [];
    setEnemies([]);

    // Visual effect duration
    setTimeout(() => {
      setIsRageActive(false);
    }, 2000);
  };

  const restartGame = () => {
    setIsGameOver(false);
    isGameOverRef.current = false;
    setScore(0);
    scoreRef.current = 0;
    setLives(5);
    setRage(0);
    setEnemies([]);
    enemiesRef.current = [];
    
    // Restart loops
    spawnTimerRef.current = setInterval(spawnEnemy, SPAWN_RATE_MS);
    gameLoop();
  };

  // --- Effects ---

  useEffect(() => {
    // Start Game
    spawnTimerRef.current = setInterval(spawnEnemy, SPAWN_RATE_MS);
    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [spawnEnemy, gameLoop]);

  // Increase difficulty over time
  useEffect(() => {
    const difficultyTimer = setInterval(() => {
      if (!isGameOverRef.current) {
        // Could increase spawn rate or enemy speed here
      }
    }, 10000);
    return () => clearInterval(difficultyTimer);
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden touch-none select-none">
      
      {/* Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url('/img/bg-game3.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>{score}</span>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Heart 
                key={i} 
                className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <button 
            onClick={() => navigate('/game')}
            className="bg-white/10 p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
          
          {/* Rage Meter */}
          <div 
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${rage >= 100 ? 'scale-110 cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.6)]' : ''}`}
            onClick={activateRage}
          >
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700" />
              <circle 
                cx="32" cy="32" r="28" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="transparent" 
                className={`${rage >= 100 ? 'text-yellow-400' : 'text-blue-500'} transition-all duration-300`}
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (175.9 * rage) / 100}
              />
            </svg>
            <Zap className={`absolute w-8 h-8 ${rage >= 100 ? 'text-yellow-400 fill-yellow-400 animate-pulse' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Hero (Center) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 z-20"
        >
          <img 
            src={isRageActive ? "/img/angry-vijay.png" : "/img/hero.webp"} 
            alt="Hero" 
            className={`w-full h-full object-contain drop-shadow-lg transition-transform duration-300 ${isRageActive ? 'scale-150' : ''}`}
          />
          {/* Safe Zone Indicator */}
          <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ping" />
        </div>

        {/* Rage Effect Overlay */}
        <AnimatePresence>
          {isRageActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 20 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-500/30 rounded-full z-10"
            />
          )}
        </AnimatePresence>

        {/* Enemies */}
        <AnimatePresence>
          {enemies.map(enemy => {
            const enemyConfig = ENEMY_TYPES.find(e => e.type === enemy.type);
            return (
              <motion.div
                key={enemy.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1, x: `${enemy.x}vw`, y: `${enemy.y}vh` }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0 }} // Controlled by game loop, no CSS transition for pos
                style={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: 0,
                  width: '60px',
                  height: '60px',
                  marginLeft: '-30px', // Center anchor
                  marginTop: '-30px',
                  zIndex: 30,
                  cursor: 'pointer'
                }}
                onClick={() => handleEnemyClick(enemy.id, enemy.type)}
              >
                <img 
                  src={enemyConfig?.img} 
                  alt="Enemy" 
                  className="w-full h-full object-contain drop-shadow-md hover:scale-110 transition-transform"
                  style={{ transform: `rotate(${enemy.x < 50 ? 0 : 0}deg)` }} // Simple facing logic could be improved
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gray-900 border border-gray-700 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl"
            >
              <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
              <p className="text-gray-400 mb-6">The city has fallen!</p>
              
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Final Score</p>
                <p className="text-5xl font-bold text-yellow-400">{score}</p>
              </div>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => navigate('/game')}
                  className="px-6 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors"
                >
                  Exit
                </button>
                <button 
                  onClick={restartGame}
                  className="px-8 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CityDefenderGame;
