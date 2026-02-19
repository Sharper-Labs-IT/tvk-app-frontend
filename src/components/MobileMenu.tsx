import React, { useState } from 'react';
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
  dashboardPath?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  isLoggedIn,
  user,
  onLogout,
  dashboardPath = '/dashboard',
}) => {
  const location = useLocation();
  const [playExpanded, setPlayExpanded] = useState(false);
  const [storiesExpanded, setStoriesExpanded] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);

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
            >
              <Link
                to={item.path}
                onClick={onClose}
                className={`
                  block text-lg font-medium p-2 transition-colors uppercase tracking-wide
                  ${isActive(item.path) ? 'text-brand-gold' : 'hover:text-brand-gold'}
                `}
              >
                {item.name}
              </Link>
            </motion.li>
          ))}

          <motion.li
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + navItems.length * 0.05 }}
          >
            <button
              onClick={() => setPlayExpanded(!playExpanded)}
              className={`
                w-full flex items-center justify-between text-lg font-medium p-2 transition-colors uppercase tracking-wide
                ${isActive('/game') || isActive('/leaderboard') ? 'text-brand-gold' : 'hover:text-brand-gold'}
              `}
            >
              PLAY
              <svg
                className={`w-5 h-5 transition-transform ${playExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {playExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-4 mt-2 space-y-2"
              >
                <Link
                  to="/games"
                  onClick={onClose}
                  className={`
                    block text-base font-medium p-2 transition-colors
                    ${isActive('/games') ? 'text-brand-gold' : 'text-gray-300 hover:text-brand-gold'}
                  `}
                >
                  Games
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={onClose}
                  className={`
                    block text-base font-medium p-2 transition-colors
                    ${isActive('/leaderboard') ? 'text-brand-gold' : 'text-gray-300 hover:text-brand-gold'}
                  `}
                >
                  Leaderboard
                </Link>
              </motion.div>
            )}
          </motion.li>

          {isLoggedIn && (
            <motion.li
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + (navItems.length + 1) * 0.05 }}
            >
              <button
                onClick={() => setStoriesExpanded(!storiesExpanded)}
                className={`
                  w-full flex items-center justify-between text-lg font-medium p-2 transition-colors uppercase tracking-wide
                  ${isActive('/stories') || isActive('/stories/create') || isActive('/stories/my-stories') ? 'text-brand-gold' : 'hover:text-brand-gold'}
                `}
              >
                STORIES
                <svg
                  className={`w-5 h-5 transition-transform ${storiesExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {storiesExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="ml-4 mt-2 space-y-2"
                >
                  <Link
                    to="/stories/create"
                    onClick={onClose}
                    className={`
                      block text-base font-medium p-2 transition-colors
                      ${isActive('/stories/create') ? 'text-brand-gold' : 'text-gray-300 hover:text-brand-gold'}
                    `}
                  >
                    ✨ AI Studio
                  </Link>
                  <Link
                    to="/stories"
                    onClick={onClose}
                    className={`
                      block text-base font-medium p-2 transition-colors
                      ${isActive('/stories') ? 'text-brand-gold' : 'text-gray-300 hover:text-brand-gold'}
                    `}
                  >
                    📖 Story Feed
                  </Link>
                  <Link
                    to="/stories/my-stories"
                    onClick={onClose}
                    className={`
                      block text-base font-medium p-2 transition-colors
                      ${isActive('/stories/my-stories') ? 'text-brand-gold' : 'text-gray-300 hover:text-brand-gold'}
                    `}
                  >
                    📚 My Stories
                  </Link>
                </motion.div>
              )}
            </motion.li>
          )}


          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + (navItems.length + 1) * 0.05 }}
          >
            <div className="h-px bg-gray-700 my-6" />
          </motion.li>

          <motion.li
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + (navItems.length + 1) * 0.05 }}
            className="pt-2"
          >
            {isLoggedIn ? (
              <>
                {/* Profile Expandable Menu */}
                <button
                  onClick={() => setProfileExpanded(!profileExpanded)}
                  className="w-full flex items-center justify-between bg-brand-goldDark text-white font-bold px-4 py-3 rounded hover:opacity-90 transition-all text-base shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <svg 
                      className="w-5 h-5" 
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
                    Profile ({userName})
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${profileExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {profileExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 space-y-2 bg-brand-dark/50 rounded p-2"
                  >
                    <Link
                      to={dashboardPath}
                      onClick={onClose}
                      className="block text-base font-medium p-2 text-gray-300 hover:text-brand-gold transition-colors rounded hover:bg-brand-gold/10"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/my-content"
                      onClick={onClose}
                      className="block text-base font-medium p-2 text-gray-300 hover:text-brand-gold transition-colors rounded hover:bg-brand-gold/10"
                    >
                      My Content
                    </Link>
                    <Link
                      to="/orders"
                      onClick={onClose}
                      className="block text-base font-medium p-2 text-gray-300 hover:text-brand-gold transition-colors rounded hover:bg-brand-gold/10"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="w-full text-left block text-base font-medium p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-600/10"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <Link to="/signup" onClick={onClose}>
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
