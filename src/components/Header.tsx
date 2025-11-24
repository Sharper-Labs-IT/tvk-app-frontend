import React from 'react';
import { Link } from 'react-router-dom';
// If you have the logo, uncomment the line below:
// import logo from '../assets/logo.png'; 

const Header: React.FC = () => {
  return (
    <header className="w-full bg-brand-dark text-white h-24 px-8 flex items-center justify-between border-b border-gray-800">
      
      <div className="flex-shrink-0">
        <Link to="/">
          <img 
            src="/images/tvk-logo.png"  
            alt="TVK Logo" 
            className="h-20 w-auto object-contain"
          />
        </Link>
      </div>

      {/* 2. Navigation Links (Center) */}
      <nav>
        <ul className="flex space-x-12">
          {['HOME', 'MEMBERSHIP', 'GAME', 'EVENTS'].map((item) => (
            <li key={item}>
              <Link 
                to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`} 
                className="text-white text-lg font-medium hover:text-brand-gold transition-colors relative group uppercase tracking-wide"
              >
                {item}
                {/* This creates the underline effect if needed */}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 3. Login Button (Right) */}
      <div>
        <button className="bg-gradient-to-r from-brand-goldDark to-brand-gold text-blue-900 font-bold px-8 py-2 rounded hover:opacity-90 transition-opacity text-lg shadow-lg">
          Login/ Join
        </button>
      </div>
    </header>
  );
};

export default Header;