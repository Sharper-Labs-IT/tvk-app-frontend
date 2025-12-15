import React, { useState } from 'react';
import { X, Mail, Key, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Confirm Email, 2: Enter Code, 3: Success
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  // Step 1: Send the Code
  const handleSendCode = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    setError('');

    try {
      await authService.requestPasswordReset(user.email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Code & Reset
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsLoading(true);
    setError('');

    try {
      await authService.confirmPasswordReset(user.email, token, newPassword);
      setStep(3);
      setTimeout(() => {
        onClose();
        setStep(1); // Reset for next time
        setToken('');
        setNewPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1E1E1E] border border-gold/20 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 font-zentry">Security Check</h2>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-gold' : 'bg-white/10'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-gold' : 'bg-white/10'}`} />
          <div className={`h-1 flex-1 rounded-full ${step === 3 ? 'bg-gold' : 'bg-white/10'}`} />
        </div>

        {/* STEP 1: Confirm Send */}
        {step === 1 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
              <Mail size={32} />
            </div>
            <p className="text-gray-300 mb-6">
              We need to verify it's you. We will send a security code to: <br />
              <span className="text-white font-bold">{user?.email}</span>
            </p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full bg-gold hover:bg-goldDark text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Send Verification Code <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Enter Code & New Pass */}
        {step === 2 && (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-gray-400">Code sent! Please check your inbox.</p>

            <div>
              <label className="block text-xs text-gold uppercase font-bold mb-1">OTP Code</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste code here"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gold uppercase font-bold mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-goldDark text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Update Password <Key size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Password Updated!</h3>
            <p className="text-gray-400 mt-2">You can now use your new password.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
