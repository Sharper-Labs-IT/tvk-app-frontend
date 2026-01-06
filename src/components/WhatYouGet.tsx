import React from 'react';
import {
  Globe,
  Award,
  Sticker,
  Clapperboard,
  Mic,
  Users,
  ShoppingCart,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

interface BenefitItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const WhatYouGet: React.FC = () => {
  const benefits: BenefitItem[] = [
    { id: 1, title: 'Blog Page Access', description: 'International news + translations.', icon: Globe },
    { id: 2, title: 'Welcome Band', description: 'Personalized banner with country flag.', icon: Award },
    { id: 3, title: 'Vijay Special Sticker Pack', description: 'Digital stickers.', icon: Sticker },
    { id: 4, title: 'Exclusive Gallery', description: 'Behind-the-scenes content.', icon: Clapperboard },
    { id: 5, title: 'Events & Live Streams', description: 'Global access.', icon: Mic },
    { id: 6, title: 'Global Fan Community', description: 'Regional groups.', icon: Users },
    { id: 7, title: 'Merchandise Access', description: 'International shipping.', icon: ShoppingCart },
    { id: 8, title: 'Profile Dashboard', description: 'Personalized member center.', icon: LayoutDashboard },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="relative w-full py-24 md:py-32 bg-brand-dark overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
        
        <img 
          src="/images/WhatYouGet.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-10" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-transparent to-brand-dark" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-brand-dark" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-bold text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
            <Award className="w-4 h-4" />
            The Ultimate Membership
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-snug mb-8">
            Ready to Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-[#fff5c2] to-brand-gold drop-shadow-sm inline-block py-1">
              TVK Global Movement?
            </span>
          </motion.h2>

          <motion.div variants={itemVariants} className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto font-light">
             <p>
                More than just a membership. It’s your place in the <strong className="text-brand-gold font-medium">Thalapathy VJ Kudumbam</strong> - a family connected by passion, pride, and shared moments
             </p>
             <p className="border-l-2 border-brand-gold/30 pl-6 text-left md:text-center md:border-l-0 md:pl-0 italic text-gray-400">
               "Unlock deeper access, closer connections, and experiences that bring fans together across borders"
             </p>
          </motion.div>
        </motion.div>

        {/* Bento Grid Features */}
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-10"
          >
             <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
             <h3 className="text-2xl font-bold uppercase tracking-wider text-brand-gold">Inside the Experience</h3>
             <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {benefits.map((item) => (
              <motion.div
                variants={itemVariants}
                key={item.id}
                className="group relative p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-brand-gold/30 transition-all duration-300 backdrop-blur-sm overflow-hidden"
              >
                 {/* Card Hover Glow */}
                <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start h-full">
                  <div className="mb-6 p-3 rounded-xl bg-brand-gold/10 text-brand-gold group-hover:scale-110 transition-transform duration-300">
                    <item.icon strokeWidth={1.5} className="w-8 h-8" />
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-brand-gold transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow">
                    {item.description}
                  </p>

                  <div className="mt-auto flex items-center text-brand-gold text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                     <CheckCircle2 className="w-3 h-3 mr-1.5" /> Included
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA Text */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="mt-20 text-center max-w-4xl mx-auto"
        >
          <p className="text-lg md:text-2xl font-serif italic text-brand-gold/80">
            "The Super Fan Experience is where passion meets connection"
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default WhatYouGet;
