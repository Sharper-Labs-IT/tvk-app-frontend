import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {  Camera, BookOpen, ArrowRight, Zap} from 'lucide-react';

const FEATURES = [
  {
    icon: <Camera size={22} className="text-brand-gold" />,
    title: 'Selfie with VJ',
    desc: 'Upload your photo and step into a scene with Thalapathy VJ using AI magic',
    cta: 'Try Now',
    href: '/ai-studio',
  },
  {
    icon: <BookOpen size={22} className="text-brand-gold" />,
    title: 'AI Story Creator',
    desc: 'Write epic fan stories starring VJ with AI-powered narrative generation.',
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

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Badge */}
        <div
          className={`flex justify-center mb-6 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Coming Soon — AI Studio
          </span>
        </div>

        {/* Headline */}
        <div
          className={`text-center mb-4 transition-all duration-700 delay-100 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
            We're Building Something{' '}
            <span className="relative inline-block">
              <span className="text-brand-gold drop-shadow-[0_0_18px_rgba(230,198,91,0.6)]">
                Extraordinary
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-brand-gold to-transparent rounded-full" />
            </span>
          </h2>
          <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Our{' '}
            <span className="text-brand-gold font-semibold">AI Studio</span> is
            under active development — get ready to experience VJ fandom like
            never before. Be the first to dive in.
          </p>
        </div>

        {/* Feature cards */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative flex flex-col gap-3 bg-white/[0.03] border border-brand-gold/20 hover:border-brand-gold/50 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(230,198,91,0.08)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 shrink-0">
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
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 transition-all duration-700 delay-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            to="/ai-studio"
            className="flex items-center gap-2 bg-brand-gold hover:bg-brand-goldDark text-black font-bold px-7 py-3 rounded-full text-sm sm:text-base shadow-[0_0_20px_rgba(230,198,91,0.3)] hover:shadow-[0_0_30px_rgba(230,198,91,0.5)] transition-all duration-300"
          >
            Explore AI Studio
          </Link>
          <Link
            to="/ai-studio/stories/create"
            className="flex items-center gap-2 border border-brand-gold/40 hover:border-brand-gold text-brand-gold hover:bg-brand-gold/5 font-semibold px-7 py-3 rounded-full text-sm sm:text-base transition-all duration-300"
          >
            <BookOpen size={17} />
            Create a Story
          </Link>
        </div>

        {/* Decorative bottom strip */}
        <div className="mt-12 flex items-center justify-center gap-3 opacity-30">
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-brand-gold" />
          <Zap size={14} className="text-brand-gold" />
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-brand-gold" />
        </div>
      </div>
    </section>
  );
};

export default AIStudioBanner;
