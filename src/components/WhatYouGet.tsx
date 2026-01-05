import React, { useEffect, useRef, useState } from 'react';
import {
  Globe,
  Award,
  Sticker,
  Clapperboard,
  Mic,
  Users,
  ShoppingCart,
  LayoutDashboard,
} from 'lucide-react';

interface BenefitItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const WhatYouGet: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const benefits: BenefitItem[] = [
    {
      id: 1,
      title: 'Blog Page Access',
      description: 'International news + translations.',
      icon: Globe,
    },
    {
      id: 2,
      title: 'Welcome Band',
      description: 'Personalized banner with country flag.',
      icon: Award,
    },
    { id: 3, title: 'Vijay Special Sticker Pack', description: 'Digital stickers.', icon: Sticker },
    {
      id: 4,
      title: 'Exclusive Gallery',
      description: 'Behind-the-scenes content.',
      icon: Clapperboard,
    },
    { id: 5, title: 'Events & Live Streams', description: 'Global access.', icon: Mic },
    { id: 6, title: 'Global Fan Community', description: 'Regional groups.', icon: Users },
    {
      id: 7,
      title: 'Merchandise Access',
      description: 'International shipping.',
      icon: ShoppingCart,
    },
    {
      id: 8,
      title: 'Profile Dashboard',
      description: 'Personalized member center.',
      icon: LayoutDashboard,
    },
  ];

  return (
    <section ref={sectionRef} className="relative w-full py-20 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/images/WhatYouGet.png" alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Introduction Section */}
        <div className="text-center mb-16 max-w-5xl mx-auto">
          {/* Main Heading */}
          <div
            className={`transition-all duration-700 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 text-white drop-shadow-lg leading-tight">
              Ready to Join the <span className="text-[#D4AF37]">Thalapathy VJ Kudumbam (TVK)</span> Global Movement?
            </h2>
          </div>
          
          {/* Subheading */}
          <div
            className={`transition-all duration-700 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <h3 className="text-2xl md:text-4xl font-bold mb-8 text-[#D4AF37] drop-shadow-lg">
              Why Become a Super Fan?
            </h3>
          </div>
          
          {/* Content */}
          <div className="space-y-6 text-gray-200 text-base md:text-xl leading-relaxed max-w-4xl mx-auto">
            <div
              className={`transition-all duration-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <p className="font-medium">
                This is more than a membership.
              </p>
            </div>
            
            <div
              className={`transition-all duration-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '450ms' }}
            >
              <p>
                It's your place in the Thalapathy VJ Kudumbam a global fan family connected by passion, pride, and shared moments.
              </p>
            </div>
            
            <div
              className={`transition-all duration-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <p>
                As a Super Fan, you unlock deeper access, closer connections, and experiences that bring fans together across borders.
              </p>
            </div>
            
            <div
              className={`transition-all duration-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '750ms' }}
            >
              <p className="text-lg md:text-xl font-medium text-[#D4AF37]/90 pt-4">
                The Super Fan Experience is where passion meets connection. A global space where exclusive content, live moments, personalised features, interactive communities, and Super Hero games come together making fandom feel immersive, exciting, and alive.
              </p>
            </div>
          </div>
        </div>

        {/* Super Fan Benefits Section */}
        <div
          className={`text-center mb-12 transition-all duration-700 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '900ms' }}
        >
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wider text-[#D4AF37] drop-shadow-lg">
            Inside the Super Fan Experience
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((item, index) => (
            <div
              key={item.id}
              style={{ transitionDelay: `${index * 100}ms` }}
              className={`
                group relative flex flex-col items-center justify-center text-center p-6 
                aspect-square w-full max-w-[280px] mx-auto
                rounded-2xl border border-[#c3a359ff] overflow-hidden
                bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.15)_0%,_transparent_50%),_radial-gradient(circle_at_bottom,_rgba(255,215,0,0.4)_0%,_transparent_40%),_linear-gradient(to_bottom,_#020617_0%,_#0a1229_100%)]
                shadow-[0_4px_20px_rgba(0,0,0,0.5)]
                hover:-translate-y-2 transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
              `}
            >
              {/* Icon Container */}
              <div className="relative z-10 mb-5">
                <item.icon
                  strokeWidth={1.5}
                  className="w-14 h-14 text-[#c3a359ff] drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]"
                />
              </div>

              {/* Title */}
              <h3 className="relative z-10 text-xl font-bold text-[#c3a359ff] mb-3 leading-tight tracking-wide drop-shadow-md">
                {item.title}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-gray-300 text-sm font-medium leading-relaxed max-w-[90%] opacity-90">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatYouGet;
