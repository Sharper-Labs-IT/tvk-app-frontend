import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Coins, Crown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: () => void;
  cost: number;
  userCoins: number;
}

const GameAccessModal: React.FC<GameAccessModalProps> = ({ isOpen, onClose, onPay, cost, userCoins }) => {
  const navigate = useNavigate();
  const canAfford = userCoins >= cost;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Daily Limit Reached</h2>
            <p className="text-gray-400 mb-6">
              You've used your 3 free daily plays. Upgrade to Premium for unlimited access or pay coins to continue.
            </p>

            <div className="grid grid-cols-1 gap-4 w-full">
              {/* Option 1: Pay Coins */}
              <button
                onClick={onPay}
                disabled={!canAfford}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  canAfford 
                    ? 'bg-yellow-500/10 border-yellow-500/50 hover:bg-yellow-500/20 cursor-pointer' 
                    : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Coins className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">Pay {cost} Coins</div>
                    <div className="text-xs text-gray-400">Balance: {userCoins}</div>
                  </div>
                </div>
                {!canAfford && <span className="text-xs text-red-400 font-bold">Low Balance</span>}
              </button>

              {/* Option 2: Upgrade */}
              <button
                onClick={() => navigate('/membership')}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 border border-white/10 hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">Upgrade Membership</div>
                    <div className="text-xs text-white/80">Get Unlimited Plays</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GameAccessModal;
