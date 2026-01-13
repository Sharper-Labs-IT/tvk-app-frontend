import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useEffect, useRef } from 'react';

import AnimatedTitle from './AnimatedTitle';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const clipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!clipRef.current) return;

    const ctx = gsap.context(() => {
      const clipAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: clipRef.current,
          start: 'center center',
          end: '+=800 center',
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
        },
      });

      clipAnimation.to('.mask-clip-path', {
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
      });
    }, clipRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen w-full relative">
      {/* Top Section with enhanced animations */}
      <div className="relative mb-8 pt-36 flex flex-col items-center gap-5 animate-slideUp">
        <div className="inline-block px-6 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-wider text-yellow-500 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            Welcome to VJ Games Hub
          </p>
        </div>

        <AnimatedTitle
          title="Play With Your  Favorite<br /> Celebrity"
          containerClass="mt-5 text-black text-center"
        />

        <div className="about-subtext max-w-3xl mx-auto px-4">
          <p className="text-gray-600 text-lg leading-relaxed text-center">
            VJ Games Hub unites players from countless games and platforms, both digital and
            physical into one seamless and united play economy
          </p>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          <div className="text-center group cursor-default">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 transition-transform group-hover:scale-110">
              10K+
            </div>
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Active Players</p>
          </div>
          <div className="text-center group cursor-default">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-600 transition-transform group-hover:scale-110">
              5+
            </div>
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Game Modes</p>
          </div>
          <div className="text-center group cursor-default">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 transition-transform group-hover:scale-110">
              24/7
            </div>
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Live Support</p>
          </div>
        </div>
      </div>

      {/* Scroll Pin Section with enhanced border and shadow */}
      <div className="h-screen w-full" id="clip" ref={clipRef}>
        <div
          className="mask-clip-path relative h-full w-full flex items-center justify-center shadow-2xl ring-1 ring-yellow-500/20"
          style={{
            width: '30vw',
            height: '30vh',
            borderRadius: '20px',
            overflow: 'hidden',
            margin: '0 auto',
          }}
        >
          <img
            src="img/about.webp"
            alt="Background"
            className="absolute left-0 top-0 w-full h-full object-cover"
          />
          {/* Overlay gradient for better depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        </div>
      </div>
    </div>
  );
};

export default About;
