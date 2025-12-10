import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components
import Loader from '../components/Loader';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Layouts
import AdminLayout from '../layout/admin/AdminLayout';
import MemberLayout from '../layout/MemberLayout';

// Static Admin Pages
import DashboardPage from '../pages/admin/DashboardPage';
import AdminProfile from '../pages/admin/profile/AdminProfile';
import PostListPage from '../pages/admin/posts/PostListPage';
import PostCreatePage from '../pages/admin/posts/PostCreatePage';
import PostDetailsPage from '../pages/admin/posts/PostDetailsPage';
import MembershipPlanList from '../pages/admin/membership/MembershipPlanList';
import MembershipPlanCreate from '../pages/admin/membership/MembershipPlanCreate';

// Lazy Loaded Pages
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

// Member Dashboard Pages
const MemberProfile = React.lazy(() => import('../pages/dashboard/MemberProfile'));
const MemberFeed = React.lazy(() => import('../pages/dashboard/MemberFeed'));

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

// --- NEW ADMIN GAME PAGES ---
const GameListPage = React.lazy(() => import('../pages/admin/games/GameListPage'));
const CreateGamePage = React.lazy(() => import('../pages/admin/games/CreateGamePage'));

/**
 * Helper to safely get role name string
 */
const getRoleName = (role: any): string => {
  if (typeof role === 'string') return role.toLowerCase();
  if (typeof role === 'object' && role.name) return role.name.toLowerCase();
  return '';
};

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

  // Handle both string and object roles
  const isAdminAccess = user.roles?.some((role) =>
    ['admin', 'moderator'].includes(getRoleName(role))
  );

  if (!isAdminAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminLayout />;
};

/**
 * Route Guard: For Members (Protects the Dashboard)
 */
const UserRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn, user, isAuthInitialized } = useAuth();
  const location = useLocation();

  if (!isAuthInitialized) return <Loader />;

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowedRoles = ['member', 'premium', 'admin', 'moderator'];

  // Handle both string and object roles
  const isMember = user.roles?.some((role) => allowedRoles.includes(getRoleName(role)));

  if (!isMember) {
    console.warn('Access Denied: User does not have member role.', user.roles);
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
};

/**
 * Intelligent Redirect Logic
 */
const DashboardRedirect: React.FC = () => {
  const { isLoggedIn, user, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) return <Loader />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Handle both string and object roles
  const roles = user?.roles?.map((r) => getRoleName(r)) || [];

  if (roles.includes('admin') || roles.includes('moderator')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (roles.includes('member') || roles.includes('premium')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/game" element={<Game />} />
          <Route path="/events" element={<Events />} />
          <Route path="/dashboard-access" element={<DashboardRedirect />} />

          {/* 👇 MEMBER DASHBOARD ROUTES (Protected) */}
          <Route path="/dashboard" element={<UserRoute element={<MemberLayout />} />}>
            {/* 1. Profile Page (Default) */}
            <Route index element={<MemberProfile />} />
            {/* 2. Feed Page (New) */}
            <Route path="feed" element={<MemberFeed />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
          <Route path="/signup" element={<PublicOnlyRoute element={<Signup />} />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route
            path="/forgot-password"
            element={<PublicOnlyRoute element={<ForgotPassword />} />}
          />
          <Route path="/reset-password" element={<PublicOnlyRoute element={<ResetPassword />} />} />

          {/* Game Routes */}
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

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="posts" element={<PostListPage />} />
            <Route path="posts/create" element={<PostCreatePage />} />
            <Route path="posts/:id" element={<PostDetailsPage />} />
            <Route path="membership" element={<MembershipPlanList />} />
            <Route path="membership/create" element={<MembershipPlanCreate />} />

            {/* --- NEW ROUTES FOR GAME MANAGEMENT --- */}
            <Route path="games" element={<GameListPage />} />
            <Route path="games/create" element={<CreateGamePage />} />

            <Route
              path="members"
              element={<div className="text-white p-8">Member Management</div>}
            />
            <Route path="settings" element={<div className="text-white p-8">Settings</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default AppRoutes;
