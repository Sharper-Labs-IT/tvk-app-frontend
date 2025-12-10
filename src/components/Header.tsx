import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import MobileMenu from './MobileMenu';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/common/ConfirmationModal'; 

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // 👈 NEW STATE FOR MODAL

  const { isLoggedIn, user, logout } = useAuth();

  // Check if we are on Home page
  const isHome = location.pathname === '/';

  const isActive = (path: string) => location.pathname === path;
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function called when the user confirms logout in the modal
  const handleLogoutConfirm = () => {
    // Calls the context's logout function (which now redirects to '/')
    logout();
    // Close the modal
    setShowLogoutModal(false);
  };

  // Dynamic component to switch between Login/Join and Logout
  const AuthButton = () => {
    // If logged in, show the Logout button
    if (isLoggedIn) {
      return (
        <button
          onClick={() => setShowLogoutModal(true)} // 👈 OPEN MODAL INSTEAD OF DIRECT LOGOUT
          className="hidden md:block bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-8 py-2 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Display user's name (first word) for a more personal touch */}
          Logout ({user?.name.split(' ')[0]})
        </button>
      );
    }
    // If logged out, show the Login/Join button
    return (
      <Link
        to="/login"
        className="hidden md:block bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-8 py-2 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Login / Join
      </Link>
    );
  };

  return (
    <>
      <motion.header
        className="w-full bg-brand-dark text-white h-24 px-8 md:px-16 flex items-center justify-between z-50 relative"
        initial="hidden"
        animate="visible"
        variants={headerContainerVariants}
      >
        {/* 1. --- Logo Section --- */}
        <motion.div className="flex-shrink-0 relative" variants={majorItemVariants}>
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

            {/* PHANTOM LOGO (Desktop Home Only): */}
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

        {/* 2. --- Navigation Links --- */}
        <motion.nav className="hidden md:block" variants={navStaggerVariants}>
          <motion.ul className="flex space-x-12" variants={navStaggerVariants}>
            {navItems.map((item) => (
              <motion.li key={item.name} variants={majorItemVariants}>
                <Link
                  to={item.path}
                  className={`
                    text-lg font-medium transition-colors relative group uppercase tracking-wide
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

        {/* 3. --- Login/Logout Button / Mobile Menu --- */}
        <motion.div variants={majorItemVariants}>
          <AuthButton /> {/* Render the dynamic button */}
          {/* Mobile Hamburger */}
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

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Log Out"
        cancelText="Stay Logged In"
      />

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navItems={navItems} />
    </>
  );
};

export default Header;
