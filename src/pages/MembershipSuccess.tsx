import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import axiosClient from '../api/axiosClient';

const MembershipSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent double verification in React Strict Mode
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      navigate('/membership');
      return;
    }

    const verifySession = async (sid: string) => {
      try {
        const res = await axiosClient.post('/payments/verify-checkout-session', {
          session_id: sid,
        });

        if (res.data.success) {
          // Trigger confetti
          const end = Date.now() + 2000;
          const colors = ['#E6C65B', '#ffffff', '#F6A800'];
          (function frame() {
            confetti({
              particleCount: 3,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: colors,
            });
            confetti({
              particleCount: 3,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: colors,
            });
            if (Date.now() < end) requestAnimationFrame(frame);
          })();

          setVerifying(false);
          setTimeout(() => {
            navigate('/dashboard');
          }, 5000);
        } else {
          throw new Error('Payment verification returned unsuccessful status');
        }
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error('Verification error:', error);
        // Even if verification fails, if we have a session_id, it might be a false positive due to network or backend sync.
        // We can fallback to asking the user to check their dashboard or contact support, rather than a hard red "Fail".
        const errorMessage = error?.response?.data?.message || 'We could not verify the payment automatically.';
        setError(errorMessage);
        setVerifying(false);
      }
    };

    if (!verificationAttempted.current) {
      verificationAttempted.current = true;
      verifySession(sessionId);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-[#1E1E1E] border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
      >
        {verifying ? (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="w-16 h-16 text-gold animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-400">Please wait while we confirm your secure transaction...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verification Issue</h2>
            <p className="text-gray-400 mb-8 max-w-[80%] mx-auto">
              {error}
              <br/>
              <span className="text-xs opacity-70 mt-2 block">
                If you were charged, your plan may already be active in your dashboard.
              </span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-4 rounded-xl bg-gold text-black font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/membership')}
                className="w-full py-4 rounded-xl bg-white/5 text-gray-400 font-medium hover:text-white hover:bg-white/10 transition-all"
              >
                Back to Plans
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-goldDark to-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(230,198,91,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-[#1E1E1E]" strokeWidth={3} />
            </div>
            
            <h2 className="text-3xl font-bold text-white font-serif mb-2">Welcome Aboard!</h2>
            <div className="inline-block px-4 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6">
              Membership Activated
            </div>

            <p className="text-gray-400 mb-8 leading-relaxed">
              Thank you for subscribing. Your account has been upgraded with premium access.
            </p>

            <div className="space-y-3">
              <p className="text-sm text-gray-500 animate-pulse">
                Redirecting you to dashboard...
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-white/5"
              >
                Go there now
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MembershipSuccess;