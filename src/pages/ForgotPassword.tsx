import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader';
import MessageModal from '../components/common/MessageModal';
import type { IForgotPasswordPayload, IMessageResponse } from '../types/auth';

/**
 * @fileoverview Forgot Password Page - Dark Theme Redesign
 * Prompts the user for their email to send a password reset token.
 */

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IForgotPasswordPayload>({ email: '' });
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

  const MailIcon = (
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
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for closing the modal and redirecting
  const handleModalClose = () => {
    setShowModal(false);
    // If successful, redirect to reset-password page, passing the email in the query.
    if (isSuccess) {
      navigate(`/reset-password?email=${formData.email}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // API call to request the token
      await api.post<IMessageResponse>('/v1/auth/forgot-password', formData);

      // ✅ SUCCESS: Set your custom message here (Ignoring backend message)
      setModalMessage(
        'We’ve sent a password reset link to your registered email address. Please check your inbox (and spam/junk folder). The link will expire in 10 minutes.'
      );
      setIsSuccess(true);
      setShowModal(true);
    } catch (err: any) {
      let errorMessage = 'Failed to process request. Please check your email and try again.';

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
                <h2 className="text-3xl font-bold text-tvk-accent-gold mb-2">Forgot Password</h2>
                <p className="text-gray-400 text-sm">
                  Enter your email address and we will send you a password reset token.
                </p>
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
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  icon={MailIcon}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="gold"
                    isLoading={loading}
                    className="flex justify-center items-center gap-2 group"
                  >
                    <span>Send Reset Link</span>
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </form>

              {/* Back to Login */}
              <div className={`text-center text-sm mt-8 ${getAnimationClass('delay-[400ms]')}`}>
                <Link
                  to="/login"
                  className="font-bold text-tvk-accent-gold hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Sign In
                </Link>
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

      {/* SUCCESS/FAILURE MESSAGE MODAL */}
      <MessageModal
        isOpen={showModal}
        title="Password Reset Email Sent"
        message={modalMessage}
        type="success"
        onClose={handleModalClose}
        autoCloseDelay={null}
      />
    </>
  );
};

export default ForgotPassword;
