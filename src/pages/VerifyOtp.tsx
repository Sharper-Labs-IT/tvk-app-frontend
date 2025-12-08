import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader';
import MessageModal from '../components/common/MessageModal';
import { useAuth } from '../context/AuthContext';
// Removed unused IUser import to fix the warning

interface LocationState {
  user_id?: number;
  email?: string;
  context?: 'verification' | 'admin-login';
}

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Extract state
  const state = location.state as LocationState;
  const context = state?.context || 'verification';
  const userId = state?.user_id;
  const userEmail = state?.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [isSuccess, setIsSuccess] = useState(false);

  // Animation State
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Validation Check
  if (context === 'verification' && !userId) {
    return (
      <AccessDenied
        message="Missing User ID for verification."
        link="/signup"
        linkText="Return to Sign Up"
      />
    );
  }
  if (context === 'admin-login' && !userEmail) {
    return (
      <AccessDenied
        message="Missing Email for Admin Verification."
        link="/login"
        linkText="Return to Login"
      />
    );
  }

  // Handle Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value.trim());
  };

  // Handle Modal Close & Navigation
  const handleModalClose = useCallback(() => {
    setShowModal(false);
    if (isSuccess) {
      if (context === 'admin-login') {
        navigate('/admin/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isSuccess, navigate, context]);

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (context === 'admin-login') {
        // --- ADMIN FLOW ---
        const response = await api.post('/v1/auth/verify-admin-2fa', {
          email: userEmail,
          otp: otp,
        });

        const { token, user } = response.data;

        // Fetch full profile to get Roles
        try {
          const profileRes = await api.get('/v1/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          login(token, profileRes.data.user);
        } catch (err) {
          login(token, user);
        }

        setModalTitle('Access Granted');
        setModalMessage('Admin verification successful.');
        setModalType('success');
        setIsSuccess(true);
        setShowModal(true);
      } else {
        // --- STANDARD USER FLOW ---
        await api.post('/v1/auth/verify-otp', {
          user_id: userId,
          otp: otp,
        });

        setModalTitle('Verification Complete');
        setModalMessage('Your account has been verified. Please log in.');
        setModalType('success');
        setIsSuccess(true);
        setShowModal(true);
      }
    } catch (err: any) {
      let errorMessage = 'Verification failed. Please try again.';
      if (err.response && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      setModalTitle('Verification Failed');
      setModalMessage(errorMessage);
      setModalType('error');
      setIsSuccess(false);
      setShowModal(true);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- RESEND OTP LOGIC ---
  const handleResendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    setResending(true);

    const payload =
      context === 'admin-login'
        ? { email: userEmail, context: 'admin-2fa' }
        : {
            email: userEmail || sessionStorage.getItem('temp_signup_email'),
            context: 'verification',
          };

    try {
      const response = await api.post('/v1/auth/request-otp', payload);
      setModalTitle('OTP Sent');
      setModalMessage(response.data.message || 'New OTP sent.');
      setModalType('success');
      setShowModal(true);
    } catch (err: any) {
      setModalTitle('Error');
      setModalMessage(err.response?.data?.error || 'Failed to resend OTP.');
      setModalType('error');
      setShowModal(true);
    } finally {
      setResending(false);
    }
  };

  const getAnimationClass = (delayClass: string) =>
    `transform transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    } ${delayClass}`;

  const LockIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );

  return (
    <>
      <div className="min-h-screen bg-tvk-dark flex flex-col relative overflow-hidden font-sans">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        </div>

        <LogoHeader isVisible={isVisible} delayClass="delay-0" />

        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 z-10 py-10">
          <div className={`max-w-md w-full space-y-8 ${getAnimationClass('delay-[100ms]')}`}>
            <div className="bg-[#121212] sm:bg-[#1E1E1E] sm:border sm:border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
              <div className={`text-center mb-8 ${getAnimationClass('delay-[200ms]')}`}>
                <h2 className="text-3xl font-bold text-tvk-accent-gold mb-2">
                  {context === 'admin-login' ? 'Admin Verification' : 'Verify Account'}
                </h2>
                <p className="text-gray-400 text-sm">
                  Enter the OTP sent to{' '}
                  <span className="text-white font-medium">{userEmail || 'your email'}</span>
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                  {error}
                </div>
              )}

              <form
                className={`space-y-6 ${getAnimationClass('delay-[300ms]')}`}
                onSubmit={handleSubmit}
              >
                <InputField
                  label="One-Time Password"
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={handleChange}
                  placeholder="Enter code"
                  icon={LockIcon}
                />

                <div className="pt-2">
                  <Button type="submit" variant="gold" isLoading={loading} className="w-full">
                    {context === 'admin-login' ? 'Verify & Login' : 'Verify Account'}
                  </Button>
                </div>
              </form>

              <div className={`text-center text-sm mt-8 ${getAnimationClass('delay-[400ms]')}`}>
                <button
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="font-bold text-tvk-accent-gold hover:text-white transition-colors"
                >
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`text-center py-6 text-xs text-gray-600 z-10 ${getAnimationClass(
            'delay-[500ms]'
          )}`}
        >
          &copy; 2025 TVK Membership Program.
        </div>
      </div>

      <MessageModal
        isOpen={showModal}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={handleModalClose}
      />
    </>
  );
};

const AccessDenied: React.FC<{ message: string; link: string; linkText: string }> = ({
  message,
  link,
  linkText,
}) => (
  <div className="min-h-screen bg-tvk-dark flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-2xl shadow-2xl text-center border border-gray-800">
      <h3 className="text-2xl text-red-500 font-bold mb-4">Access Denied</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      <Link
        to={link}
        className="text-tvk-accent-gold hover:text-white font-medium underline transition-colors"
      >
        {linkText}
      </Link>
    </div>
  </div>
);

export default VerifyOtp;
