import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  // 1. Get the current URL location
  const location = useLocation();

  // 2. Define our menu items and their paths clearly
  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'MEMBERSHIP', path: '/membership' },
    { name: 'GAME', path: '/game' },
    { name: 'EVENTS', path: '/events' },
  ];

  // 3. Helper function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    // Header container (transparent, on top of everything)
    <header className="w-full text-white h-24 px-8 flex items-center justify-between z-50 relative">
      
      {/* --- Logo Section --- */}
      <div className="flex-shrink-0">
        <Link to="/">
          <img 
            src="/images/tvk-logo.png" 
            alt="TVK Logo" 
            className="h-20 w-auto object-contain" 
          />
        </Link>
      </div>

      {/* --- Navigation Links --- */}
      <nav className="hidden md:block"> {/* Hidden on mobile, shown on desktop */}
        <ul className="flex space-x-12">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.path} 
                className={`
                  text-lg font-medium transition-colors relative group uppercase tracking-wide
                  ${isActive(item.path) ? 'text-brand-gold' : 'text-white hover:text-brand-gold'}
                `}
              >
                {item.name}
                
                <span className={`
                  absolute -bottom-1 left-0 h-0.5 bg-brand-gold transition-all duration-300
                  ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}
                `}></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- Login Button --- */}
      <div>
        <button className="bg-gradient-to-r from-brand-goldDark to-brand-gold text-blue-900 font-bold px-8 py-2 rounded hover:opacity-90 transition-opacity text-lg shadow-lg">
          Login/ Join
        </button>
      </div>
    </header>
  );
};

export default Header;