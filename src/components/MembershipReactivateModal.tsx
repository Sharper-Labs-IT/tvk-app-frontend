import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Loader } from 'lucide-react';

interface MembershipReactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const MembershipReactivateModal: React.FC<MembershipReactivateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md rounded-3xl bg-[#07091a] p-8 shadow-2xl border border-[#1d2340]"
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h2 className="mb-4 text-center text-2xl font-bold text-white">
            Reactivate Membership?
          </h2>

          <p className="mb-8 text-center text-sm leading-relaxed text-slate-300">
            You are about to reactivate your automatic renewal. 
            <br className="hidden sm:block" />
            Billing will resume automatically on your next renewal date.
          </p>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-500 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-green-900/20"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Reactivation'
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MembershipReactivateModal;
