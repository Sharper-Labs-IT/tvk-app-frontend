import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import Button from './common/Button';

interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EmailChangeModal: React.FC<EmailChangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Request, 2: Verify
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetState = () => {
    setStep(1);
    setNewEmail('');
    setPassword('');
    setOtp('');
    setToken('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newEmail || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.requestEmailChange(newEmail, password);
      // Expected response: { message: "...", token: "...", expires_in: ... }
      
      setToken(response.token);
      setSuccessMsg(response.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to request email change');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyEmailChange(token, otp);
      setSuccessMsg(response.message || 'Email updated successfully!');
      if (onSuccess) onSuccess();
      
      // Close after a brief delay to show success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-[#1a1b1e] rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Change Email</h2>
        <p className="text-gray-400 mb-6 text-sm">
          {step === 1 
            ? "Enter your new email address and current password to verify request."
            : `We sent a verification code to ${newEmail}. Please enter it below.`
          }
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {successMsg && !error && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#131415] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#d0fd3e] transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#131415] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#d0fd3e] transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={loading}
              isLoading={loading}
            >
              Request OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-[#131415] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#d0fd3e] transition-colors"
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={loading}
              isLoading={loading}
            >
              Verify & Update
            </Button>
            
            <button
              type="button"
              onClick={() => {
                  setError(null);
                  setStep(1);
                  setOtp(''); // Clear OTP when going back
              }}
              className="w-full text-sm text-gray-400 hover:text-[#d0fd3e] transition-colors mt-2"
            >
              Change email address or password
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default EmailChangeModal;
