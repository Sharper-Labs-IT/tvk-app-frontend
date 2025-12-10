import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import MobileMenu from './MobileMenu';
import { useAuth } from '../context/AuthContext';

import ConfirmationModal from '../components/common/ConfirmationModal'; 

import ConfirmationModal from '../components/common/ConfirmationModal'; // 👈 NEW IMPORT


const navItems = [
  { name: 'HOME', path: '/' },
  { name: 'MEMBERSHIP', path: '/membership' },
  { name: 'GAME', path: '/game' },
  { name: 'EVENTS', path: '/events' },
  { name: 'LEADERBOARD', path: '/leaderboard' },
  { name: 'STORE', path: '/store' },
];


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

  const { isLoggedIn, user, logout } = useAuth();

  const isHome = location.pathname === '/';
  const isActive = (path: string) => location.pathname === path;

  // --- 1. DYNAMIC NAVIGATION LOGIC ---
  const navItems = useMemo(() => {
    // Determine where the "DASHBOARD" button should point
    let dashboardPath = '/login'; // Default for guests

    if (isLoggedIn && user?.roles) {
      // 🛑 FIX: Handle roles as strings (New Backend) instead of objects (Old Backend)
      // We map directly to lowercase strings.
      // We use 'any' cast on 'r' just to be safe if types aren't fully synced yet.
      const roleNames = user.roles.map((r: any) => {
        if (typeof r === 'string') return r.toLowerCase();
        if (typeof r === 'object' && r.name) return r.name.toLowerCase();
        return '';
      });

      if (roleNames.includes('admin') || roleNames.includes('moderator')) {
        dashboardPath = '/admin/dashboard';
      } else {
        dashboardPath = '/dashboard';
      }
    }

    return [
      { name: 'HOME', path: '/' },
      { name: 'MEMBERSHIP', path: '/membership' },
      { name: 'SHOP', path: '/shop' },
      { name: 'GAME', path: '/game' },
      { name: 'EVENTS', path: '/events' },
      { name: 'DASHBOARD', path: dashboardPath }, // 👈 Dynamic Path
    ];
  }, [isLoggedIn, user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const AuthButton = () => {
    if (isLoggedIn) {
      return (
        <button
          onClick={() => setShowLogoutModal(true)}
          className="hidden md:block bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-base shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Logout ({user?.name?.split(' ')[0]})
        </button>
      );
    }
    return (
      <Link
        to="/login"
        className="hidden md:block bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-base shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Login / Join
      </Link>
    );
  };

  return (
    <>
      <motion.header
        className="w-full bg-brand-dark text-white h-24 px-8 md:px-12 flex items-center z-50 relative"
        initial="hidden"
        animate="visible"
        variants={headerContainerVariants}
      >
        {/* Logo Section */}
        <motion.div className="flex-shrink-0 relative mr-4" variants={majorItemVariants}>
          <Link to="/" className="block relative">
            <img
              src="/images/tvk-logo.png"
              alt="TVK Logo"
              className={`
                object-contain transition-all duration-300 ease-in-out z-50
                relative h-20 w-auto
                ${
                  isHome
                    ? 'md:absolute md:top-0 md:h-48 md:max-w-none md:drop-shadow-xl'
                    : 'md:relative md:h-20'
                }
              `}
            />
            {isHome && (
              <img
                src="/images/tvk-logo.png"
                alt=""
                aria-hidden="true"
                className="hidden md:block h-20 w-auto opacity-0"
              />
            )}
          </Link>
        </motion.div>

        {/* Navigation Links */}
        <motion.nav className="hidden md:block ml-auto mr-1" variants={navStaggerVariants}>
          <motion.ul className="flex space-x-6" variants={navStaggerVariants}>
            {navItems.map((item) => (
              <motion.li key={item.name} variants={majorItemVariants}>
                <Link
                  to={item.path}
                  className={`
                    text-base font-bold transition-colors relative group uppercase tracking-wider
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

        {/* Login/Logout Button */}
        <motion.div variants={majorItemVariants} className="flex-shrink-0 ml-auto">
          <AuthButton />
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

      {/* Mobile Menu Component - Passing the dynamic items */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navItems={navItems} />
    </>
  );
};

export default Header;
