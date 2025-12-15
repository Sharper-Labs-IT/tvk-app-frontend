import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import your Auth Context

const AdminHeader: React.FC = () => {
  const { user } = useAuth(); // Get real user data
  const navigate = useNavigate();

  // 1. Safely derive display name and role
  const displayName = user?.name || 'Admin User';
  const firstRole = user?.roles?.[0];
  const displayRole = (typeof firstRole === 'string' ? firstRole : firstRole?.name) || 'Admin';

  // 2. Generate dynamic avatar based on real name
  const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=E6C65B&color=000`;

  const handleProfileClick = () => {
    navigate('/admin/profile');
  };

  return (
    <header className="h-16 bg-tvk-dark-card border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-10 ml-64">
      {/* Left Side: Logo */}
      <div className="flex items-center gap-3">
        {/* Ensure this image exists in public/images/ */}
        <img
          src="/images/tvk-logo.png"
          alt="TVK Logo"
          className="h-10 w-auto object-contain"
          // Optional: Add error handling if image missing
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Right Side: User Profile (Clickable) */}
      <div
        onClick={handleProfileClick}
        className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
        title="View Profile"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{displayName}</p>
          <p className="text-xs text-gold uppercase tracking-wide">{displayRole}</p>
        </div>

        <div className="h-10 w-10 rounded-full bg-brand-footerBlue p-0.5 border border-gold">
          <img
            src={imageUrl}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
