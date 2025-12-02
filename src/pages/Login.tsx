import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader'; // Import the new component
import MessageModal from '../components/common/MessageModal';
import type { ILoginPayload, ILoginResponse } from '../types/auth';
import { useAuth } from '../context/AuthContext';

/**
 * @fileoverview Login Page component - Dark Theme Redesign with Reusable Header
 */

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<ILoginPayload>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<ILoginResponse | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Animation State
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animations after 0.5s initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Effect for successful login redirection
  useEffect(() => {
    let timer: number;
    if (successData) {
      setWelcomeMessage(`Welcome back, ${successData.user.name}!`);
      setShowWelcomeModal(true);
      timer = setTimeout(() => {
        login(successData.token, successData.user);
        setShowWelcomeModal(false);
        navigate('/');
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [successData, navigate, login]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWelcomeModalClose = () => {
    if (successData) {
      setSuccessData(null);
      login(successData.token, successData.user);
      setShowWelcomeModal(false);
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await api.post<ILoginResponse>('/v1/auth/login', formData);
      setSuccessData(response.data);
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.response) {
        if (err.response.status === 401 && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.status === 403 && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.status === 422 && err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(' ');
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper for staggered animation classes (for local elements)
  const getAnimationClass = (delayClass: string) => {
    return `transform transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    } ${delayClass}`;
  };

  // Icons for Inputs
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

        {/* REUSABLE HEADER COMPONENT */}
        {/* Passes isVisible state and delay-0 to start the animation sequence */}
        <LogoHeader isVisible={isVisible} delayClass="delay-0" />

        {/* MAIN CONTENT */}
        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 z-10">
          <div className={`max-w-md w-full space-y-8 ${getAnimationClass('delay-[100ms]')}`}>
            {/* Card Container */}
            <div className="bg-[#121212] sm:bg-[#1E1E1E] sm:border sm:border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
              {/* Header Text */}
              <div className={`text-center mb-10 ${getAnimationClass('delay-[200ms]')}`}>
                <h2 className="text-3xl font-bold text-tvk-accent-gold mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-sm">Sign in to your TVK Membership Dashboard</p>
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
                  placeholder="member@tvk.com"
                  icon={MailIcon}
                />

                <InputField
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={LockIcon}
                />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-tvk-accent-gold focus:ring-tvk-accent-gold border-gray-700 rounded bg-gray-800"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-gray-400">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="font-medium text-tvk-accent-gold hover:text-yellow-400 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="gold"
                    isLoading={loading}
                    className="flex justify-center items-center gap-2 group"
                  >
                    <span>Sign In</span>
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

              {/* Footer / Sign Up Link */}
              <div className={`text-center text-sm mt-8 ${getAnimationClass('delay-[400ms]')}`}>
                <p className="text-gray-500">
                  Don't have a membership?{' '}
                  <Link
                    to="/signup"
                    className="font-bold text-tvk-accent-gold hover:text-yellow-400 transition-colors"
                  >
                    Join TVK Now
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

      <MessageModal
        isOpen={showWelcomeModal}
        title="Login Successful!"
        message={welcomeMessage}
        type="success"
        onClose={handleWelcomeModalClose}
        autoCloseDelay={null}
      />
    </>
  );
};

export default Login;
