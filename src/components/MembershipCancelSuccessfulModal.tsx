import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface MembershipCancelSuccessfulModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MembershipCancelSuccessfulModal: React.FC<MembershipCancelSuccessfulModalProps> = ({
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

        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-900/30">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>

        {/* Title */}
        <h2 className="mb-4 text-center text-2xl font-bold text-white">
          Membership Successfully Cancelled
        </h2>

        {/* Description */}
        <p className="mb-8 text-center text-sm leading-relaxed text-slate-300">
          Your Super Fan membership has been cancelled.
          <br />
          You will continue to enjoy premium benefits until the end of your current billing period.
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full rounded-full bg-[#f7c948] py-3 font-semibold text-[#111827] transition hover:bg-[#f4b41a]"
        >
          Got It
        </button>
      </motion.div>
    </div>
  );
};

export default MembershipCancelSuccessfulModal;