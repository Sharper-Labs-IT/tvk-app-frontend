import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Mailcheck from 'mailcheck';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader';
import MessageModal from '../components/common/MessageModal';
import TermsModal from '../components/common/TermsModal';
import PrivacyPolicyModal from '../components/common/PrivacyPolicyModal';
import type { ISignupPayload, ISignupResponse } from '../types/auth';
import { useGeoLocation } from '../hooks/useGeoLocation';

// --- Imported Constants ---
import { COUNTRIES } from '../constants/countries';
import { PHONE_CODES } from '../constants/phoneCodes';

const TITLE_OPTIONS = [
  'Mr',
  'Mrs',
  'Ms',
  'Miss',
  'Mx',
  'Dr',
  'Prof',
  'Rev',
  'Sir',
  'Dame',
  'Prefer not to say',
];

const Signup: React.FC = () => {
  const navigate = useNavigate();

  // --- FORM STATE ---
  const [formData, setFormData] = useState<ISignupPayload>({
    title: '',
    first_name: '',
    surname: '',
    email: '',
    mobile: '',
    country: '',
    password: '',
    password_confirmation: '',
  });

  // CHANGED: Default is now empty string, so "Code" placeholder shows
  const [mobileCountryCode, setMobileCountryCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // --- MODAL STATES ---
  const [successData, setSuccessData] = useState<ISignupResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  // --- EMAIL SUGGESTION STATE ---
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [showEmailSuggestionModal, setShowEmailSuggestionModal] = useState(false);

  // --- UI ANIMATION STATE ---
  const [isVisible, setIsVisible] = useState(false);

  // --- CHECKBOX STATES ---
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [participationAgreed, setParticipationAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const { countryCode: detectedCountryCode, loading: geoLoading } = useGeoLocation();

  // --- PASSWORD LOGIC ---
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    match: false,
  });

  useEffect(() => {
    setPasswordCriteria({
      length: formData.password.length >= 8,
      number: /\d/.test(formData.password),
      match: formData.password === formData.password_confirmation && formData.password !== '',
    });
  }, [formData.password, formData.password_confirmation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (successData) {
      sessionStorage.setItem('temp_signup_email', formData.email);
      sessionStorage.setItem('temp_signup_name', `${formData.first_name} ${formData.surname}`);
      setSuccessMessage(
        'We’ve sent a One-Time Password (OTP) to your email.' +
          'Please verify your account to continue.<br /><br />' +
          'Tap ‘Close’ to go to the OTP verification screen.'
      );
      setShowSuccessModal(true);
    }
  }, [successData, formData.email, formData.first_name, formData.surname]);

  // --- SMART COUNTRY SYNC ---
  useEffect(() => {
    if (formData.country && formData.country !== 'India') {
      const foundCode = PHONE_CODES.find((c) => c.country === formData.country);
      if (foundCode) {
        setMobileCountryCode(foundCode.code);
      }
    }
  }, [formData.country]);

  // --- MAILCHECK LOGIC ---
  const checkEmailTypos = () => {
    if (!formData.email) return;

    Mailcheck.run({
      email: formData.email,
      domains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com'],
      topLevelDomains: ['com', 'net', 'org', 'edu', 'gov', 'uk', 'lk'],
      suggested: (suggestion: { full: React.SetStateAction<string | null> }) => {
        setEmailSuggestion(suggestion.full);
        setShowEmailSuggestionModal(true);
      },
      empty: () => {
        setEmailSuggestion(null);
      },
    });
  };

  const applyEmailSuggestion = () => {
    if (emailSuggestion) {
      setFormData((prev) => ({ ...prev, email: emailSuggestion }));
      if (fieldErrors.email) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
    setShowEmailSuggestionModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'mobileCountryCode') {
      // 1. STRICT INDIA CHECK FOR MOBILE CODE
      if (value === '+91') {
        setShowRestrictedModal(true);
        setMobileCountryCode(''); // Reset to placeholder
      } else {
        setMobileCountryCode(value);
      }
    } else if (name === 'country') {
      // 2. STRICT INDIA CHECK FOR COUNTRY
      if (value === 'India') {
        setShowRestrictedModal(true);
        setFormData((prev) => ({ ...prev, country: '' }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSuccessModalClose = () => {
    if (successData) {
      setSuccessData(null);
      setShowSuccessModal(false);
      navigate('/verify-otp', { state: { user_id: successData.user_id } });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    if (!formData.country) newErrors.country = 'Please select your country';

    // Validate Mobile Code
    if (!mobileCountryCode) {
      newErrors.mobile = 'Please select a country code';
      isValid = false;
    }

    if (formData.country === 'India') {
      setShowRestrictedModal(true);
      setFormData((prev) => ({ ...prev, country: '' }));
      isValid = false;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d+$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must contain only digits';
    }

    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/\d/.test(formData.password))
      newErrors.password = 'Password must include at least one number';

    if (formData.password !== formData.password_confirmation)
      newErrors.password_confirmation = 'Passwords do not match';

    if (!termsAccepted)
      newErrors.terms = 'You must agree to the Terms & Conditions and Privacy Policy';
    if (!ageConfirmed) newErrors.age = 'You must confirm that you are 18 years of age or older';
    if (!participationAgreed)
      newErrors.participation = 'You must agree to the participation declaration';

    if (Object.keys(newErrors).length > 0) isValid = false;

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    if (detectedCountryCode === 'IN') {
      setShowRestrictedModal(true);
      setLoading(false);
      return;
    }

    if (formData.country === 'India' || mobileCountryCode === '+91') {
      setShowRestrictedModal(true);
      if (formData.country === 'India') setFormData((prev) => ({ ...prev, country: '' }));
      if (mobileCountryCode === '+91') setMobileCountryCode('');
      setLoading(false);
      return;
    }

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const finalMobile = `${mobileCountryCode}${formData.mobile}`;

    const payload = {
      ...formData,
      mobile: finalMobile,
    };

    try {
      const response = await api.post<ISignupResponse>('/v1/auth/register', payload);
      setSuccessData(response.data);
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please check your details.';
      const errors: { [key: string]: string } = {};

      if (err.response && err.response.status === 422) {
        if (err.response.data.errors) {
          const backendErrors = err.response.data.errors;

          // Handle email error
          if (backendErrors.email) {
            errors.email = 'This email address is already registered.';
          }

          // Handle mobile error
          if (backendErrors.mobile) {
            errors.mobile = 'This mobile number is already registered.';
          }

          // Set field errors if any
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          } else {
            errorMessage = Object.values(backendErrors).flat().join(' ');
            setError(errorMessage);
          }
        }
      } else if (err.message) {
        errorMessage = `Network error: ${err.message}`;
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getAnimationClass = (delayClass: string) => {
    return `transform transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    } ${delayClass}`;
  };

  // --- ICONS ---
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

  const GlobeIcon = (
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
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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

        <LogoHeader
          isVisible={isVisible}
          delayClass="delay-0"
          text={
            <>
              THALAPAHTY <span className="text-tvk-accent-gold">VJ</span>{' '}
              <span className="text-tvk-accent-gold">KUDUMBAM MEMBERSHIP</span> – SIGN UP
            </>
          }
        />

        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 z-10 py-10 lg:py-16">
          <div
            className={`max-w-md lg:max-w-xl w-full space-y-8 ${getAnimationClass(
              'delay-[100ms]'
            )}`}
          >
            <div className="bg-[#121212] sm:bg-[#1E1E1E] sm:border sm:border-gray-800 p-8 sm:p-10 lg:p-12 rounded-2xl shadow-2xl">
              <div className={`text-center mb-8 lg:mb-10 ${getAnimationClass('delay-[200ms]')}`}>
                <h2 className="text-3xl lg:text-4xl font-bold text-tvk-accent-gold mb-2 lg:mb-4">
                  Create an Account
                </h2>
                <p className="text-gray-400 text-sm lg:text-base">
                  Join the Free TVK Membership Programme today
                </p>
                <p className="text-gray-400 text-xs lg:text-sm mt-1">
                  Membership is currently available to fans outside India only
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                  {error}
                </div>
              )}

              {geoLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tvk-accent-gold"></div>
                </div>
              ) : detectedCountryCode === 'IN' ? (
                <div className="text-center py-10">
                  <div className="text-red-500 text-5xl mb-4">🚫</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Service Unavailable in Your Region
                  </h3>
                  <p className="text-gray-400">
                    We're sorry, but the TVK Membership Programme is currently not available in
                    India. We appreciate your interest and thank you for your understanding
                  </p>
                  <div className="mt-6">
                    <Link to="/" className="text-tvk-accent-gold hover:underline">
                      Return to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <form
                  className={`space-y-5 ${getAnimationClass('delay-[300ms]')}`}
                  onSubmit={handleSubmit}
                >
                  {/* Title Dropdown */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      How should we address you?
                    </label>
                    <div className="relative flex rounded-lg shadow-sm">
                      <select
                        name="title"
                        id="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-[#2C2C2C] text-gray-200 focus:outline-none focus:ring-1 focus:ring-tvk-accent-gold focus:border-tvk-accent-gold sm:text-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Select Title
                        </option>
                        {TITLE_OPTIONS.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                      {/* Arrow Icon for Select */}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* First Name & Surname Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <InputField
                        label="First Name"
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Enter First Name"
                        icon={UserIcon}
                      />
                      {fieldErrors.first_name && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.first_name}</p>
                      )}
                    </div>
                    <div>
                      <InputField
                        label="Surname"
                        id="surname"
                        name="surname"
                        type="text"
                        required
                        value={formData.surname}
                        onChange={handleInputChange}
                        placeholder="Enter Surname"
                        icon={UserIcon}
                      />
                      {fieldErrors.surname && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.surname}</p>
                      )}
                    </div>
                  </div>
                  {/*Add description*/}
                  <div className="mt-3 px-1">
                    <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">
                      We’ll auto-generate a display name for you.
                    </p>
                    <p className="text-gray-400 text-xs lg:text-sm leading-relaxed mt-1">
                      This name will be shown publicly in games, leaderboards, and winner
                      announcements. You can change it later in your profile dashboard.
                    </p>
                  </div>

                  {/* Country Selection Dropdown */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Country
                    </label>
                    <div className="relative flex rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {GlobeIcon}
                      </div>
                      <select
                        name="country"
                        id="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-[#2C2C2C] text-gray-200 focus:outline-none focus:ring-1 focus:ring-tvk-accent-gold focus:border-tvk-accent-gold sm:text-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Select your country
                        </option>
                        {COUNTRIES.map((countryName) => (
                          <option key={countryName} value={countryName}>
                            {countryName}
                          </option>
                        ))}
                      </select>
                      {/* Arrow Icon for Select */}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    {fieldErrors.country && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.country}</p>
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
                      onChange={handleInputChange}
                      onBlur={checkEmailTypos}
                      placeholder="you@example.com"
                      icon={MailIcon}
                    />
                    {fieldErrors.email && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Mobile Number with Prefixes */}
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Mobile Number
                    </label>
                    <div className="relative flex rounded-lg shadow-sm">
                      {/* MOBILE CODE DROP DOWN */}
                      <div className="relative">
                        <select
                          name="mobileCountryCode"
                          value={mobileCountryCode}
                          onChange={handleInputChange}
                          // Added max-w-[100px] and w-[30%] to force it to stay small on mobile
                          className="h-full max-w-[150px] w-[30vw] sm:w-auto rounded-l-lg border-r-0 border border-gray-600 bg-[#2C2C2C] text-gray-200 text-xs sm:text-sm focus:ring-tvk-accent-gold focus:border-tvk-accent-gold py-3 pl-3 pr-7 appearance-none cursor-pointer outline-none truncate"
                        >
                          <option value="" disabled>
                            Country Code
                          </option>
                          {PHONE_CODES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.code} ({country.country})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* NUMBER INPUT */}
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
                          placeholder="7700123456"
                          value={formData.mobile}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    {fieldErrors.mobile && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.mobile}</p>
                    )}
                  </div>

                  <div>
                    <InputField
                      label="Password"
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      icon={LockIcon}
                      className="lg:py-4 lg:text-base"
                    />

                    <div className="mt-2 space-y-1 pl-1">
                      <div
                        className={`flex items-center text-xs lg:text-sm transition-colors duration-300 ${
                          passwordCriteria.length ? 'text-green-500' : 'text-gray-500'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            passwordCriteria.length ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                        Minimum 8 characters
                      </div>
                      <div
                        className={`flex items-center text-xs lg:text-sm transition-colors duration-300 ${
                          passwordCriteria.number ? 'text-green-500' : 'text-gray-500'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            passwordCriteria.number ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                        At least one number
                      </div>
                    </div>

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
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      icon={LockIcon}
                      className="lg:py-4 lg:text-base"
                    />
                    <div
                      className={`mt-2 flex items-center text-xs lg:text-sm transition-colors duration-300 pl-1 ${
                        passwordCriteria.match ? 'text-green-500' : 'text-gray-500'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          passwordCriteria.match ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                      Passwords match
                    </div>
                    {fieldErrors.password_confirmation && (
                      <p className="text-red-400 text-xs mt-1 ml-1">
                        {fieldErrors.password_confirmation}
                      </p>
                    )}
                  </div>

                  {/* Mandatory Declarations */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-1">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-600 bg-[#2C2C2C] checked:border-tvk-accent-gold checked:bg-tvk-accent-gold transition-all"
                          />
                          <svg
                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity"
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                          I confirm that I have read and agree to the{' '}
                          <button
                            type="button"
                            onClick={() => setIsTermsModalOpen(true)}
                            className="text-tvk-accent-gold hover:underline"
                          >
                            TVK Members Terms & Conditions
                          </button>{' '}
                          and{' '}
                          <button
                            type="button"
                            onClick={() => setIsPrivacyModalOpen(true)}
                            className="text-tvk-accent-gold hover:underline"
                          >
                            Privacy Policy
                          </button>
                          , and I consent to the collection, storage and processing of my personal
                          data in accordance with UK GDPR and applicable laws in my country of
                          residence.
                        </span>
                      </label>
                      {fieldErrors.terms && (
                        <p className="text-red-400 text-xs ml-7">{fieldErrors.terms}</p>
                      )}

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-1">
                          <input
                            type="checkbox"
                            checked={ageConfirmed}
                            onChange={(e) => setAgeConfirmed(e.target.checked)}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-600 bg-[#2C2C2C] checked:border-tvk-accent-gold checked:bg-tvk-accent-gold transition-all"
                          />
                          <svg
                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity"
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                          I confirm that I am 18 years of age or older
                        </span>
                      </label>
                      {fieldErrors.age && (
                        <p className="text-red-400 text-xs ml-7">{fieldErrors.age}</p>
                      )}

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-1">
                          <input
                            type="checkbox"
                            checked={participationAgreed}
                            onChange={(e) => setParticipationAgreed(e.target.checked)}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-600 bg-[#2C2C2C] checked:border-tvk-accent-gold checked:bg-tvk-accent-gold transition-all"
                          />
                          <svg
                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity"
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                          I understand that participation in any games, contests, rewards, or events
                          is voluntary and may be subject to separate rules and eligibility
                          requirements.
                        </span>
                      </label>
                      {fieldErrors.participation && (
                        <p className="text-red-400 text-xs ml-7">{fieldErrors.participation}</p>
                      )}
                    </div>
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

                  {/* Disclaimer */}
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                      <span className="font-bold text-gray-400">Disclaimer:</span> Independent fan
                      platform - not officially associated with or endorsed by actor Vijay or his
                      representatives.
                    </p>
                  </div>
                </form>
              )}

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
          &copy; 2026 TVK Global Membership Programme. All rights reserved.
        </div>
      </div>

      <MessageModal
        isOpen={showSuccessModal}
        title="Account Created Successfully!"
        message={successMessage}
        type="success"
        onClose={handleSuccessModalClose}
        autoCloseDelay={null}
      />

      <MessageModal
        isOpen={showRestrictedModal}
        title="Service Not Available"
        message="We are sorry, but the TVK Membership Programme is currently not available for users inside India."
        type="error"
        onClose={() => setShowRestrictedModal(false)}
        autoCloseDelay={null}
      />

      {showEmailSuggestionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-[#1E1E1E] border border-tvk-accent-gold/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10 animate-fade-in-up">
            <h3 className="text-xl font-bold text-white mb-2">Check Email?</h3>
            <p className="text-gray-300 text-sm mb-6">
              Did you mean <span className="font-bold text-tvk-accent-gold">{emailSuggestion}</span>
              ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowEmailSuggestionModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                No, keep original
              </button>
              <button
                type="button"
                onClick={applyEmailSuggestion}
                className="px-4 py-2 rounded-lg text-sm bg-tvk-accent-gold text-black font-bold hover:bg-yellow-400 transition-colors"
              >
                Yes, correct it
              </button>
            </div>
          </div>
        </div>
      )}

      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </>
  );
};

export default Signup;
