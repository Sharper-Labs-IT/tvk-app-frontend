
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X, Star } from 'lucide-react';

interface MembershipPaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MembershipPaymentSuccessModal: React.FC<MembershipPaymentSuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-3xl bg-[#07091a] p-8 shadow-2xl border border-[#1d2340]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Gold Star Icon for Celebration */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-900/30">
          <Star className="h-14 w-14 text-[#f7c948] fill-[#f7c948]" />
        </div>

        {/* Title */}
        <h2 className="mb-4 text-center text-2xl font-bold text-white">
          Payment Successful!
        </h2>

        {/* Subtitle */}
        <h3 className="mb-4 text-center text-xl font-semibold text-[#f7c948]">
          Welcome to Super Fan ✨
        </h3>

        {/* Description */}
        <p className="mb-8 text-center text-sm leading-relaxed text-slate-300">
          Congratulations! Your payment has been processed successfully.
          <br />
          You now have full access to exclusive live streams, premium content, priority meetups, and much more.
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full rounded-full bg-[#f7c948] py-3 font-semibold text-[#111827] transition hover:bg-[#f4b41a]"
        >
          Start Exploring
        </button>
      </motion.div>
    </div>
  );
};

export default MembershipPaymentSuccessModal;