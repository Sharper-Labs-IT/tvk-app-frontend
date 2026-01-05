import React from 'react';
import { X, AlertCircle, CheckCircle, Coins, Crown, Gift } from 'lucide-react';

interface NicknameConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nickname: string;
  isPremium: boolean;
  hasFreeChange: boolean;
  currentCoins: number;
  cost: number;
  isLoading?: boolean;
  error?: string; // --- ADDED: To catch the "Already Taken" message ---
}

const NicknameConfirmModal: React.FC<NicknameConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nickname,
  isPremium,
  hasFreeChange,
  currentCoins,
  cost,
  isLoading = false,
  error, // --- ADDED ---
}) => {
  if (!isOpen) return null;

  const hasEnoughCoins = currentCoins >= cost;

  // Logic for button disabling
  const isConfirmDisabled = isLoading || (!isPremium && !hasFreeChange && !hasEnoughCoins);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] rounded-2xl border border-gold/20 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/20 to-transparent p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {isPremium ? (
                <>
                  <Crown className="text-gold" size={24} />
                  Update Nickname
                </>
              ) : hasFreeChange ? (
                <>
                  <Gift className="text-green-500" size={24} />
                  Free Nickname Change
                </>
              ) : (
                <>
                  <Coins className="text-gold" size={24} />
                  Confirm Purchase
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* --- FIX: SPECIFIC ERROR MESSAGE DISPLAY --- */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-red-500 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* New Nickname Display */}
          <div className="bg-black/40 p-4 rounded-lg border border-white/10">
            <p className="text-gray-400 text-sm mb-2">Your new nickname will be:</p>
            <p className="text-white text-xl font-bold">@{nickname}</p>
          </div>

          {/* Status Message */}
          {isPremium ? (
            <div className="flex items-start gap-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <Crown className="text-purple-400 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-purple-400 font-bold text-sm mb-1">Premium Member Benefit</p>
                <p className="text-gray-300 text-sm">
                  As a premium member, you can update your nickname unlimited times at no cost!
                </p>
              </div>
            </div>
          ) : hasFreeChange ? (
            <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <Gift className="text-green-400 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-green-400 font-bold text-sm mb-1">Free Change Available!</p>
                <p className="text-gray-300 text-sm">
                  This is your <span className="text-green-400 font-bold">FREE</span> nickname
                  change. Future changes will cost{' '}
                  <span className="text-gold font-bold">{cost} coins</span> each.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <AlertCircle className="text-yellow-400 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-yellow-400 font-bold text-sm mb-1">Coin Deduction Required</p>
                  <div className="flex items-center justify-between bg-black/40 rounded-lg p-3">
                    <span className="text-white font-bold flex items-center gap-2">
                      <Coins className="text-gold" size={18} />
                      Cost:
                    </span>
                    <span className="text-gold font-bold text-lg">{cost} coins</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Current Balance:</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Coins className="text-gold" size={16} />
                    {currentCoins}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">
                    Remaining coin Balance After Name change:
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      hasEnoughCoins ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {currentCoins - cost}
                  </span>
                </div>
              </div>

              {!hasEnoughCoins && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                  <p className="text-red-400 text-sm font-bold">Insufficient Coins</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-black/40 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium border border-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="flex-1 px-6 py-3 bg-gold hover:bg-gold/80 text-black rounded-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Updating...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {isPremium || hasFreeChange ? 'Confirm' : `Pay ${cost} Coins`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NicknameConfirmModal;
