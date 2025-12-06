import React, { Suspense } from 'react';
import Hero from '../components/game/Hero';
import NavBar from '../components/game/NavBar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';

// Lazy load below-the-fold components
const About = React.lazy(() => import('../components/game/About'));
const Story = React.lazy(() => import('../components/game/Story'));
const Contact = React.lazy(() => import('../components/game/Contact'));
const Features = React.lazy(() => import('../components/game/Features'));

const Game: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-black text-white relative overflow-hidden">
      <main className="bg-[#dfdff0]">
        <NavBar />
        <Hero />
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader /></div>}>
          <About />
          <Features />
          <Story />
          <Contact />
        </Suspense>
        <Footer />
      </main>
    </div>
  );
};

export default Game;
