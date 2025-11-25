import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion'; 

// Define the shape of the props the MobileMenu component expects
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { name: string; path: string }[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, navItems }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Explicitly type the variants as 'Variants'
  const menuVariants: Variants = {
    hidden: { x: '100%' }, // Start off-screen to the right
    visible: { 
      x: 0, 
      // The type is correct now
      transition: { type: 'tween', duration: 0.3 } 
    },
  };

  // Explicitly type the variants as 'Variants'
  const backdropVariants: Variants = {
    hidden: { opacity: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  if (!isOpen) return null;

  return (
    // Backdrop Overlay
    <motion.div
      className="fixed inset-0 z-50"
      initial="hidden"
      animate="visible" 
      exit="hidden" 
      variants={backdropVariants}
    >
      {/* Semi-transparent background that closes the menu when clicked */}
      <div 
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Slide-in Menu Panel */}
      <motion.nav
        className="absolute top-0 right-0 h-full w-3/4 max-w-sm bg-brand-dark shadow-2xl p-6 text-white"
        variants={menuVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-8">
          {/* Close Button */}
          <button onClick={onClose} className="p-2 transition-colors hover:text-brand-gold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <ul className="space-y-6">
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
                  block text-2xl font-semibold p-2 transition-colors uppercase
                  ${isActive(item.path) ? 'text-brand-gold' : 'hover:text-brand-gold'}
                `}
              >
                {item.name}
              </Link>
            </motion.li>
          ))}
          
          {/* Login/Join Button */}
          <motion.li
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + navItems.length * 0.05 }}
            className="pt-4"
          >
            <Link to="/login">
              <button className="w-full bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold px-8 py-3 rounded hover:opacity-90 transition-opacity text-lg shadow-lg">
                Login/ Join
              </button>
            </Link>
          </motion.li>
        </ul>
      </motion.nav>
    </motion.div>
  );
};

export default MobileMenu;