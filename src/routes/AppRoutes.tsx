import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components
import Loader from '../components/Loader';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Admin Layout
import AdminLayout from '../layout/admin/AdminLayout';

// Admin Pages (Static Imports)
import DashboardPage from '../pages/admin/DashboardPage';
import AdminProfile from '../pages/admin/profile/AdminProfile';
import PostListPage from '../pages/admin/posts/PostListPage';
import PostCreatePage from '../pages/admin/posts/PostCreatePage';
import PostDetailsPage from '../pages/admin/posts/PostDetailsPage';
import MembershipPlanList from '../pages/admin/membership/MembershipPlanList';
import MembershipPlanCreate from '../pages/admin/membership/MembershipPlanCreate';

// --- LAZY LOADED PAGES ---

// Public Pages
const Home = React.lazy(() => import('../pages/Home'));
const Membership = React.lazy(() => import('../pages/Membership'));
const Game = React.lazy(() => import('../pages/Game'));
const Events = React.lazy(() => import('../pages/Events'));
// 🆕 New Shop Page
// const Shop = React.lazy(() => import('../pages/Shop'));

// Auth Pages
const Login = React.lazy(() => import('../pages/Login'));
const Signup = React.lazy(() => import('../pages/Signup'));
const VerifyOtp = React.lazy(() => import('../pages/VerifyOtp'));
const ForgotPassword = React.lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/ResetPassword'));

// User Pages
// 🆕 New User Profile Page
// const UserProfile = React.lazy(() => import('../pages/users/UserProfile'));

// Game Pages
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
 * Route Guard: Only for logged-out users
 */
const PublicOnlyRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, isAuthInitialized } = useAuth();
  if (!isAuthInitialized) return <Loader />;
  return !isLoggedIn ? <>{element}</> : <Navigate to="/" replace />;
};

/**
 * Route Guard: Only for Admins (Roles: admin, moderator)
 */
const AdminRoute: React.FC = () => {
  const { isLoggedIn, user, isAuthInitialized } = useAuth();
  if (!isAuthInitialized) return <Loader />;

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin role (Assuming 'admin' or 'moderator' can access admin panel)
  const isAdminAccess = user.roles?.some(
    (role) => role.name === 'admin' || role.name === 'moderator'
  );

  if (!isAdminAccess) {
    // If logged in but not admin, maybe redirect to user dashboard or home
    return <Navigate to="/users/profile" replace />;
  }

  return <AdminLayout />;
};

/**
 * 🆕 Route Guard: Only for Members (Roles: member, premium)
 */
const UserRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, user, isAuthInitialized } = useAuth();
  const location = useLocation();

  if (!isAuthInitialized) return <Loader />;

  if (!isLoggedIn || !user) {
    // Redirect to login, but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has valid member roles
  const isMember = user.roles?.some(
    (role) =>
      role.name === 'member' ||
      role.name === 'premium' ||
      role.name === 'admin' ||
      role.name === 'moderator'
  );

  if (!isMember) {
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
};

/**
 * 🆕 Component: Handles logic for "Dashboard" button click
 * - Not Logged In -> Login
 * - Admin/Mod -> /admin/dashboard
 * - Member/Premium -> /users/profile
 */
const DashboardRedirect: React.FC = () => {
  const { isLoggedIn, user, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) return <Loader />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check Roles
  const roles = user?.roles?.map((r) => r.name) || [];

  if (roles.includes('admin') || roles.includes('moderator')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (roles.includes('member') || roles.includes('premium')) {
    return <Navigate to="/users/profile" replace />;
  }

  // Fallback
  return <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/game" element={<Game />} />
          <Route path="/events" element={<Events />} />

          {/* 🆕 Shop Route */}
          {/* <Route path="/shop" element={<Shop />} /> */}

          {/* 🆕 Dashboard Intelligent Redirect */}
          <Route path="/dashboard-access" element={<DashboardRedirect />} />

          {/* --- USER DASHBOARD ROUTES --- */}
          {/* 🆕 Protected Member Route */}
          {/* <Route path="/users/profile" element={<UserRoute element={<UserProfile />} />} /> */}

          {/* --- GAME ROUTES --- */}
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

          {/* --- AUTH ROUTES --- */}
          <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
          <Route path="/signup" element={<PublicOnlyRoute element={<Signup />} />} />

          {/* Verify OTP is public */}
          <Route path="/verify-otp" element={<VerifyOtp />} />

          <Route
            path="/forgot-password"
            element={<PublicOnlyRoute element={<ForgotPassword />} />}
          />
          <Route path="/reset-password" element={<PublicOnlyRoute element={<ResetPassword />} />} />

          {/* --- ADMIN PANEL ROUTES --- */}
          <Route path="/admin" element={<AdminRoute />}>
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<DashboardPage />} />

            {/* Profile Route linked to Header click */}
            <Route path="profile" element={<AdminProfile />} />

            {/* Post Management */}
            <Route path="posts" element={<PostListPage />} />
            <Route path="posts/create" element={<PostCreatePage />} />
            <Route path="posts/:id" element={<PostDetailsPage />} />

            {/* Membership Management */}
            <Route path="membership" element={<MembershipPlanList />} />
            <Route path="membership/create" element={<MembershipPlanCreate />} />

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
