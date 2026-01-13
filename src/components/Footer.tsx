import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion'; // explicit type import

const Footer: React.FC = () => {
  // 1. Container Animation (Staggers the children)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Time delay between each column appearing
      },
    },
  };

  // 2. Individual Item Animation (Fade Up)
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <footer className="bg-brand-footerBlue text-gray-300 py-12 px-8 md:px-12 lg:px-20 overflow-hidden">
      <div className="container mx-auto">
        {/* Animated Grid Container */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-brand-gold pb-8 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Animates once when 20% visible
        >
          {/* Column 1: Logo */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-1 lg:col-span-1 flex justify-center md:justify-start items-center"
          >
            <Link to="/">
              <img
                src="/images/tvk-logo.png"
                alt="TVK Logo"
                className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-1 lg:col-span-1 text-center md:text-left"
          >
            <h4 className="text-white text-lg font-bold mb-4 uppercase">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-brand-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/membership" className="hover:text-brand-gold transition-colors">
                  Membership
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-brand-gold transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-brand-gold transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-brand-gold transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 3: Connect */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-1 lg:col-span-1 text-center md:text-left"
          >
            <h4 className="text-white text-lg font-bold mb-4 uppercase">Connect</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="hover:text-brand-gold transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-brand-gold transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/global-map" className="hover:text-brand-gold transition-colors">
                  Global Map
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 4: Follow Us (Social Icons) */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col items-center md:items-end"
          >
            <h4 className="text-white text-lg font-bold mb-4 uppercase">Follow Us</h4>
            <div className="flex space-x-6 text-2xl">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61585391693093"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-brand-gold hover:-translate-y-1 transition-all duration-300"
              >
                <FaFacebookF />
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/tvk_members/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-brand-gold hover:-translate-y-1 transition-all duration-300"
              >
                <FaInstagram />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-gray-500 text-sm"
        >
          © {new Date().getFullYear()} TVK GLOBAL Membership Programme. All rights reserved.
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
