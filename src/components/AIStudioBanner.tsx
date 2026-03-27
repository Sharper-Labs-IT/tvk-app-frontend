import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {  Camera, BookOpen, ArrowRight, Zap} from 'lucide-react';

const FEATURES = [
  {
    icon: <Camera size={22} className="text-brand-gold" />,
    title: 'Selfie with VJ',
    desc: 'Upload your photo and step into a scene with Thalapathy VJ using VJ magic',
    cta: 'Try Now',
    href: '/ai-studio',
  },
  {
    icon: <BookOpen size={22} className="text-brand-gold" />,
    title: 'VJ Story Creator',
    desc: 'Write epic fan stories starring VJ with VJ-powered narrative generation.',
    cta: 'Create Story',
    href: '/ai-studio/stories/create',
  },
];

const AIStudioBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-brand-dark py-16 px-4"
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-brand-gold/8 blur-3xl" />

      {/* Animated grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#E6C65B 1px, transparent 1px), linear-gradient(90deg, #E6C65B 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Left Column: Text & Features */}
        <div className="flex-1 flex flex-col items-center lg:items-start w-full">
          {/* Badge */}
          <div
            className={`flex justify-center lg:justify-start mb-6 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <span className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(230,198,91,0.15)]">
              New — VJ Studio
            </span>
          </div>

          {/* Headline */}
          <div
            className={`text-center lg:text-left mb-6 transition-all duration-700 delay-100 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Experience Something{' '}
              <span className="relative inline-block mt-2 lg:mt-0">
                <span className="text-brand-gold drop-shadow-[0_0_18px_rgba(230,198,91,0.6)]">
                  Extraordinary
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-brand-gold/10 via-brand-gold to-brand-gold/10 rounded-full" />
              </span>
            </h2>
            <p className="mt-5 text-gray-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Our <span className="text-brand-gold font-semibold">VJ Studio</span> is
              now live. Dive in and experience VJ fandom like never before with AI-powered selfies and legendary stories.
            </p>
          </div>

          {/* Feature cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto lg:mx-0 mt-4 transition-all duration-700 delay-200 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative flex flex-col gap-3 bg-white/[0.03] border border-brand-gold/20 hover:border-brand-gold/50 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(230,198,91,0.1)] hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/30 shrink-0 shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className="text-white font-bold text-base">{f.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                <Link
                  to={f.href}
                  className="mt-auto inline-flex items-center gap-1.5 text-brand-gold text-sm font-semibold group-hover:gap-2.5 transition-all duration-200"
                >
                  {f.cta}
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8 transition-all duration-700 delay-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link
              to="/ai-studio"
              className="flex items-center gap-2 bg-brand-gold hover:bg-white text-black font-bold px-8 py-3.5 rounded-full text-sm sm:text-base shadow-[0_0_20px_rgba(230,198,91,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:scale-105"
            >
              Explore VJ Studio
            </Link>
            <Link
              to="/ai-studio/stories/create"
              className="flex items-center gap-2 border border-brand-gold/40 hover:border-brand-gold text-brand-gold hover:text-white font-semibold px-8 py-3.5 rounded-full text-sm sm:text-base transition-all duration-300 hover:bg-brand-gold/10"
            >
              <BookOpen size={18} />
              Create a Story
            </Link>
          </div>
        </div>

        {/* Right Column: Interactive Image Gallery */}
        <div 
          className={`flex-1 w-full flex justify-center items-center relative h-[380px] sm:h-[480px] lg:h-[550px] transition-all duration-1000 delay-400 ${
            visible ? 'opacity-100 scale-100 lg:translate-x-0' : 'opacity-0 scale-95 lg:translate-x-12'
          }`}
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-brand-gold/5 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-[4/5] perspective-1000">
            {/* Image 1 (Left - Background) */}
            <div className="absolute top-[10%] left-[-15%] sm:left-[-10%] w-[60%] sm:w-[65%] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl transform -rotate-12 translate-z-0 hover:rotate-[-5deg] hover:scale-105 transition-all duration-500 hover:z-30 hover:shadow-[0_0_30px_rgba(230,198,91,0.3)] group cursor-pointer">
              <img 
                src="img/s3.png" 
                alt="VJ Selfie Sample 1" 
                className="w-full h-full object-cover filter brightness-75 group-hover:brightness-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-black text-xs font-bold px-2 py-1 bg-brand-gold rounded-md">Cool Vibe</span>
              </div>
            </div>

            {/* Image 2 (Right - Background) */}
            <div className="absolute top-[5%] right-[-15%] sm:right-[-10%] w-[65%] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl transform rotate-12 translate-z-10 hover:rotate-[5deg] hover:scale-105 transition-all duration-500 hover:z-30 hover:shadow-[0_0_30px_rgba(230,198,91,0.3)] group cursor-pointer">
              <img 
                src="img/s2.png" 
                alt="VJ Selfie Sample 2" 
                className="w-full h-full object-cover filter brightness-75 group-hover:brightness-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-black text-xs font-bold px-2 py-1 bg-brand-gold rounded-md">Action Still</span>
              </div>
            </div>

            {/* Image 3 (Center - Foreground) */}
            <div className="absolute top-[15%] sm:top-[20%] left-[15%] w-[70%] sm:w-[75%] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-brand-gold/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform z-20 hover:scale-105 transition-all duration-500 hover:shadow-[0_0_40px_rgba(230,198,91,0.4)] group cursor-pointer filter hover:brightness-110">
              <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-brand-gold/30 flex items-center gap-2">
                <Camera size={14} className="text-brand-gold animate-pulse" />
                <span className="text-white text-xs font-medium">Selfie with VJ</span>
              </div>
              <img 
                src="img/s1.png" 
                alt="VJ Selfie Sample Main" 
                className="w-full h-full object-cover"
              />
              {/* Scanline Effect overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_4px] mix-blend-overlay pointer-events-none opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom strip */}
      <div className="relative z-10 mt-12 flex items-center justify-center gap-3 opacity-30 max-w-7xl mx-auto">
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-brand-gold" />
        <Zap size={14} className="text-brand-gold" />
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-brand-gold" />
      </div>
    </section>
  );
};

export default AIStudioBanner;
