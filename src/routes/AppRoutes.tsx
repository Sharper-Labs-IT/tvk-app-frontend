import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Lazy load pages
const Home = React.lazy(() => import('../pages/Home'));
const Membership = React.lazy(() => import('../pages/Membership'));
const Game = React.lazy(() => import('../pages/Game'));
const Events = React.lazy(() => import('../pages/Events'));
const Leaderboards = React.lazy(() => import('../pages/Leaderboard'));
const Store = React.lazy(() => import('../pages/Store'));
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

const PublicOnlyRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) {
    return <Loader />;
  }

  return !isLoggedIn ? <>{element}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Example of a Protected Route for future use: */}
          {/* <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} /> */}

          <Route path="/membership" element={<Membership />} />
          <Route path="/game" element={<Game />} />

          <Route path="/leaderboard" element={<Leaderboards />} />
          <Route path="/store" element={<Store />} />

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
      </Suspense>
    </AuthProvider>
  );
};

export default AppRoutes;
