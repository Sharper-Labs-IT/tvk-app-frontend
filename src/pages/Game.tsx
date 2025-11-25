import React from 'react';
import Header from '../components/Header';
import Hero from '../components/game/Hero';
import About from '../components/game/About';

const Game: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-black text-white relative overflow-hidden">
      <Header />
      <main className='bg-[#dfdff0]'>
        <Hero />
        <About />
      </main>
    </div>
  );
};

export default Game;