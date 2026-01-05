import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User } from 'lucide-react';
import api from '../utils/api';
import Button from '../components/common/Button';

interface NicknameSetupModalProps {
  isOpen: boolean;
  currentNickname: string | null | undefined;
  token: string;
  onSuccess: () => void;
  onClose?: () => void;
}

const NicknameSetupModal: React.FC<NicknameSetupModalProps> = ({
  isOpen,
  currentNickname,
  token,
  onSuccess,
  
}) => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill the input when modal opens
  useEffect(() => {
    if (isOpen) {
      setNickname(currentNickname || '');
      setError(null);
    }
  }, [isOpen, currentNickname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('Please enter a nickname');
      return;
    }
    if (trimmed.length < 3) {
      setError('Nickname must be at least 3 characters');
      return;
    }
    if (trimmed.length > 20) {
      setError('Nickname cannot be longer than 20 characters');
      return;
    }

    setLoading(true);
    try {
      await api.patch(
        '/v1/auth/update-nickname',
        { nickname: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success → proceed to login
      onSuccess();
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to save nickname. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Close button disabled – user MUST set nickname */}
        <button className="absolute top-4 right-4 text-slate-500 opacity-40 cursor-not-allowed">
          <X className="h-6 w-6" />
        </button>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-900/30">
          <User className="h-12 w-12 text-[#f7c948]" />
        </div>

        <h2 className="mb-3 text-center text-2xl font-bold text-white">
          Set Your Nickname
        </h2>

        <p className="mb-8 text-center text-sm text-slate-300">
          Choose how you'll appear in the TVK Kudumbam community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter nickname"
              maxLength={20}
              autoFocus
              className="w-full rounded-xl bg-[#121426] px-5 py-4 text-white placeholder-slate-500 border border-[#1d2340] focus:outline-none focus:ring-2 focus:ring-[#f7c948]"
            />
            <div className="mt-2 text-right text-xs text-slate-400">
              {nickname.length}/20
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300 text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="gold"
            isLoading={loading}
            disabled={loading}
            className="w-full rounded-full py-4 text-lg font-bold"
          >
            {loading ? 'Saving...' : 'Continue to Dashboard'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default NicknameSetupModal;