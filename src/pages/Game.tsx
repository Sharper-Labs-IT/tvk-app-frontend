import React from 'react';
import Header from '../components/Header';
import Hero from '../components/game/Hero';
import About from '../components/game/About';
import Story from '../components/game/Story';

const Game: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-black text-white relative overflow-hidden">
      <Header />
      <main className='bg-[#dfdff0]'>
        <Hero />
        <About />
        <Story />
      </main>
    </div>
  );
};

export default Game;