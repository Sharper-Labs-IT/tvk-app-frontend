// components/MembershipCancelModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface MembershipCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;  // This will trigger the actual cancel API
}

const MembershipCancelModal: React.FC<MembershipCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
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

        {/* Warning Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>

        {/* Title */}
        <h2 className="mb-4 text-center text-2xl font-bold text-white">
          Cancel Super Fan Membership?
        </h2>

        {/* Description */}
        <p className="mb-8 text-center text-sm leading-relaxed text-slate-300">
          You're about to cancel your Super Fan membership. 
          You will lose access to premium features at the end of your current billing period.
          <br /><br />
          <strong className="text-white">This action cannot be undone.</strong>
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-slate-600 bg-transparent py-3 font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Keep Membership
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-full bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Yes, Cancel Membership
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MembershipCancelModal;