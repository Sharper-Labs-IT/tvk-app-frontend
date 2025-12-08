import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Public Pages
import Home from '../pages/Home';
import Membership from '../pages/Membership';
import Game from '../pages/Game';
import Events from '../pages/Events';
import Loader from '../components/Loader';

// Auth Pages
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VerifyOtp from '../pages/VerifyOtp';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Game Pages
import MemoryChallenge from '../pages/games/MemoryStart';
import ProtectQueenStart from '../pages/games/ProtectQueenStart';
import MemoryGame from '../pages/games/MemoryGame';

// Admin Layout & Pages
import AdminLayout from '../layout/admin/AdminLayout';
import DashboardPage from '../pages/admin/DashboardPage';
// NOTE: Make sure AdminProfile is in this path (created in previous step)
import AdminProfile from '../pages/admin/profile/AdminProfile';

// Admin Post Management Pages
import PostListPage from '../pages/admin/posts/PostListPage';
import PostCreatePage from '../pages/admin/posts/PostCreatePage';
import PostDetailsPage from '../pages/admin/posts/PostDetailsPage';

// Admin Membership Pages
import MembershipPlanList from '../pages/admin/membership/MembershipPlanList';
import MembershipPlanCreate from '../pages/admin/membership/MembershipPlanCreate';

/**
 * Route Guard: Only for logged-out users
 */
const PublicOnlyRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, isAuthInitialized } = useAuth();
  if (!isAuthInitialized) return <Loader />;
  return !isLoggedIn ? <>{element}</> : <Navigate to="/" replace />;
};

/**
 * Route Guard: Only for Admins
 */
const AdminRoute: React.FC = () => {
  const { isLoggedIn, user, isAuthInitialized } = useAuth();
  if (!isAuthInitialized) return <Loader />;

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin role
  const isAdmin = user.roles?.some((role) => role.name === 'admin');
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout />;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AuthProvider>
      {isLoading && <Loader />}

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game/memory-challenge" element={<MemoryChallenge />} />
        <Route path="/game/memory-challenge/start" element={<MemoryGame />} />
        <Route path="/game/protect-queen" element={<ProtectQueenStart />} />
        <Route path="/events" element={<Events />} />

        {/* --- AUTH ROUTES --- */}
        <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
        <Route path="/signup" element={<PublicOnlyRoute element={<Signup />} />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<PublicOnlyRoute element={<ForgotPassword />} />} />
        <Route path="/reset-password" element={<PublicOnlyRoute element={<ResetPassword />} />} />

        {/* --- ADMIN PANEL ROUTES --- */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<DashboardPage />} />

          {/* ✅ NEW: Profile Route linked to Header click */}
          <Route path="profile" element={<AdminProfile />} />

          {/* Post Management */}
          <Route path="posts" element={<PostListPage />} />
          <Route path="posts/create" element={<PostCreatePage />} />
          <Route path="posts/:id" element={<PostDetailsPage />} />

          {/* Membership Management */}
          <Route path="membership" element={<MembershipPlanList />} />
          <Route path="membership/create" element={<MembershipPlanCreate />} />

          {/* Placeholders */}
          <Route
            path="members"
            element={<div className="text-white p-8">Member Management (Coming Soon)</div>}
          />
          <Route
            path="settings"
            element={<div className="text-white p-8">Settings (Coming Soon)</div>}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
