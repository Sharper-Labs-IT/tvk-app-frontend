import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';

// Updated interface to accept auth data and logout handler
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { name: string; path: string }[];
  isLoggedIn: boolean;
  user: any;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  isLoggedIn,
  user,
  onLogout,
}) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Extract first name for mobile display
  const userName = user?.name?.split(' ')[0] || 'User';

  const menuVariants: Variants = {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: { type: 'tween', duration: 0.3 },
    },
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
    >
      {/* Semi-transparent background */}
      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-in Menu Panel */}
      <motion.nav
        className="absolute top-0 right-0 h-full w-3/4 max-w-sm bg-brand-dark shadow-2xl p-6 text-white overflow-y-auto"
        variants={menuVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-8">
          <button onClick={onClose} className="p-2 transition-colors hover:text-brand-gold">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <ul className="space-y-4">
          {navItems.map((item, index) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={onClose}
            >
              <Link
                to={item.path}
                className={`
                  block text-lg font-medium p-2 transition-colors uppercase tracking-wide
                  ${isActive(item.path) ? 'text-brand-gold' : 'hover:text-brand-gold'}
                `}
              >
                {item.name}
              </Link>
            </motion.li>
          ))}

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + navItems.length * 0.05 }}
            className="h-px bg-gray-700 my-6"
          />

          {/* Dynamic Auth Button */}
          <motion.li
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + navItems.length * 0.05 }}
            className="pt-2"
          >
            {isLoggedIn ? (
              <button
                onClick={() => {
                  onClose(); // Close menu
                  onLogout(); // Trigger logout modal in parent
                }}
                className="w-full bg-red-600/10 border border-red-600 text-red-500 font-bold px-8 py-3 rounded hover:bg-red-600 hover:text-white transition-all text-base shadow-lg"
              >
                Logout ({userName})
              </button>
            ) : (
              <Link to="/login" onClick={onClose}>
                <button className="w-full bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-8 py-3 rounded hover:opacity-90 transition-opacity text-base shadow-lg">
                  Login / Join
                </button>
              </Link>
            )}
          </motion.li>
        </ul>
      </motion.nav>
    </motion.div>
  );
};

export default MobileMenu;
