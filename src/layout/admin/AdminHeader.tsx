import React from 'react';

// Interface for the admin user props (we can make this dynamic later)
interface AdminUser {
  name: string;
  imageUrl: string;
  role: string;
}

const AdminHeader: React.FC = () => {
  // Hardcoded for now, later we fetch this from your backend/state
  const user: AdminUser = {
    name: 'Admin User',
    imageUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=E6C65B&color=000', // Placeholder
    role: 'Super Admin',
  };

  return (
    <header className="h-16 bg-tvk-dark-card border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-10 ml-64">
      {/* Left Side: Logo */}
      <div className="flex items-center gap-3">
        {/* Ensure tvk-logo.png exists in your public folder */}
        <img src="/tvk-logo.png" alt="TVK Logo" className="h-10 w-auto object-contain" />
      </div>

      {/* Right Side: User Profile */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-gold">{user.role}</p>
        </div>

        <div className="h-10 w-10 rounded-full bg-brand-footerBlue p-0.5 border border-gold cursor-pointer">
          <img
            src={user.imageUrl}
            alt={user.name}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
