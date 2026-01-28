import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  LayoutDashboard,
  Gamepad2,
  Calendar,
  Crown,
  LogOut,
  ChevronDown,
  FileText,
  Home,
  FolderOpen,
  ShoppingBag,
  Package,
  Film,
} from 'lucide-react';

const MemberNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [studioDropdownOpen, setStudioDropdownOpen] = useState(false);
  const location = useLocation();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const studioDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (studioDropdownRef.current && !studioDropdownRef.current.contains(event.target as Node)) {
        setStudioDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Feed', path: '/dashboard/feed', icon: <FileText size={20} /> },
    { name: 'Games', path: '/games', icon: <Gamepad2 size={20} /> },
    { name: 'Store', path: '/store', icon: <ShoppingBag size={20} /> },
    { 
      name: 'Studio', 
      path: null, // null means dropdown only, don't navigate
      icon: <Film size={20} />,
      subLinks: [
        { name: 'My Studio', path: '/story-studio', icon: <FolderOpen size={20} /> },
        { name: 'Create Story', path: '/story-studio/create', icon: <FolderOpen size={20} /> },
        { name: 'Stories', path: '/story-feed', icon: <Film size={20} /> }
      ]
    },
    { name: 'Events', path: '/events', icon: <Calendar size={20} /> },
    { name: 'Membership', path: '/membership', icon: <Crown size={20} /> },
  ];

  // Helper to highlight active link
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    // Exact match for dashboard root, startsWith for sub-pages like /dashboard/feed
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/95 border-b border-gold/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="/images/tvk-logo.png"
              alt="TVK Logo"
              className="h-12 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2 lg:space-x-4">
              {navLinks.map((link) => (
                <div key={link.name} className="relative">
                  {link.subLinks ? (
                    // Dropdown menu for Studio
                    <div
                      ref={link.name === 'Studio' ? studioDropdownRef : null}
                      onMouseEnter={() => {
                        if (link.name === 'Studio') setStudioDropdownOpen(true);
                      }}
                      onMouseLeave={() => {
                        if (link.name === 'Studio') setStudioDropdownOpen(false);
                      }}
                      className="relative"
                    >
                      <button
                        id="tour-nav-studio"
                        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 
                        ${
                          isActive('/story-studio') || isActive('/story-feed')
                            ? 'text-black bg-gold'
                            : 'text-gray-300 hover:text-gold hover:bg-white/5'
                        }`}
                      >
                        {link.icon}
                        <span className="hidden sm:inline">{link.name}</span>
                        <ChevronDown size={14} />
                      </button>
                      
                      {/* Dropdown */}
                      {studioDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-gold/20 rounded-md shadow-lg py-1 min-w-[160px] sm:min-w-[180px] z-50">
                          {link.subLinks.map((subLink) => (
                            <Link
                              key={subLink.name}
                              to={subLink.path}
                              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors duration-200 
                              ${
                                isActive(subLink.path)
                                  ? 'text-gold bg-white/5'
                                  : 'text-gray-300 hover:text-gold hover:bg-white/5'
                              }`}
                            >
                              {subLink.icon}
                              {subLink.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular link
                    <Link
                      to={link.path}
                      id={`tour-nav-${link.name.toLowerCase().replace(' ', '-')}`}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 
                      ${
                        isActive(link.path)
                          ? 'text-black bg-gold'
                          : 'text-gray-300 hover:text-gold hover:bg-white/5'
                      }`}
                    >
                      {link.icon}
                      <span className="hidden sm:inline">{link.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 relative" ref={dropdownRef}>
              <button
                id="tour-profile-menu"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center max-w-xs bg-tvk-dark rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gold p-1 border border-gold/30 hover:border-gold transition-colors"
              >
                <img
                  className="h-9 w-9 rounded-full object-cover"
                  src={
                    user?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=E6C65B&color=000`
                  }
                  alt="User Avatar"
                />
                <span className="ml-2 text-gray-200 font-medium pr-2 max-w-[100px] truncate">
                  {user?.name}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 mr-2 transition-transform ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isProfileDropdownOpen && (
                // UPDATED: Added 'top-full' to push the dropdown below the button
                <div className="origin-top-right absolute right-0 top-full mt-2 w-56 rounded-md shadow-lg py-1 bg-[#1a1a1a] border border-gold/20 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-bold text-gold truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/dashboard/my-content"
                    id="tour-my-content-link"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-gold"
                  >
                    <FolderOpen size={16} />
                    My Content
                  </Link>

                  <Link
                    to="/orders"
                    id="tour-my-orders-link"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-gold"
                  >
                    <Package size={16} />
                    My Orders
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gold hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-tvk-dark border-b border-gold/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile User Info */}
            <div className="px-3 py-2 flex items-center gap-3 border-b border-white/10 mb-2">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.name}&background=E6C65B&color=000`
                }
                alt="User Avatar"
              />
              <div>
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate w-40">{user?.email}</p>
              </div>
            </div>

            {navLinks.map((link) => (
              <div key={link.name}>
                {link.subLinks ? (
                  // Studio with sub-links (no main link navigation)
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    {link.icon}
                    {link.name}
                  </button>
                ) : (
                  <Link
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium 
                      ${
                        isActive(link.path)
                          ? 'bg-gold/10 text-gold border-l-4 border-gold'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                )}
                {/* Sub-links for mobile */}
                {link.subLinks && link.subLinks.map((subLink) => (
                  <Link
                    key={subLink.name}
                    to={subLink.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 pl-10 pr-3 py-2 rounded-md text-sm font-medium 
                      ${
                        isActive(subLink.path)
                          ? 'bg-gold/10 text-gold border-l-4 border-gold'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {subLink.icon}
                    {subLink.name}
                  </Link>
                ))}
              </div>
            ))}

            {/* Mobile Profile Links */}
            <div className="border-t border-white/10 pt-2 mt-2">
              <Link
                to="/dashboard/my-content"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <FolderOpen size={20} />
                My Content
              </Link>
              <Link
                to="/orders"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <Package size={20} />
                My Orders
              </Link>
            </div>

            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-400 hover:bg-white/5"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MemberNavbar;
