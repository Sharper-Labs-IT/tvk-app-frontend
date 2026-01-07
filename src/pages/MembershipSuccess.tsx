import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const MembershipSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      navigate('/membership');
      return;
    }

    verifySession(sessionId);
  }, [searchParams]);

  const verifySession = async (sessionId: string) => {
    try {
      const res = await axiosClient.post('/payments/verify-checkout-session', {
        session_id: sessionId,
      });

      if (res.data.success) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError('Payment verification failed');
        setVerifying(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify payment');
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-800">Verifying your payment...</h2>
          <p className="text-slate-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{error}</h2>
          <button
            onClick={() => navigate('/membership')}
            className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold"
          >
            Back to Membership
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
        <p className="text-slate-600 mb-4">Your membership has been activated.</p>
        <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default MembershipSuccess;