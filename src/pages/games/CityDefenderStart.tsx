import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Play, Trophy, Users, ArrowLeft, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameAccess } from '../../hooks/useGameAccess';
import GameAccessModal from '../../components/common/GameAccessModal';
import { AuthContext } from '../../context/AuthContext';

const CityDefenderStart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const userCoins = user?.coins || 0;
  const { checkAccess, consumePlay, remainingFreePlays, isPremium } = useGameAccess();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessCost, setAccessCost] = useState(0);

  const handlePlayClick = () => {
    const { allowed, reason, cost } = checkAccess();
    if (allowed) {
      consumePlay(false);
      navigate('/game/city-defender/start');
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
          navigate('/game/city-defender/start');
      } else {
          // Ideally show a toast or error in modal
          alert("Not enough coins!");
      }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <GameAccessModal 
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onPay={handlePayToPlay}
        cost={accessCost}
        userCoins={userCoins}
      />
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: "url('/img/bg-game6-start.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black z-0" />

      {/* --- TOP NAVIGATION BAR --- */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start">
        {/* Back Button */}
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/game')}
          className="flex items-center justify-center p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all shadow-lg group"
        >
          <ArrowLeft className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
        </motion.button>

        {/* Coin Display */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 px-5 py-2 bg-black/40 backdrop-blur-md border border-yellow-500/30 rounded-full shadow-lg shadow-yellow-500/10"
        >
          <div className="bg-yellow-500/20 p-1.5 rounded-full">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="font-bold text-xl text-yellow-400 tracking-wide">
            {userCoins.toLocaleString()}
          </span>
        </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col items-center justify-center">
        
        {/* Hero Image / Icon */}
        {/* <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-full" />
          <img 
            src="/img/hero.webp" 
            alt="Thalapathy Hero" 
            className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]"
          />
        </motion.div> */}
        {/* Title */}
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 uppercase tracking-tighter"
        >
          City Defender
        </motion.h1>

        <motion.p 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-300 text-center max-w-2xl mb-12"
        >
          Enemies are attacking the city! Stand as the ultimate protector. 
          Defeat the villains before they reach the center.
        </motion.p>

        {/* Stats / Info Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl"
        >
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/20 transition-colors">
            <Shield className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="font-bold text-lg mb-1">Protect</h3>
            <p className="text-sm text-gray-400">Don't let enemies touch the hero</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/20 transition-colors">
            <Users className="w-10 h-10 text-red-400 mb-3" />
            <h3 className="font-bold text-lg mb-1">Defeat</h3>
            <p className="text-sm text-gray-400">Tap villains to stop them</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/20 transition-colors">
            <Trophy className="w-10 h-10 text-yellow-400 mb-3" />
            <h3 className="font-bold text-lg mb-1">Score</h3>
            <p className="text-sm text-gray-400">Build your streak for high scores</p>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayClick}
          className="group relative px-12 py-6 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full font-black text-2xl shadow-2xl shadow-red-900/50 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            PLAY NOW <Play className="w-6 h-6 fill-current" />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </motion.button>

        {!isPremium && (
           <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-gray-400 text-sm"
           >
             Free Plays Remaining: <span className="text-yellow-400 font-bold">{remainingFreePlays}</span>
           </motion.p>
        )}
        {isPremium && (
           <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-green-400 text-sm flex items-center gap-2"
           >
             <span>⭐</span> You're a Super Fan of VJ! Enjoy unlimited access to all games.
           </motion.p>
        )}

      </div>
    </div>
  );
};

export default CityDefenderStart;