import React from 'react';
import {
  Globe,
  Award,
  Sticker,
  Film,
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
    {
      id: 3,
      title: 'Vijay Special Sticker Pack',
      description: 'Digital stickers.',
      icon: Sticker,
    },
    {
      id: 4,
      title: 'Exclusive Gallery',
      description: 'Behind-the-scenes content.',
      icon: Film,
    },
    {
      id: 5,
      title: 'Events & Live Streams',
      description: 'Global access.',
      icon: Mic,
    },
    {
      id: 6,
      title: 'Global Fan Community',
      description: 'Regional groups.',
      icon: Users,
    },
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
    <section className="relative w-full py-20 overflow-hidden bg-brand-dark">
      {/* Background Image Layer - Overlay Removed */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/WhatYouGet.png"
          alt="Background"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-100 to-brand-goldDark drop-shadow-md">
            What You Get
          </h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col items-center text-center p-6 rounded-xl border border-brand-gold/30 bg-gradient-to-b from-brand-dark/80 to-black/90 backdrop-blur-sm shadow-[0_0_15px_rgba(230,198,91,0.05)] hover:shadow-[0_0_25px_rgba(230,198,91,0.2)] transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Icon Container */}
              <div className="mb-4 p-3 rounded-full bg-gradient-to-br from-gray-900 to-black border border-brand-gold/20 group-hover:border-brand-gold/60 transition-colors">
                <item.icon className="w-10 h-10 text-brand-gold drop-shadow-[0_0_8px_rgba(230,198,91,0.4)]" />
              </div>

              {/* Card Title */}
              <h3 className="text-xl font-bold text-white mb-2 tracking-wide group-hover:text-brand-gold transition-colors">
                {item.title}
              </h3>

              {/* Card Description */}
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
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
