import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MembershipPaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MembershipPaymentSuccessModal: React.FC<MembershipPaymentSuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti explosion
      const end = Date.now() + 1000;
      const colors = ['#E6C65B', '#ffffff', '#F6A800'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999, // Above modal
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 9999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
          {/* Backdrop */}
          <div className="fixed inset-0 flex items-center justify-center min-h-full p-4 text-center sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
              aria-hidden="true"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative transform overflow-hidden rounded-3xl bg-[#1E1E1E] text-center shadow-2xl shadow-gold/10 border border-gold/20 w-full max-w-sm mx-auto z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Shine Effect */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-gold/10 to-transparent pointer-events-none" />

              <div className="relative px-6 pt-8 pb-8 flex flex-col items-center">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                  className="relative w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-gradient-to-tr from-goldDark to-gold shadow-[0_0_30px_rgba(230,198,91,0.3)]"
                >
                  <CheckCircle2 className="w-10 h-10 text-[#1E1E1E] drop-shadow-sm" strokeWidth={3} />
                  
                  {/* Floating particles */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-white/20 border-dashed"
                  />
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white font-serif mb-2">
                    Payment Successful!
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gold font-medium mb-4 bg-gold/5 py-1 px-3 rounded-full mx-auto w-fit border border-gold/10">
                    <Sparkles className="w-4 h-4" />
                    <span>Welcome to Super Fan</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[280px] mx-auto">
                    You now have unlocked exclusive live streams, premium content, and VIP perks.
                  </p>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="group w-full py-3.5 rounded-xl bg-white text-black font-bold text-base shadow-lg hover:shadow-white/10 transition-all flex items-center justify-center gap-2"
                >
                  Start Exploring
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MembershipPaymentSuccessModal;