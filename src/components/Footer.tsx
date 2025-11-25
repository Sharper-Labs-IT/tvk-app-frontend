import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-footerBlue text-gray-300 py-12 px-8 md:px-12 lg:px-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-gray-600 pb-8 mb-8">
          
          <div className="col-span-1 md:col-span-1 lg:col-span-1 flex justify-center md:justify-start items-center">
            <Link to="/">
              <img 
                src="/images/tvk-logo.png" 
                alt="TVK Logo" 
                className="h-20 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 text-center md:text-left">
            <h4 className="text-white text-lg font-bold mb-4 uppercase">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
              <li><Link to="/membership" className="hover:text-brand-gold transition-colors">Membership</Link></li>
              <li><Link to="/community" className="hover:text-brand-gold transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 text-center md:text-left">
            <h4 className="text-white text-lg font-bold mb-4 uppercase">Connect</h4>
            <ul className="space-y-2">
              <li><Link to="/events" className="hover:text-brand-gold transition-colors">Events</Link></li>
              <li><Link to="/shop" className="hover:text-brand-gold transition-colors">Shop</Link></li>
              <li><Link to="/global-map" className="hover:text-brand-gold transition-colors">Global Map</Link></li>
            </ul>
          </div>

          {/* Column 4: Follow Us (Social Icons) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col items-center md:items-end">
            <h4 className="text-white text-lg font-bold mb-4 uppercase">Follow Us</h4>
            <div className="flex space-x-6 text-2xl">
              {/* Facebook Icon */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold transition-colors">
                <FaFacebookF /> 
              </a>
              {/* Instagram Icon */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold transition-colors">
                <FaInstagram /> 
              </a>
              {/* Twitter Icon */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold transition-colors">
                <FaTwitter /> 
              </a>
            </div>
          </div>

        </div>

        {/* Copyright Section */}
        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} TVK Members ONLY – GLOBAL. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;