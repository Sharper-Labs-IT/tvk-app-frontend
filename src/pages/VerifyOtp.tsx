import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import type { IVerifyOtpPayload } from '../types/auth';

/**
 * @fileoverview OTP Verification Page component.
 * Verifies the OTP sent after registration using the /v1/auth/verify-otp endpoint.
 */

interface LocationState {
  user_id?: number;
}

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user_id passed from the signup page
  const userId = (location.state as LocationState)?.user_id;

  const [formData, setFormData] = useState<IVerifyOtpPayload>({
    user_id: userId || 0, // Use 0 or handle error if user_id is missing
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If we don't have a user_id, redirect back to signup
  if (!userId) {
    // You might want to use useEffect to navigate after render,
    // but for simplicity, an immediate check is okay here.
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl text-red-600">User ID Missing</h3>
        <p className="mb-4">You must register first to verify an OTP.</p>
        <Link to="/signup" className="text-blue-600 hover:text-blue-500">
          Go to Sign Up
        </Link>
      </div>
    );
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'otp' ? value.trim() : value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Send the request to the backend
      const response = await api.post('/v1/auth/verify-otp', formData);

      setMessage(response.data.message || 'Verification successful!');

      // On successful verification, redirect to the login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'Verification failed. Please try again.';

      if (err.response) {
        // Handle specific status codes/formats from the Laravel backend
        if (err.response.status === 400 && err.response.data.error) {
          errorMessage = err.response.data.error; // e.g., 'Invalid or expired OTP'
        } else if (err.response.status === 422 && err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(' ');
        }
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
          Verify Your Account
        </h2>
        <p className="text-center text-gray-600">
          An OTP has been sent to your mobile/email. Please enter it below.
        </p>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {message} - Redirecting to login...
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Display user ID for debugging/context, but don't allow editing */}
          <InputField
            label="User ID"
            id="user_id"
            name="user_id"
            type="text"
            readOnly
            value={userId}
            className="bg-gray-100 cursor-default"
          />

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
            placeholder="Enter the 4-6 digit OTP"
          />

          <div>
            <Button type="submit" isLoading={loading}>
              Verify Account
            </Button>
          </div>
        </form>

        {/* We can also add a resend OTP link here */}
        <div className="text-center text-sm mt-6">
          <p className="text-gray-600">
            Didn't receive the OTP?{' '}
            <Link to="/request-otp" className="font-medium text-blue-600 hover:text-blue-500">
              Request new OTP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
