import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader';
import MessageModal from '../components/common/MessageModal';
import type { IResetPasswordPayload, IMessageResponse } from '../types/auth';

/**
 * @fileoverview Reset Password Page - Dark Theme Redesign
 * Handles the final step of setting a new password using the email and token.
 */

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  // Read email and token from URL query parameters
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';

  const [formData, setFormData] = useState<IResetPasswordPayload>({
    email: initialEmail,
    token: initialToken,
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for success modal
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Animation State
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animations after 0.5s initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // --- Visual & Animation Helpers ---
  const getAnimationClass = (delayClass: string) => {
    return `transform transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    } ${delayClass}`;
  };

  const KeyIcon = (
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
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );

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

  // Logic: Only require the email to load the form.
  if (!initialEmail) {
    return (
      <div className="min-h-screen bg-tvk-dark flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[100px] animate-pulse-slow"></div>
        </div>

        <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-2xl shadow-2xl text-center border border-gray-800 z-10">
          <h3 className="text-2xl text-red-500 font-bold mb-4">Invalid Flow</h3>
          <p className="text-gray-400 mb-6">
            The password reset process requires an email address to be specified.
          </p>
          <Link
            to="/forgot-password"
            className="text-tvk-accent-gold hover:text-white font-medium underline transition-colors"
          >
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (isSuccess) {
      navigate('/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!formData.token) {
      setError('Please enter the reset token received in your email.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post<IMessageResponse>('/v1/auth/reset-password', formData);
      setModalMessage(
        response.data.message || 'Your password has been successfully reset. Click Close to log in.'
      );
      setIsSuccess(true);
      setShowModal(true);
    } catch (err: any) {
      let errorMessage = 'Password reset failed. Please ensure the token is correct.';
      if (err.response && err.response.status === 422) {
        if (err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(' ');
        }
      } else if (err.response && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
                <h2 className="text-3xl font-bold text-tvk-accent-gold mb-2">Set New Password</h2>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>Enter the token and your new password for:</p>
                  <p className="font-semibold text-white">{initialEmail}</p>
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
                {/* Reset Token Input */}
                <InputField
                  label="Reset Token (From Email)"
                  id="token"
                  name="token"
                  type="text"
                  required
                  value={formData.token}
                  onChange={handleChange}
                  placeholder="Paste your reset token here"
                  readOnly={!!initialToken}
                  // We can style readOnly inputs differently if needed, but basic dark theme usually works well
                  icon={KeyIcon}
                />

                {/* New Password */}
                <InputField
                  label="New Password"
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  icon={LockIcon}
                />

                {/* Confirm New Password */}
                <InputField
                  label="Confirm New Password"
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  icon={LockIcon}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="gold"
                    isLoading={loading}
                    className="flex justify-center items-center gap-2 group"
                  >
                    <span>Reset Password</span>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </form>
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

      {/* SUCCESS/FAILURE MESSAGE MODAL */}
      <MessageModal
        isOpen={showModal}
        title={isSuccess ? 'Success!' : 'Reset Failed'}
        message={modalMessage}
        type={isSuccess ? 'success' : 'error'}
        onClose={handleModalClose}
        autoCloseDelay={null}
      />
    </>
  );
};

export default ResetPassword;
