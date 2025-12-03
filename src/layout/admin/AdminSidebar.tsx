import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Post Management', path: '/admin/posts', icon: FileText },
  { name: 'Member Management', path: '/admin/members', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-tvk-dark-card border-r border-white/10 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      {/* Sidebar Header / Logo Area - Matches TopBar height */}
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <span className="text-xl font-bold text-white tracking-wider">
          TVK <span className="text-gold">ADMIN</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          // Check if this is the active link
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-tvk-accent-gold/10 text-gold border-l-4 border-gold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon
                size={20}
                className={isActive ? 'text-gold' : 'text-gray-500 group-hover:text-white'}
              />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 w-full px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
