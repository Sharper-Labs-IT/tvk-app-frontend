import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader';
import MessageModal from '../components/common/MessageModal';
import type { IVerifyOtpPayload, IUser } from '../types/auth';

/**
 * @fileoverview OTP Verification Page component - Dark Theme Redesign
 * Verifies the OTP, provides a resend option, and matches the visual style of Auth pages.
 */

interface LocationState {
  user_id?: number;
}

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = (location.state as LocationState)?.user_id;

  const [formData, setFormData] = useState<IVerifyOtpPayload>({
    user_id: userId || 0,
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for Modals
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [isSuccess, setIsSuccess] = useState(false); // Tracks if verification succeeded

  // State for user display data
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Animation State
  const [isVisible, setIsVisible] = useState(false);

  // 1. Trigger animations after 0.5s initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // --- Helper Effect: Load User Data for Display ---
  useEffect(() => {
    // Get temporary details from Session Storage
    const tempEmail = sessionStorage.getItem('temp_signup_email');
    const tempName = sessionStorage.getItem('temp_signup_name');

    if (tempEmail) setUserEmail(tempEmail);
    if (tempName) setUserName(tempName);

    // Fallback to localStorage
    const storedUserJson = localStorage.getItem('user');
    if (storedUserJson) {
      try {
        const storedUser = JSON.parse(storedUserJson) as IUser;
        if (storedUser.id === userId) {
          setUserEmail(storedUser.email);
          setUserName(storedUser.name);
          return;
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }

    if (!tempEmail) {
      setUserEmail('your email address');
    }
  }, [userId]);

  // --- Conditional Redirection Check (if accessing directly without User ID) ---
  if (!userId) {
    return (
      <div className="min-h-screen bg-tvk-dark flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-2xl shadow-2xl text-center border border-gray-800">
          <h3 className="text-2xl text-red-500 font-bold mb-4">Access Denied</h3>
          <p className="text-gray-400 mb-6">
            The verification process requires a User ID, which is missing.
          </p>
          <Link
            to="/signup"
            className="text-tvk-accent-gold hover:text-white font-medium underline transition-colors"
          >
            Return to Sign Up
          </Link>
        </div>
      </div>
    );
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  // Handle final redirection after modal is closed
  const handleModalClose = useCallback(() => {
    setShowModal(false);
    if (isSuccess) {
      navigate('/login');
    }
  }, [isSuccess, navigate]);

  // --- Resend OTP Logic ---
  const handleResendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    setResending(true);
    setError(null);

    if (!userEmail || userEmail === 'your email address') {
      setModalTitle('Error');
      setModalMessage('Cannot resend: Email address is unknown. Please refresh and try again.');
      setModalType('error');
      setShowModal(true);
      setResending(false);
      return;
    }

    try {
      const payload = { email: userEmail };
      const response = await api.post('/v1/auth/request-otp', payload);

      setModalTitle('New OTP Sent!');
      setModalMessage(
        response.data.message || `A new OTP has been successfully sent to ${userEmail}.`
      );
      setModalType('success');
      setShowModal(true);
    } catch (err: any) {
      let errorMessage = 'Failed to resend OTP. Please check your details.';
      if (err.response && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      setModalTitle('Resend Failed');
      setModalMessage(errorMessage);
      setModalType('error');
      setShowModal(true);
    } finally {
      setResending(false);
    }
  };

  // --- Verification Submission Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/v1/auth/verify-otp', formData);

      setModalTitle('Verification Complete');
      setModalMessage(
        response.data.message ||
          'Your account has been successfully verified. Click Close to log in.'
      );
      setModalType('success');
      setIsSuccess(true);
      setShowModal(true);
    } catch (err: any) {
      let errorMessage = 'Verification failed. Please try again.';
      if (err.response) {
        if (err.response.status === 400 && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.status === 422 && err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(' ');
        }
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

  // --- Visual & Animation Helpers ---
  const getAnimationClass = (delayClass: string) => {
    return `transform transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    } ${delayClass}`;
  };

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
        {/* Background Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        </div>

        {/* Reusable Header */}
        <LogoHeader isVisible={isVisible} delayClass="delay-0" />

        {/* Main Content */}
        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 z-10 py-10">
          <div className={`max-w-md w-full space-y-8 ${getAnimationClass('delay-[100ms]')}`}>
            {/* Card Container */}
            <div className="bg-[#121212] sm:bg-[#1E1E1E] sm:border sm:border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
              {/* Header Text */}
              <div className={`text-center mb-8 ${getAnimationClass('delay-[200ms]')}`}>
                <h2 className="text-3xl font-bold text-tvk-accent-gold mb-2">
                  Verify Your Account
                </h2>
                <div className="text-gray-400 text-sm space-y-1">
                  {userName && (
                    <p className="font-semibold text-gray-300">{`Hello, ${userName}!`}</p>
                  )}
                  <p>
                    We sent an OTP to <span className="text-white font-medium">{userEmail}</span>
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                  {error}
                </div>
              )}

              {/* Form */}
              <form
                className={`space-y-6 ${getAnimationClass('delay-[300ms]')}`}
                onSubmit={handleSubmit}
              >
                <InputField
                  label="One-Time Password (OTP)"
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  minLength={4}
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter 4-6 digit code"
                  icon={LockIcon}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="gold"
                    isLoading={loading}
                    className="flex justify-center items-center gap-2 group"
                  >
                    <span>Verify Account</span>
                    {!loading && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </form>

              {/* Resend Link */}
              <div className={`text-center text-sm mt-8 ${getAnimationClass('delay-[400ms]')}`}>
                <p className="text-gray-500">
                  Didn't receive the OTP?{' '}
                  <button
                    onClick={handleResendOtp}
                    disabled={resending}
                    className={`
                      font-bold text-tvk-accent-gold hover:text-white transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${resending ? 'animate-pulse' : ''}
                    `}
                  >
                    {resending ? 'Sending...' : 'Request new OTP'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div
          className={`text-center py-6 text-xs text-gray-600 z-10 ${getAnimationClass(
            'delay-[500ms]'
          )}`}
        >
          &copy; 2025 TVK Membership Program. All rights reserved.
        </div>
      </div>

      {/* Confirmation Modal */}
      <MessageModal
        isOpen={showModal}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={handleModalClose}
        autoCloseDelay={null}
      />
    </>
  );
};

export default VerifyOtp;
