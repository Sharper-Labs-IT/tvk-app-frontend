import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader';
import MessageModal from '../components/common/MessageModal';
import type { ISignupPayload, ISignupResponse } from '../types/auth';

// --- Country Data ---
const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+94', country: 'Sri Lanka' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+86', country: 'China' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+65', country: 'Singapore' },
  { code: '+60', country: 'Malaysia' },
  { code: '+7', country: 'Russia' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+82', country: 'South Korea' },
  { code: '+31', country: 'Netherlands' },
  { code: '+46', country: 'Sweden' },
  { code: '+41', country: 'Switzerland' },
  { code: '+27', country: 'South Africa' },
  { code: '+20', country: 'Egypt' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+62', country: 'Indonesia' },
  { code: '+63', country: 'Philippines' },
  { code: '+84', country: 'Vietnam' },
  { code: '+66', country: 'Thailand' },
  { code: '+90', country: 'Turkey' },
  { code: '+98', country: 'Iran' },
  { code: '+234', country: 'Nigeria' },
  { code: '+254', country: 'Kenya' },
  { code: '+351', country: 'Portugal' },
  { code: '+30', country: 'Greece' },
  { code: '+48', country: 'Poland' },
  { code: '+43', country: 'Austria' },
  { code: '+32', country: 'Belgium' },
  { code: '+45', country: 'Denmark' },
  { code: '+358', country: 'Finland' },
  { code: '+47', country: 'Norway' },
  { code: '+353', country: 'Ireland' },
  { code: '+64', country: 'New Zealand' },
  { code: '+974', country: 'Qatar' },
  { code: '+973', country: 'Bahrain' },
  { code: '+968', country: 'Oman' },
  { code: '+965', country: 'Kuwait' },
].sort((a, b) => a.country.localeCompare(b.country));

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ISignupPayload>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
  });

  const [countryCode, setCountryCode] = useState('+94');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [successData, setSuccessData] = useState<ISignupResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (successData) {
      // We still save email/name to session for convenience on the next page
      sessionStorage.setItem('temp_signup_email', formData.email);
      sessionStorage.setItem('temp_signup_name', formData.name);

      setSuccessMessage(
        `${successData.message} Click 'Close' below to go to the OTP verification screen.`
      );
      setShowSuccessModal(true);
    }
  }, [successData, formData.email, formData.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'countryCode') {
      setCountryCode(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSuccessModalClose = () => {
    if (successData) {
      setSuccessData(null);
      setShowSuccessModal(false);
      // Pass the ID normally
      navigate('/verify-otp', { state: { user_id: successData.user_id } });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must contain only digits';
      isValid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const finalMobile = `${countryCode}${formData.mobile}`;

    const payload = {
      ...formData,
      mobile: finalMobile,
    };

    try {
      const response = await api.post<ISignupResponse>('/v1/auth/register', payload);
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

  const getAnimationClass = (delayClass: string) => {
    return `transform transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    } ${delayClass}`;
  };

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
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        </div>

        <LogoHeader isVisible={isVisible} delayClass="delay-0" />

        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 z-10 py-10">
          <div className={`max-w-md w-full space-y-8 ${getAnimationClass('delay-[100ms]')}`}>
            <div className="bg-[#121212] sm:bg-[#1E1E1E] sm:border sm:border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
              <div className={`text-center mb-8 ${getAnimationClass('delay-[200ms]')}`}>
                <h2 className="text-3xl font-bold text-tvk-accent-gold mb-2">Create an Account</h2>
                <p className="text-gray-400 text-sm">Join the TVK Membership Program today</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                  {error}
                </div>
              )}

              <form
                className={`space-y-5 ${getAnimationClass('delay-[300ms]')}`}
                onSubmit={handleSubmit}
              >
                <div>
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
                  {fieldErrors.name && (
                    <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
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
                  {fieldErrors.email && (
                    <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative flex rounded-lg shadow-sm">
                    <div className="relative">
                      <select
                        name="countryCode"
                        value={countryCode}
                        onChange={handleChange}
                        className="h-full rounded-l-lg border-r-0 border border-gray-600 bg-[#2C2C2C] text-gray-200 sm:text-sm focus:ring-tvk-accent-gold focus:border-tvk-accent-gold py-3 pl-3 pr-7 appearance-none cursor-pointer outline-none"
                        style={{ minWidth: '80px' }}
                      >
                        {COUNTRY_CODES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.code} ({country.country})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {PhoneIcon}
                      </div>
                      <input
                        type="tel"
                        name="mobile"
                        id="mobile"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 border-l-0 rounded-r-lg bg-[#2C2C2C] placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-1 focus:ring-tvk-accent-gold focus:border-tvk-accent-gold sm:text-sm transition-colors"
                        placeholder="771234567"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {fieldErrors.mobile && (
                    <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.mobile}</p>
                  )}
                </div>

                <div>
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
                  {fieldErrors.password && (
                    <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
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
                  {fieldErrors.password_confirmation && (
                    <p className="text-red-400 text-xs mt-1 ml-1">
                      {fieldErrors.password_confirmation}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="gold"
                    isLoading={loading}
                    className="flex justify-center items-center gap-2 group"
                  >
                    <span>Sign Up & Verify</span>
                  </Button>
                </div>
              </form>

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
        <div
          className={`text-center py-6 text-xs text-gray-600 z-10 ${getAnimationClass(
            'delay-[500ms]'
          )}`}
        >
          &copy; 2025 TVK Membership Program. All rights reserved.
        </div>
      </div>

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
