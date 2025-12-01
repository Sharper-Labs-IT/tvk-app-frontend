import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import Cookies from 'js-cookie'; // 👈 NO LONGER NEEDED HERE

// Page Imports
import Home from '../pages/Home';
import Membership from '../pages/Membership';
import Game from '../pages/Game';
import Events from '../pages/Events';
import Loader from '../components/Loader';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VerifyOtp from '../pages/VerifyOtp';
// NEW IMPORTS
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// Context Import
import { AuthProvider, useAuth } from '../context/AuthContext';

// --- Component to guard routes that should only be accessible when the user IS NOT logged in. ---
const PublicOnlyRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, isAuthInitialized } = useAuth();

  // Wait until the initial auth check is complete before rendering the routes
  if (!isAuthInitialized) {
    return <Loader />;
  }

  // If logged in, redirect to the home page (/)
  return !isLoggedIn ? <>{element}</> : <Navigate to="/" replace />;
};

// --- Component to guard routes that REQUIRE the user to be logged in. (Optional for future use) ---
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) {
    return <Loader />;
  }

  // If not logged in, redirect to the login page
  return isLoggedIn ? <>{element}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Loading animation trigger on route change
  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Reduced delay for smoother feel

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    // 👈 WRAP ALL ROUTES WITH AuthProvider
    <AuthProvider>
      {isLoading && <Loader />}

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Example of a Protected Route for future use: */}
        {/* <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} /> */}

        <Route path="/membership" element={<Membership />} />
        <Route path="/game" element={<Game />} />
        <Route path="/events" element={<Events />} />

        {/* Auth Routes must be PublicOnly */}
        <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
        <Route path="/signup" element={<PublicOnlyRoute element={<Signup />} />} />
        <Route path="/verify-otp" element={<PublicOnlyRoute element={<VerifyOtp />} />} />

        {/* FORGOT PASSWORD ROUTES (NEW) */}
        <Route path="/forgot-password" element={<PublicOnlyRoute element={<ForgotPassword />} />} />
        <Route path="/reset-password" element={<PublicOnlyRoute element={<ResetPassword />} />} />

        {/* 3. FALLBACK: Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
