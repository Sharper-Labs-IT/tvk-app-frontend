import React from 'react';
import Header from '../components/Header';
import AvailablePlans from '../components/membership/AvailablePlans';

const Membership: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* 1. The Header */}
      <Header />

      {/* 2. Page Content */}
      <main className="container mx-auto px-4 sm:px-8 py-12">
        {/* Page Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">
            <span className="text-gradient-gold">Membership Plans</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Join the elite community. Select a plan below to unlock exclusive TVK content, premium
            games, and special event access.
          </p>
        </div>

        {/* 3. Real Dynamic Plans from Database */}
        <AvailablePlans />
      </main>
    </div>
  );
};

export default Membership;
