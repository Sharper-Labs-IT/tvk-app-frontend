import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Page Imports
import Home from '../pages/Home';
import Membership from '../pages/Membership';
import Game from '../pages/Game';
import Events from '../pages/Events';
import Loader from '../components/Loader';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VerifyOtp from '../pages/VerifyOtp';

// --- Authentication Helpers ---

/**
 * Checks if the user is authenticated by looking for the 'authToken' cookie.
 * @returns {boolean} True if the user is logged in.
 */
const isAuthenticated = (): boolean => {
  return !!Cookies.get('authToken');
};

/**
 * Component to guard routes that should only be accessible when the user IS NOT logged in.
 * If logged in, redirects to the home page (/).
 */
const PublicOnlyRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  return !isAuthenticated() ? <>{element}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Loading animation trigger on route change
  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // 500ms delay for loading animation

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {isLoading && <Loader />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/game" element={<Game />} />
        <Route path="/events" element={<Events />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
        <Route path="/signup" element={<PublicOnlyRoute element={<Signup />} />} />

        {/* 3. FALLBACK: Catch-all route, usually redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
