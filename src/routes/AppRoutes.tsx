import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Public Pages
// import Home from '../pages/Home';
// import Membership from '../pages/Membership';
// import Game from '../pages/Game';
// import Events from '../pages/Events';
import Loader from '../components/Loader';

// Auth Pages
// import Login from '../pages/Login';
// import Signup from '../pages/Signup';
// import VerifyOtp from '../pages/VerifyOtp';
// import ForgotPassword from '../pages/ForgotPassword';
// import ResetPassword from '../pages/ResetPassword';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Game Pages
// import MemoryChallenge from '../pages/games/MemoryStart';
// import ProtectQueenStart from '../pages/games/ProtectQueenStart';
// import MemoryGame from '../pages/games/MemoryGame';

// Admin Layout & Pages
import AdminLayout from '../layout/admin/AdminLayout';
import DashboardPage from '../pages/admin/DashboardPage';

// Admin Post Management Pages
import PostListPage from '../pages/admin/posts/PostListPage';
import PostCreatePage from '../pages/admin/posts/PostCreatePage';
import PostDetailsPage from '../pages/admin/posts/PostDetailsPage';

// Lazy load pages
const Home = React.lazy(() => import('../pages/Home'));
const Membership = React.lazy(() => import('../pages/Membership'));
const Game = React.lazy(() => import('../pages/Game'));
const Events = React.lazy(() => import('../pages/Events'));
const Login = React.lazy(() => import('../pages/Login'));
const Signup = React.lazy(() => import('../pages/Signup'));
const VerifyOtp = React.lazy(() => import('../pages/VerifyOtp'));
const ForgotPassword = React.lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/ResetPassword'));

// Lazy load game pages
const MemoryChallenge = React.lazy(() => import('../pages/games/MemoryStart'));
const ProtectQueenStart = React.lazy(() => import('../pages/games/ProtectQueenStart'));
const MemoryGame = React.lazy(() => import('../pages/games/MemoryGame'));
const SpaceInvadersTVK = React.lazy(() => import('../pages/games/SpaceInvadersTVK'));
const SpaceInvadersGame = React.lazy(() => import('../pages/games/SpaceInvadersGame'));
const WhackAMoleStart = React.lazy(() => import('../pages/games/WhackAMoleStart'));
const WhackAMoleGame = React.lazy(() => import('../pages/games/WhackAMoleGame'));
const TriviaGameStart = React.lazy(() => import('../pages/games/TriviaGameStart'));
const TriviaGame = React.lazy(() => import('../pages/games/TriviaGame'));
const JigsawPuzzleStart = React.lazy(() => import('../pages/games/JigsawPuzzleStart'));
const JigsawPuzzleGame = React.lazy(() => import('../pages/games/JigsawPuzzleGame'));
const CityDefenderStart = React.lazy(() => import('../pages/games/CityDefenderStart'));
const CityDefenderGame = React.lazy(() => import('../pages/games/CityDefenderGame'));


/**
 * Route Guard: Only for logged-out users (Login, Signup)
 */
const PublicOnlyRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, isAuthInitialized } = useAuth();

  // Wait for auth check to finish before redirecting
  if (!isAuthInitialized) return <Loader />;

  return !isLoggedIn ? <>{element}</> : <Navigate to="/" replace />;
};

/**
 * Route Guard: Only for Admins
 * Checks if user is logged in AND has 'admin' role
 */
const AdminRoute: React.FC = () => {
  const { isLoggedIn, user, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) return <Loader />;

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.roles?.some((role) => role.name === 'admin');

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout />;
};

const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/game" element={<Game />} />

          <Route path="/game/memory-challenge" element={<MemoryChallenge />} />
          <Route path="/game/memory-challenge/start" element={<MemoryGame />} />
          <Route path="/game/protect-queen" element={<ProtectQueenStart />} />
          <Route path="/game/protect-area" element={<SpaceInvadersTVK />} />
          <Route path="/game/protect-area/start" element={<SpaceInvadersGame />} />
          <Route path="/game/villain-hunt" element={<WhackAMoleStart />} />
          <Route path="/game/villain-hunt/start" element={<WhackAMoleGame />} />
          <Route path="/game/trivia" element={<TriviaGameStart />} />
          <Route path="/game/trivia/start" element={<TriviaGame />} />
          <Route path="/game/jigsaw-puzzle" element={<JigsawPuzzleStart />} />
          <Route path="/game/jigsaw-puzzle/start" element={<JigsawPuzzleGame />} />
          <Route path="/game/city-defender" element={<CityDefenderStart />} />
          <Route path="/game/city-defender/start" element={<CityDefenderGame />} />
          <Route path="/events" element={<Events />} />

          <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
          <Route path="/signup" element={<PublicOnlyRoute element={<Signup />} />} />

          {/* Verify OTP is public, but development had it PublicOnly. Keeping it simpler for now. */}
          <Route path="/verify-otp" element={<VerifyOtp />} />

          <Route path="/forgot-password" element={<PublicOnlyRoute element={<ForgotPassword />} />} />
          <Route path="/reset-password" element={<PublicOnlyRoute element={<ResetPassword />} />} />

          <Route path="/admin" element={<AdminRoute />}>
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<DashboardPage />} />

            {/* Post Management Routes */}
            <Route path="posts" element={<PostListPage />} />
            <Route path="posts/create" element={<PostCreatePage />} />
            <Route path="posts/:id" element={<PostDetailsPage />} />

            {/* Placeholders for future pages */}
            <Route
              path="members"
              element={<div className="text-white p-8">Member Management (Coming Soon)</div>}
            />
            <Route
              path="settings"
              element={<div className="text-white p-8">Settings (Coming Soon)</div>}
            />
          </Route>

          {/* Catch-all Route - Redirects to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default AppRoutes;
