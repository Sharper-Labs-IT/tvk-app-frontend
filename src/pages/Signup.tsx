import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader';
import MessageModal from '../components/common/MessageModal';
import type { ISignupPayload, ISignupResponse } from '../types/auth';

/**
 * @fileoverview Signup Page component - Dark Theme Redesign
 * Handles form submission, communicates with /v1/auth/register,
 * and matches the visual style of the Login page.
 */

const Signup: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<ISignupPayload>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Flow State
  const [successData, setSuccessData] = useState<ISignupResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Animation State
  const [isVisible, setIsVisible] = useState(false);

  // 1. Trigger animations after 0.5s initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Manage the display of the modal after a successful API response
  useEffect(() => {
    if (successData) {
      // Save user details to sessionStorage before redirection
      sessionStorage.setItem('temp_signup_email', formData.email);
      sessionStorage.setItem('temp_signup_name', formData.name);

      // Set the success message and display the modal immediately
      setSuccessMessage(
        `${successData.message} Click 'Close' below to go to the OTP verification screen.`
      );
      setShowSuccessModal(true);
    }
  }, [successData, formData.email, formData.name]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for manually closing the modal
  const handleSuccessModalClose = () => {
    if (successData) {
      setSuccessData(null);
      setShowSuccessModal(false);
      navigate('/verify-otp', { state: { user_id: successData.user_id } });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    // Basic frontend check
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post<ISignupResponse>('/v1/auth/register', formData);
      setSuccessData(response.data);
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please check your details.';

      if (err.response && err.response.status === 422) {
        if (err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(' ');
        }
      } else if (err.message) {
        errorMessage = `Network error: ${err.message}`;
      }

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

  // Icons
  const UserIcon = (
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

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

  const PhoneIcon = (
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
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
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
                <h2 className="text-3xl font-bold text-tvk-accent-gold mb-2">Create an Account</h2>
                <p className="text-gray-400 text-sm">Join the TVK Membership Program today</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                  {error}
                </div>
              )}

              {/* Form */}
              <form
                className={`space-y-5 ${getAnimationClass('delay-[300ms]')}`}
                onSubmit={handleSubmit}
              >
                <InputField
                  label="Full Name"
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  icon={UserIcon}
                />

                <InputField
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  icon={MailIcon}
                />

                <InputField
                  label="Mobile Number"
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="e.g., 94771234567"
                  icon={PhoneIcon}
                />

                <InputField
                  label="Password (min 6 chars)"
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={LockIcon}
                />

                <InputField
                  label="Confirm Password"
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={LockIcon}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="gold"
                    isLoading={loading}
                    className="flex justify-center items-center gap-2 group"
                  >
                    <span>Sign Up & Verify</span>
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </form>

              {/* Footer / Login Link */}
              <div className={`text-center text-sm mt-8 ${getAnimationClass('delay-[400ms]')}`}>
                <p className="text-gray-500">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-tvk-accent-gold hover:text-yellow-400 transition-colors"
                  >
                    Sign in
                  </Link>
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

      {/* SUCCESS MODAL */}
      <MessageModal
        isOpen={showSuccessModal}
        title="Account Created!"
        message={successMessage}
        type="success"
        onClose={handleSuccessModalClose}
        autoCloseDelay={null}
      />
    </>
  );
};

export default Signup;
