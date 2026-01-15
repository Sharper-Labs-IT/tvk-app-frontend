import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

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
import PostEditPage from '../pages/admin/posts/PostEditPage';
import PendingContentPage from '../pages/admin/posts/PendingContentPage';
import MembershipPlanList from '../pages/admin/membership/MembershipPlanList';
import MembershipPlanCreate from '../pages/admin/membership/MembershipPlanCreate';

// --- NEW IMPORTS FOR MEMBER MANAGEMENT ---
const MemberListPage = React.lazy(() => import('../pages/admin/member/MemberListPage'));
const AdminListPage = React.lazy(() => import('../pages/admin/member/AdminListPage'));
const CreateAdminPage = React.lazy(() => import('../pages/admin/member/CreateAdminPage'));
const EditAdminPage = React.lazy(() => import('../pages/admin/member/EditAdminPage'));

// Lazy Loaded Pages
const Home = React.lazy(() => import('../pages/Home'));
const Membership = React.lazy(() => import('../pages/MembershipPage'));
const Game = React.lazy(() => import('../pages/Game'));
const EventPage = React.lazy(() => import('../pages/EventPage'));
const FanOfMonthPage = React.lazy(() => import('../pages/FanOfMonthPage'));

const MembershipSuccessPage = React.lazy(() => import('../pages/MembershipSuccess'));

const Leaderboards = React.lazy(() => import('../pages/Leaderboard'));
const Store = React.lazy(() => import('../pages/Store'));

const Login = React.lazy(() => import('../pages/Login'));
const Signup = React.lazy(() => import('../pages/Signup'));
const VerifyOtp = React.lazy(() => import('../pages/VerifyOtp'));
const ForgotPassword = React.lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/ResetPassword'));
const CookiePolicy = React.lazy(() => import('../pages/CookiePolicy'));
const Terms = React.lazy(() => import('../components/common/TermsModal'));
const Privacy = React.lazy(() => import('../components/common/PrivacyPolicyModal'));

// Member Dashboard Pages
const MemberProfile = React.lazy(() => import('../pages/dashboard/MemberProfile'));
const MemberFeed = React.lazy(() => import('../pages/dashboard/MemberFeed'));
const MemberPostEditPage = React.lazy(() => import('../pages/dashboard/MemberPostEditPage'));
const MyContentPage = React.lazy(() => import('../pages/dashboard/MyContentPage'));

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

const EventDetailsPage = React.lazy(() => import('../pages/EventDetailsPage'));

const GameListPage = React.lazy(() => import('../pages/admin/games/GameListPage'));
const CreateGamePage = React.lazy(() => import('../pages/admin/games/CreateGamePage'));
const EditGamePage = React.lazy(() => import('../pages/admin/games/EditGamePage'));

const EventListPage = React.lazy(() => import('../pages/admin/events/EventListPage'));
const CreateEventPage = React.lazy(() => import('../pages/admin/events/CreateEventPage'));
const EditEventPage = React.lazy(() => import('../pages/admin/events/EditEventPage'));

const AnalyticsReportPage = React.lazy(() => import('../pages/admin/reports/AnalyticsReportPage'));

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
  return !isLoggedIn ? <>{element}</> : <Navigate to="/home" replace />;
};

// Wrapper component for Terms Modal
const TermsPage: React.FC = () => {
  const isOpen = true;
  const handleClose = () => {
    window.history.back();
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Terms isOpen={isOpen} onClose={handleClose} />
    </Suspense>
  );
};

// Wrapper component for Privacy Policy Modal
const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<div>Loading privacy policy...</div>}>
      <Privacy isOpen={true} onClose={() => navigate(-1)} />
    </Suspense>
  );
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
  const isMember = user.roles?.some((role) => allowedRoles.includes(getRoleName(role)));

  if (!isMember) {
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
          <Route path="/membership/success" element={<MembershipSuccessPage />} />
          <Route path="/fan-of-the-month" element={<FanOfMonthPage />} />
          <Route path="/games" element={<Game />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Resolved Conflict: Merged these three routes */}
          <Route path="/dashboard-access" element={<DashboardRedirect />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          {/* MEMBER DASHBOARD ROUTES (Protected) */}
          <Route path="/dashboard" element={<UserRoute element={<MemberLayout />} />}>
            <Route index element={<MemberProfile />} />
            <Route path="my-content" element={<MyContentPage />} />
            <Route path="feed" element={<MemberFeed />} />
            <Route path="posts/edit/:id" element={<MemberPostEditPage />} />
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
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/games/memory-challenge" element={<MemoryChallenge />} />
          <Route path="/games/memory-challenge/start" element={<MemoryGame />} />
          <Route path="/games/protect-queen" element={<ProtectQueenStart />} />
          <Route path="/games/protect-area" element={<SpaceInvadersTVK />} />
          <Route path="/games/protect-area/start" element={<SpaceInvadersGame />} />
          <Route path="/games/villain-hunt" element={<WhackAMoleStart />} />
          <Route path="/games/villain-hunt/start" element={<WhackAMoleGame />} />
          <Route path="/games/trivia" element={<TriviaGameStart />} />
          <Route path="/games/trivia/start" element={<TriviaGame />} />
          <Route path="/games/jigsaw-puzzle" element={<JigsawPuzzleStart />} />
          <Route path="/games/jigsaw-puzzle/start" element={<JigsawPuzzleGame />} />
          <Route path="/games/city-defender" element={<CityDefenderStart />} />
          <Route path="/games/city-defender/start" element={<CityDefenderGame />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="posts" element={<PostListPage />} />
            <Route path="posts/pending" element={<PendingContentPage />} />
            <Route path="posts/create" element={<PostCreatePage />} />
            <Route path="posts/:id" element={<PostDetailsPage />} />
            <Route path="posts/:id/edit" element={<PostEditPage />} />
            <Route path="membership" element={<MembershipPlanList />} />
            <Route path="membership/create" element={<MembershipPlanCreate />} />

            <Route path="games" element={<GameListPage />} />
            <Route path="games/create" element={<CreateGamePage />} />
            <Route path="games/edit/:id" element={<EditGamePage />} />

            <Route path="events" element={<EventListPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/edit/:id" element={<EditEventPage />} />

            {/* MEMBER MANAGEMENT ROUTES */}
            <Route path="members" element={<MemberListPage />} />
            <Route path="members/admins" element={<AdminListPage />} />
            <Route path="members/admins/create" element={<CreateAdminPage />} />
            <Route path="members/admins/edit/:id" element={<EditAdminPage />} />

            {/* ANALYTICS REPORT ROUTE */}
            <Route path="reports/analytics" element={<AnalyticsReportPage />} />

            <Route path="settings" element={<div className="text-white p-8">Settings</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};
//
export default AppRoutes;
