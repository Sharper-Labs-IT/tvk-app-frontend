// components/dashboard/DeleteAccountModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Loader } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
}) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const isConfirmEnabled = confirmText.toLowerCase() === 'delete now' && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmEnabled) {
      await onConfirm(password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-2xl bg-[#0F0F0F] p-6 shadow-2xl border border-red-500/30 ring-1 ring-red-500/20"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Delete Account?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            This action is <span className="font-bold text-red-400">permanent</span>. 
            All your data, coins, badges, and subscription history will be wiped instantly. 
            You cannot undo this.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-950/30 p-3 rounded-lg border border-red-900/50 text-xs text-red-200 mb-4 text-left">
             To confirm, type <span className="font-bold select-all">delete now</span> below.
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase ml-1">
              Type "delete now"
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition placeholder-gray-600"
              placeholder="delete now"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase ml-1">
              Verify Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition placeholder-gray-600"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmEnabled || isLoading}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" /> Deleting...
                </>
              ) : (
                'Delete Forever'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DeleteAccountModal;
