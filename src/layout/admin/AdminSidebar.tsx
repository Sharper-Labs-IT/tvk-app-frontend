import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  List,
  PlusCircle,
} from 'lucide-react';

interface SubNavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface NavItem {
  name: string;
  path?: string; // Optional because parent items might not be links themselves
  icon: React.ElementType;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  {
    name: 'Post Management',
    icon: FileText,
    subItems: [
      { name: 'All Posts', path: '/admin/posts', icon: List },
      { name: 'Add New Post', path: '/admin/posts/create', icon: PlusCircle },
    ],
  },
  { name: 'Member Management', path: '/admin/members', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  // State to track which menu is open (e.g. 'Post Management')
  const [openMenu, setOpenMenu] = useState<string | null>('Post Management');

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <aside className="w-64 min-h-screen bg-tvk-dark-card border-r border-white/10 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <span className="text-xl font-bold text-white tracking-wider">
          TVK <span className="text-gold">ADMIN</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          // Check if parent or any child is active
          const isParentActive = item.subItems
            ? item.subItems.some((sub) => location.pathname === sub.path)
            : location.pathname === item.path;

          const isOpen = openMenu === item.name;

          return (
            <div key={item.name}>
              {item.subItems ? (
                // 1. Dropdown Parent Item
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isParentActive
                      ? 'text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={20}
                      className={
                        isParentActive ? 'text-gold' : 'text-gray-500 group-hover:text-white'
                      }
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                // 2. Regular Single Item
                <Link
                  to={item.path!}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    location.pathname === item.path
                      ? 'bg-tvk-accent-gold/10 text-gold border-l-4 border-gold'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon
                    size={20}
                    className={
                      location.pathname === item.path
                        ? 'text-gold'
                        : 'text-gray-500 group-hover:text-white'
                    }
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              )}

              {/* 3. Dropdown Children */}
              {item.subItems && isOpen && (
                <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                          isSubActive ? 'text-gold bg-white/5' : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        <sub.icon size={16} />
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
