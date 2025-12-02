import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Membership from '../pages/Membership';
import Game from '../pages/Game';
import Events from '../pages/Events';
import Loader from '../components/Loader';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VerifyOtp from '../pages/VerifyOtp';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import { AuthProvider, useAuth } from '../context/AuthContext';
import MemoryChallenge from '../pages/games/MemoryStart';
import ProtectQueenStart from '../pages/games/ProtectQueenStart';
import MemoryGame from '../pages/games/MemoryGame';
import SpaceInvadersTVK from '../pages/games/SpaceInvadersTVK';
import SpaceInvadersGame from '../pages/games/SpaceInvadersGame';

const PublicOnlyRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) {
    return <Loader />;
  }

  return !isLoggedIn ? <>{element}</> : <Navigate to="/" replace />;
};

const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) {
    return <Loader />;
  }
  return isLoggedIn ? <>{element}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AuthProvider>
      {isLoading && <Loader />}

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Example of a Protected Route for future use: */}
        {/* <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} /> */}

        <Route path="/membership" element={<Membership />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game/memory-challenge" element={<MemoryChallenge />} />
        <Route path="/game/memory-challenge/start" element={<MemoryGame />} />
        <Route path="/game/protect-queen" element={<ProtectQueenStart />} />
        <Route path="/game/protect-area" element={<SpaceInvadersTVK />} />
        <Route path="/game/protect-area/start" element={<SpaceInvadersGame />} />
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
