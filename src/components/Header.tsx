import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import MobileMenu from './MobileMenu';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

const headerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.6,
      staggerChildren: 0.4,
    },
  },
};

const majorItemVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const navStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [playDropdownOpen, setPlayDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { isLoggedIn, user, logout } = useAuth();

  const isHome = location.pathname === '/';
  const isActive = (path: string) => location.pathname === path;

  // --- DYNAMIC NAVIGATION LOGIC ---
  const dynamicNavItems = useMemo(() => {
    return [
      { name: 'MEMBERSHIP', path: '/membership' },
      { name: 'STORE', path: '/store' },
      { name: 'EVENTS', path: '/events' },
    ];
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (isLoggedIn && user?.roles) {
      const roleNames = user.roles.map((r: any) => {
        if (typeof r === 'string') return r.toLowerCase();
        if (typeof r === 'object' && r.name) return r.name.toLowerCase();
        return '';
      });

      if (roleNames.includes('admin') || roleNames.includes('moderator')) {
        return '/admin/dashboard';
      } else {
        return '/dashboard';
      }
    }
    return '/login';
  };

  // Triggered by Mobile Menu Logout button
  const handleMobileLogoutTrigger = () => {
    setIsMenuOpen(false); // Ensure menu is closed
    setShowLogoutModal(true); // Show the confirmation modal
  };

  // Actual Logout Logic (after confirmation)
  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.header
        className="w-full bg-brand-dark text-white h-24 px-4 md:px-6 lg:px-12 flex items-center z-50 relative"
        initial="hidden"
        animate="visible"
        variants={headerContainerVariants}
      >
        <motion.div className="flex-shrink-0 relative mr-2 md:mr-4" variants={majorItemVariants}>
          <Link to="/" className="block relative">
            <img
              src="/images/tvk-logo.png"
              alt="TVK Logo"
              className={`
                object-contain transition-all duration-300 ease-in-out z-50
                relative h-16 md:h-20 w-auto
                ${
                  isHome
                    ? 'xl:absolute xl:top-0 xl:h-36 xl:max-w-none xl:drop-shadow-xl'
                    : 'xl:relative xl:h-20'
                }
              `}
            />
            {/* Invisible spacer to hold width when logo is absolute */}
            {isHome && (
              <img
                src="/images/tvk-logo.png"
                alt=""
                aria-hidden="true"
                className="hidden xl:block h-20 w-auto opacity-0"
              />
            )}
          </Link>
        </motion.div>

        {/* Navigation Links (Desktop Only) */}
        <motion.nav className="hidden md:block ml-auto mr-2 md:mr-4" variants={navStaggerVariants}>
          <motion.ul className="flex space-x-3 xl:space-x-6" variants={navStaggerVariants}>
            {/* Added HOME link explicitly for desktop menu */}
            <motion.li key="HOME" variants={majorItemVariants}>
              <Link
                to="/"
                className={`
                  text-sm lg:text-base font-bold transition-colors relative group uppercase tracking-wider
                  ${isActive('/') ? 'text-brand-gold' : 'text-white hover:text-brand-gold'}
                `}
              >
                HOME
                <span
                  className={`
                    absolute -bottom-1 left-0 h-0.5 bg-brand-gold transition-all duration-300
                    ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}
                  `}
                ></span>
              </Link>
            </motion.li>

            {/* Feed link - only show when logged in */}
            {isLoggedIn && (
              <motion.li key="FEED" variants={majorItemVariants}>
                <Link
                  to="/dashboard/feed"
                  className={`
                    text-sm lg:text-base font-bold transition-colors relative group uppercase tracking-wider
                    ${isActive('/dashboard/feed') ? 'text-brand-gold' : 'text-white hover:text-brand-gold'}
                  `}
                >
                  FEED
                  <span
                    className={`
                      absolute -bottom-1 left-0 h-0.5 bg-brand-gold transition-all duration-300
                      ${isActive('/dashboard/feed') ? 'w-full' : 'w-0 group-hover:w-full'}
                    `}
                  ></span>
                </Link>
              </motion.li>
            )}

            {/* Play Dropdown */}
            <motion.li 
              key="PLAY" 
              variants={majorItemVariants}
              className="relative"
              onMouseEnter={() => setPlayDropdownOpen(true)}
              onMouseLeave={() => setPlayDropdownOpen(false)}
            >
              <button
                className={`
                  text-sm lg:text-base font-bold transition-colors relative group uppercase tracking-wider
                  ${isActive('/game') || isActive('/leaderboard') ? 'text-brand-gold' : 'text-white hover:text-brand-gold'}
                `}
              >
                PLAY
                <span
                  className={`
                    absolute -bottom-1 left-0 h-0.5 bg-brand-gold transition-all duration-300
                    ${isActive('/game') || isActive('/leaderboard') ? 'w-full' : 'w-0 group-hover:w-full'}
                  `}
                ></span>
              </button>
              
              {/* Dropdown Menu */}
              {playDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-0.5 bg-brand-dark border border-brand-gold/30 rounded-lg shadow-xl min-w-[140px] lg:min-w-[160px] z-50 pt-1.5"
                >
                  <Link
                    to="/game"
                    className="block px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-white hover:bg-brand-gold/20 hover:text-brand-gold transition-colors first:rounded-t-lg font-medium"
                  >
                    GAMES
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="block px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-white hover:bg-brand-gold/20 hover:text-brand-gold transition-colors last:rounded-b-lg font-medium"
                  >
                    LEADERBOARD
                  </Link>
                </motion.div>
              )}
            </motion.li>

            {dynamicNavItems.map((item) => (
              <motion.li key={item.name} variants={majorItemVariants}>
                <Link
                  to={item.path}
                  className={`
                    text-sm lg:text-base font-bold transition-colors relative group uppercase tracking-wider
                    ${isActive(item.path) ? 'text-brand-gold' : 'text-white hover:text-brand-gold'}
                  `}
                >
                  {item.name}
                  <span
                    className={`
                      absolute -bottom-1 left-0 h-0.5 bg-brand-gold transition-all duration-300
                      ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}
                    `}
                  ></span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </motion.nav>

        {/* Login/Logout Button & Mobile Menu Toggle */}
        {/* ADDED ml-auto HERE to force this container to the right on mobile */}
        <motion.div
          variants={majorItemVariants}
          className="flex-shrink-0 flex items-center space-x-4 ml-auto"
        >
          <div className="hidden md:block">
            {isLoggedIn ? (
              <div 
                className="relative"
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <button
                  className="bg-brand-goldDark text-white font-bold px-3 lg:px-4 py-2 rounded-lg text-sm transition-opacity hover:opacity-90 whitespace-nowrap flex items-center gap-1 lg:gap-2"
                >
                  <svg 
                    className="w-4 h-4 lg:w-5 lg:h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                  Profile
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-0.5 bg-brand-dark border border-brand-gold/30 rounded-lg shadow-xl min-w-[140px] lg:min-w-[160px] z-50 pt-1.5"
                  >
                    <Link
                      to={getDashboardPath()}
                      className="block px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-white hover:bg-brand-gold/20 hover:text-brand-gold transition-colors first:rounded-t-lg font-medium"
                    >
                      DASHBOARD
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left block px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-white hover:bg-brand-gold/20 hover:text-brand-gold transition-colors last:rounded-b-lg font-medium"
                    >
                      SIGN OUT
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                to="/signup"
                className="bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-base shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Login / Join
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 transition-colors hover:text-brand-gold"
            onClick={toggleMenu}
            aria-label="Open menu"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </motion.div>
      </motion.header>

      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Log Out"
        cancelText="Stay Logged In"
      />

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navItems={[
          { name: 'HOME', path: '/' },
          ...(isLoggedIn ? [{ name: 'FEED', path: '/dashboard/feed' }] : []),
          ...dynamicNavItems
        ]}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleMobileLogoutTrigger}
        dashboardPath={getDashboardPath()}
      />
    </>
  );
};

export default Header;
