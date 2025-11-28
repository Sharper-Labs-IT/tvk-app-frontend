import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../utils/api';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import type { ILoginPayload, ILoginResponse } from '../types/auth';

/**
 * @fileoverview Login Page component.
 * Handles form submission, communicates with the /v1/auth/login endpoint,
 * and stores the received token in a cookie.
 */

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ILoginPayload>({
    email: '',
    password: '',
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

    try {
      // Send the request to the backend
      const response = await api.post<ILoginResponse>('/v1/auth/login', formData);

      const { token, user } = response.data;

      // 1. Store the token securely in a cookie
      // In a real application, consider 'secure: true' (for HTTPS) and 'sameSite: "strict"'
      Cookies.set('authToken', token, { expires: 7 });

      // 2. We can also store the user details in local storage or a global state (e.g., Redux/Zustand)
      localStorage.setItem('user', JSON.stringify(user));

      // 3. Navigate to the dashboard or home page
      alert(`Welcome back, ${user.name}!`);
      navigate('/'); // Redirect to a protected route
    } catch (err: any) {
      // API errors usually come in `err.response.data`
      let errorMessage = 'Login failed. Please try again.';

      if (err.response) {
        // Handle specific status codes/formats from the Laravel backend
        if (err.response.status === 401 && err.response.data.error) {
          errorMessage = err.response.data.error; // e.g., 'Invalid credentials'
        } else if (err.response.status === 403 && err.response.data.error) {
          errorMessage = err.response.data.error; // e.g., 'User is not active'
        } else if (err.response.status === 422 && err.response.data.errors) {
          // Handle validation errors from Laravel (if fields are missing)
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
          Sign in to your account
        </h2>

        {/* Display general error message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button type="submit" isLoading={loading}>
              Sign In
            </Button>
          </div>
        </form>

        <div className="text-center text-sm mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
