import React from 'react';
import Hero from '../components/game/Hero';
import About from '../components/game/About';
import Story from '../components/game/Story';
import Contact from '../components/game/Contact';
import Footer from '../components/Footer';
import Features from '../components/game/Features';
import NavBar from '../components/game/Navbar';

const Game: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-black text-white relative overflow-hidden">
      <main className="bg-[#dfdff0]">
        <NavBar />
        <Hero />
        <About />
        <Features />
        <Story />
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

export default Game;
