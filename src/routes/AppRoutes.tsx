import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Pages */}
      <Route path="/" element={<Home />} />
      
      {/* Placeholders for future pages */}
      <Route path="/membership" element={<div className="p-10 text-white">Membership Page</div>} />
      <Route path="/game" element={<div className="p-10 text-white">Game Page</div>} />
      <Route path="/events" element={<div className="p-10 text-white">Events Page</div>} />
    </Routes>
  );
};

export default AppRoutes;