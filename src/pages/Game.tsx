import React, { Suspense } from 'react';
import Hero from '../components/game/Hero';
import NavBar from '../components/game/NavBar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import ScrollProgress from '../components/game/ScrollProgress';

// Lazy load below-the-fold components with prefetch hints
const About = React.lazy(() => import(/* webpackPrefetch: true */ '../components/game/About'));
const Story = React.lazy(() => import(/* webpackPrefetch: true */ '../components/game/Story'));
const Contact = React.lazy(() => import(/* webpackPrefetch: true */ '../components/game/Contact'));
const Features = React.lazy(() => import(/* webpackPrefetch: true */ '../components/game/Features'));
const TrophyGuide = React.lazy(() => import(/* webpackPrefetch: true */ '../components/game/TrophyGuide'));

const Game: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Noise Texture Overlay for depth */}
      <div className="fixed inset-0 z-0 opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/otis-redding.png')]"></div>

      <main className="relative z-10 bg-[#dfdff0]">
        <NavBar />
        
        {/* Hero with enhanced entrance */}
        <div className="animate-fadeIn">
          <Hero />
        </div>

        {/* Smooth Loading with Modern Loader */}
        <Suspense 
          fallback={
            <div className="h-screen flex items-center justify-center bg-gradient-to-b from-transparent via-black/50 to-transparent">
              <div className="flex flex-col items-center gap-6">
                <Loader />
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
                <p className="text-white/60 text-sm uppercase tracking-widest animate-pulse">Loading Experience</p>
              </div>
            </div>
          }
        >
          {/* Section Dividers with Glow Effect */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
            <About />
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <Features />
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <TrophyGuide />
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
            <Story />
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
            <Contact />
          </div>
        </Suspense>

        <Footer />
      </main>

      {/* Scroll Progress Indicator */}
      <ScrollProgress />
    </div>
  );
};

export default Game;
