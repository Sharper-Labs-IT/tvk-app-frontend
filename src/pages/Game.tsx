import React from 'react';
import Header from '../components/Header';
import Hero from '../components/game/Hero';

const Game: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default Game;