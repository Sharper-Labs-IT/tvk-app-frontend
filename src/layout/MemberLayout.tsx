import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MemberNavbar from '../components/dashboard/MemberNavbar';

const MemberLayout: React.FC = () => {
  const { isLoggedIn, isAuthInitialized } = useAuth();

  // 1. Wait for Auth to load
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gold">
        Loading...
      </div>
    );
  }

  // 2. Protect the route
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-tvk-dark font-sans text-gray-100">
      {/* Top Navigation */}
      <MemberNavbar />

      {/* Main Content Area - Padded top to account for fixed navbar */}
      <main className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MemberLayout;
