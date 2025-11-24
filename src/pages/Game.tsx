import React from 'react';
import Header from '../components/Header';

const Game: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Header />

      <main className="container mx-auto px-8 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">
            <span className="text-gradient-gold">TVK Gaming Zone</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10">Play, compete, and win exclusive rewards.</p>
        
        <div className="h-64 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-500">Game Loading...</span>
        </div>
      </main>
    </div>
  );
};

export default Game;