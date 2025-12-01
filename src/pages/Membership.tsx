import React from 'react';
import Header from '../components/Header';

const Membership: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* 1. The Header */}
      <Header />

      {/* 2. Page Content */}
      <main className="container mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-gradient-gold">Membership Plans</span>
        </h1>
        
        {/* Simple Placeholder Content */}
        <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
                <div key={item} className="border border-gray-700 p-8 rounded-lg hover:border-brand-gold transition-colors bg-black/20">
                    <h3 className="text-xl font-bold mb-4">Plan {item}</h3>
                    <p className="text-gray-400 mb-6">Unlock exclusive access to TVK content and community features.</p>
                    <button className="w-full py-2 bg-gray-800 rounded hover:bg-brand-gold hover:text-black font-bold transition-all">
                        Select Plan
                    </button>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Membership;