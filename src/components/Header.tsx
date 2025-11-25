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

  // Check if we are on Home page
  const isHome = location.pathname === '/';

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
        {/* 1. --- Logo Section --- */}
        <motion.div className="flex-shrink-0 relative" variants={majorItemVariants}>
          <Link to="/" className="block relative">
            {/* LOGO LOGIC UPDATED:
              1. Base classes (Mobile): 'relative h-20'. Always normal size on mobile.
              2. md: classes (Desktop): 
                 - If isHome: 'md:absolute md:top-0 md:h-48'. 
                   (top-0 prevents cut-off, h-48 makes it big).
                 - If not Home: 'md:relative md:h-20'.
            */}
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

            {/* PHANTOM LOGO (Desktop Home Only):
              - hidden on mobile (default)
              - md:block only if isHome is true
              This keeps the spacing correct when the real logo becomes absolute.
            */}
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

        {/* 3. --- Login Button / Mobile Menu --- */}
        <motion.div variants={majorItemVariants}>
          <button className="hidden md:block bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-8 py-2 rounded hover:opacity-90 transition-opacity text-lg shadow-lg">
            Login/ Join
          </button>

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

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navItems={navItems} />
    </>
  );
};

export default Header;
