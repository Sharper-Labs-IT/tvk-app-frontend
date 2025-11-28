import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import type { ISignupPayload, ISignupResponse } from '../types/auth';

/**
 * @fileoverview Signup Page component.
 * Handles form submission and communicates with the /v1/auth/register endpoint.
 * Note: Successful registration requires subsequent OTP verification.
 */

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ISignupPayload>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '', // Must match the backend validation field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic frontend check that passwords match (backend confirms it too)
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Send the request to the backend
      const response = await api.post<ISignupResponse>('/v1/auth/register', formData);

      const { user_id, message } = response.data;

      // Registration successful. Since the backend sends an OTP, we navigate to the verification page.
      alert(`${message} Please verify your account.`);

      // Pass the user_id to the verification page (e.g., via state or query params)
      navigate('/verify-otp', { state: { user_id } });
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please check your details.';

      if (err.response && err.response.status === 422) {
        // Handle validation errors (e.g., email already exists)
        // Laravel returns an 'errors' object for 422 status
        if (err.response.data.errors) {
          // Flatten all error messages into a single string for display
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an Account
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
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
          />

          <div className="pt-4">
            <Button type="submit" isLoading={loading}>
              Sign Up & Verify
            </Button>
          </div>
        </form>

        <div className="text-center text-sm mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
