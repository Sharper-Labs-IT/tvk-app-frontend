// components/MembershipCancelModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, X, Loader } from 'lucide-react';

interface MembershipCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const MembershipCancelModal: React.FC<MembershipCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  error,
}) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmText === 'CANCEL' && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmed) {
      await onConfirm(password);
    }
  };

  return (
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

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>

        <h2 className="mb-4 text-center text-2xl font-bold text-white">
          Cancel Membership?
        </h2>

        <p className="mb-6 text-center text-sm leading-relaxed text-slate-300">
          You will lose access to premium features at the end of your billing period. 
          Please type <span className="font-bold text-white">CANCEL</span> and confirm your password to proceed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase ml-1">
              Type "CANCEL"
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-[#13172d] border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition placeholder-slate-600"
              placeholder="Type CANCEL"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase ml-1">
              Verify Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#13172d] border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition placeholder-slate-600"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded-lg text-center border border-red-500/20">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition"
            >
              Keep Plan
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isLoading}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" /> Cancelling...
                </>
              ) : (
                'Confirm Cancel'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MembershipCancelModal;