import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminNotifications } from '../../context/AdminNotificationContext';
import { formatTimeAgo } from '../../utils/dateUtils';

const AdminHeader: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

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

  const getIconForType = (type: string) => {
      switch (type) {
          case 'order': return <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold">OR</div>;
          case 'refund': return <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 text-xs font-bold">RF</div>;
          case 'user': return <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 text-xs font-bold">US</div>;
          default: return <div className="w-8 h-8 rounded-full bg-gray-500/20 text-gray-400 flex items-center justify-center shrink-0 text-xs font-bold">SY</div>;
      }
  };

  return (
    <header className="h-16 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40 ml-64">
      {/* Left Side: Global Search */}
      <div className="flex items-center flex-1 max-w-lg">
          <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
               <input 
                   type="text" 
                   placeholder="Global Search (Ctrl+K)..." 
                   className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-gold/50 focus:bg-white/10 transition-colors"
               />
          </div>
      </div>

      {/* Right Side: Actions & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <div className="relative">
             <button 
                 onClick={() => setShowNotifications(!showNotifications)}
                 className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg relative transition-colors"
             >
                 <Bell size={20} />
                 {unreadCount > 0 && (
                     <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-[#0a0a0a]" />
                 )}
             </button>
             
             {/* Dropdown */}
             {showNotifications && (
                 <div className="absolute right-0 top-full mt-2 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                     <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                         <span className="font-bold text-white text-sm">Notifications ({unreadCount})</span>
                         {unreadCount > 0 && (
                            <button 
                                onClick={() => markAllAsRead()}
                                className="text-xs text-brand-gold cursor-pointer hover:underline flex items-center gap-1"
                            >
                                <Check size={12} /> Mark all read
                            </button>
                         )}
                     </div>
                     <div className="max-h-64 overflow-y-auto">
                         {notifications.length === 0 ? (
                             <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                 No new notifications
                             </div>
                         ) : (
                             notifications.map((notif) => (
                                <div 
                                    key={notif.id}
                                    onClick={() => {
                                        if (!notif.is_read) markAsRead(notif.id);
                                        if (notif.link) navigate(notif.link);
                                    }}
                                    className={`px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 relative ${!notif.is_read ? 'bg-white/5' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        {getIconForType(notif.type)}
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notif.is_read ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {formatTimeAgo(notif.created_at)}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="w-2 h-2 bg-brand-gold rounded-full flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                </div>
                             ))
                         )}
                     </div>
                 </div>
             )}
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-white/10 mx-2" />

        {/* User Profile (Clickable) */}
        <div
            onClick={handleProfileClick}
            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 pr-3 rounded-lg transition-colors group"
            title="View Profile"
        >
            <div className="h-9 w-9 rounded-full bg-brand-footerBlue p-0.5 border border-brand-gold/30 group-hover:border-brand-gold transition-colors">
            <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
            />
            </div>
            <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-gray-200 group-hover:text-white leading-tight">{displayName}</p>
            <p className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">{displayRole}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
