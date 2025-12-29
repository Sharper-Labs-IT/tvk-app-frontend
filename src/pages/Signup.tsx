import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LogoHeader from '../components/common/LogoHeader';
import MessageModal from '../components/common/MessageModal';
import TermsModal from '../components/common/TermsModal';
import PrivacyPolicyModal from '../components/common/PrivacyPolicyModal';
import type { ISignupPayload, ISignupResponse } from '../types/auth';
import { useGeoLocation } from '../hooks/useGeoLocation';

// --- Country Data ---
const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  // { code: '+91', country: 'India' }, // Removed India
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

  const [countryCode, setCountryCode] = useState('+44');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [successData, setSuccessData] = useState<ISignupResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // New State for Checkboxes and Modals
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [participationAgreed, setParticipationAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const { countryCode: detectedCountryCode, loading: geoLoading } = useGeoLocation();

  // Password Validation State
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    match: false
  });

  useEffect(() => {
    setPasswordCriteria({
      length: formData.password.length >= 8,
      number: /\d/.test(formData.password),
      match: formData.password === formData.password_confirmation && formData.password !== ''
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

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must include at least one number';
      isValid = false;
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
      isValid = false;
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must agree to the Terms & Conditions and Privacy Policy';
      isValid = false;
    }

    if (!ageConfirmed) {
      newErrors.age = 'You must confirm that you are 18 years of age or older';
      isValid = false;
    }

    if (!participationAgreed) {
      newErrors.participation = 'You must agree to the participation declaration';
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

    if (countryCode === '+91') {
      setError('Registration is not available for users in India.');
      setLoading(false);
      return;
    }

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

        <LogoHeader
          isVisible={isVisible}
          delayClass="delay-0"
          text={
            <>
              THALAPAHTY <span className="text-tvk-accent-gold">VJ</span> {' '}
              <span className="text-tvk-accent-gold">KUDUMBAM MEMBERSHIP</span> – SIGN UP
            </>
          }
        />

        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 z-10 py-10 lg:py-16">
          <div className={`max-w-md lg:max-w-xl w-full space-y-8 ${getAnimationClass('delay-[100ms]')}`}>
            <div className="bg-[#121212] sm:bg-[#1E1E1E] sm:border sm:border-gray-800 p-8 sm:p-10 lg:p-12 rounded-2xl shadow-2xl">
              <div className={`text-center mb-8 lg:mb-10 ${getAnimationClass('delay-[200ms]')}`}>
                <h2 className="text-3xl lg:text-4xl font-bold text-tvk-accent-gold mb-2 lg:mb-4">Create an Account</h2>
                <p className="text-gray-400 text-sm lg:text-base">Join the Free TVK Membership Program today</p>
                <p className="text-gray-400 text-xs lg:text-sm mt-1">Membership is currently available to fans outside India only</p>
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
                  <h3 className="text-xl font-bold text-white mb-2">Service Not Available</h3>
                  <p className="text-gray-400">
                    We are sorry, but registration is currently not available for users in India.
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
                          placeholder="7700123456"
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
                      label="Password"
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      icon={LockIcon}
                      className="lg:py-4 lg:text-base"
                    />
                    
                    {/* Password Validation UI */}
                    <div className="mt-2 space-y-1 pl-1">
                      <div className={`flex items-center text-xs lg:text-sm transition-colors duration-300 ${passwordCriteria.length ? 'text-green-500' : 'text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordCriteria.length ? 'bg-green-500' : 'bg-gray-500'}`} />
                        Minimum 8 characters
                      </div>
                      <div className={`flex items-center text-xs lg:text-sm transition-colors duration-300 ${passwordCriteria.number ? 'text-green-500' : 'text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordCriteria.number ? 'bg-green-500' : 'bg-gray-500'}`} />
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
                      onChange={handleChange}
                      placeholder="••••••••"
                      icon={LockIcon}
                      className="lg:py-4 lg:text-base"
                    />
                     <div className={`mt-2 flex items-center text-xs lg:text-sm transition-colors duration-300 pl-1 ${passwordCriteria.match ? 'text-green-500' : 'text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordCriteria.match ? 'bg-green-500' : 'bg-gray-500'}`} />
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
                    {/* <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Mandatory Declarations / Legal
                    </h3> */}
                    
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
                          , and I consent to the collection, storage and processing of my personal data in accordance with UK GDPR and applicable laws in my country of residence.
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
                          I understand that participation in any games, contests, rewards, or events is voluntary and may be subject to separate rules and eligibility requirements.
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
                      <span className="font-bold text-gray-400">Disclaimer:</span> Independent fan platform — not officially associated with or endorsed by actor Vijay or his representatives.
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

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </>
  );
};

export default Signup;
