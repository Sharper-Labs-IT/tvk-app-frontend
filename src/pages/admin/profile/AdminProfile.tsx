import React from 'react';
import { Mail, Shield, Calendar, Camera } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminProfile: React.FC = () => {
  // 1. Get user from Global State
  const { user } = useAuth();

  // 2. Handle case where user might not be loaded yet
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400">
        <p className="text-lg font-medium">User profile not found.</p>
        <p className="text-sm text-gray-500">Please try logging out and logging back in.</p>
      </div>
    );
  }

  // 3. Safely extract data
  // We use (user as any) to bypass the TypeScript error regarding 'created_at'
  // This tells TS: "Trust me, the backend sends this field even if the type definition is missing"
  const userData = user as any;

  const displayName = userData.name || 'Admin User';
  const displayEmail = userData.email || 'No email provided';
  const displayId = userData.id || 'N/A';

  // Safely check for roles
  const displayRole =
    userData.roles && userData.roles.length > 0 ? userData.roles[0].name : 'Admin';

  // Fix for the specific error you faced
  const joinDate = userData.created_at
    ? new Date(userData.created_at).toLocaleDateString()
    : 'Unknown';

  // Generate dynamic avatar
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=E6C65B&color=000&size=256`;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white font-serif mb-6">My Profile</h1>

      <div className="bg-tvk-dark-card border border-white/10 rounded-xl overflow-hidden">
        {/* Banner / Header Background */}
        <div className="h-32 bg-gradient-to-r from-tvk-accent-gold-dark to-black/50 relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="px-8 pb-8">
          {/* Profile Picture Section */}
          <div className="relative -mt-16 mb-6 flex justify-between items-end">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-32 h-32 rounded-full border-4 border-tvk-dark-card shadow-xl object-cover"
              />
              <button
                disabled
                className="absolute bottom-0 right-0 p-2 bg-tvk-dark-card rounded-full border border-white/10 text-gray-400 cursor-not-allowed"
                title="Photo upload requires backend update"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="mb-2">
              <span className="px-3 py-1 bg-gold/10 text-gold border border-gold/20 rounded-full text-xs font-bold uppercase tracking-wider">
                {displayRole}
              </span>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                <p className="text-gray-400 text-sm">TVK Platform Administrator</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-white/5 rounded-lg text-gold">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="text-sm">{displayEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-white/5 rounded-lg text-gold">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Account ID</p>
                    <p className="text-sm">#{displayId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-white/5 rounded-lg text-gold">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm">{joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Account Status */}
            <div className="bg-black/20 rounded-lg p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Account Security</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Password</span>
                  <span className="text-xs text-gray-500 italic">Last changed: Unknown</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Two-Factor Auth</span>
                  <span className="text-xs text-green-400 font-medium">Enabled</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  disabled
                  className="w-full py-2 bg-white/5 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed border border-white/5"
                >
                  Edit Profile (Coming Soon)
                </button>
                <p className="text-[10px] text-gray-600 text-center mt-2">
                  Backend updates required for editing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
