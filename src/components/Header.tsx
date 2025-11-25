import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import MobileMenu from './MobileMenu';

const navItems = [
  { name: 'HOME', path: '/' },
  { name: 'MEMBERSHIP', path: '/membership' },
  { name: 'GAME', path: '/game' },
  { name: 'EVENTS', path: '/events' },
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

  const isActive = (path: string) => location.pathname === path;
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <motion.header
        className="w-full bg-brand-dark text-white h-24 px-8 md:px-16 flex items-center justify-between z-50 relative"
        initial="hidden"
        animate="visible"
        variants={headerContainerVariants}
      >
        {/* 1. --- Logo Section (Animated first by majorItemVariants) --- */}
        <motion.div className="flex-shrink-0" variants={majorItemVariants}>
          <Link to="/">
            <img src="/images/tvk-logo.png" alt="TVK Logo" className="h-20 w-auto object-contain" />
          </Link>
        </motion.div>

        {/* 2. --- Navigation Links (Desktop: Animated second) --- */}
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

        {/* 3. --- Login Button (Animated third) / Mobile Menu Button --- */}
        <motion.div variants={majorItemVariants}>
          <button className="hidden md:block bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-8 py-2 rounded hover:opacity-90 transition-opacity text-lg shadow-lg">
            Login/ Join
          </button>

          {/* Mobile Menu Button (Hamburger Icon) */}
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

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navItems={navItems} />
    </>
  );
};

export default Header;
