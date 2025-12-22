import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HIGHLIGHTS_DATA = {
  events: [
    {
      id: 1,
      name: 'Rajesh Kumar',
      location: 'LONDON, UK',
      description: 'Organized charity drive collecting $5000 for education',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      location: 'TORONTO, CANADA',
      description: 'Created viral fan poster with 1M+ views',
    },
  ],
  content: [
    {
      id: 3,
      name: 'Dilshan Perera',
      location: 'COLOMBO, SRI LANKA',
      description: 'Developed the official fan club mobile app prototype',
    },
    {
      id: 4,
      name: 'Sarah Jenkins',
      location: 'NEW YORK, USA',
      description: 'Hosted a watch party with 500+ attendees',
    },
  ],
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const CommunityHighlights: React.FC = () => {
  // Keeping state for rendering content, defaulting to 'content'
  const [activeTab] = useState<'events' | 'content'>('content');
  const navigate = useNavigate();

  // Helper to navigate and scroll to top
  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-20 px-4 bg-white overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="text-black">Community</span>{' '}
            <span className="text-[#B68D40]">Highlights</span>
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            {/* UPDATED: Button now navigates to /events */}
            <button
              onClick={() => handleNavigation('/events')}
              className="px-8 py-3 rounded-md font-bold transition-colors duration-300 bg-gray-200 text-brand-dark hover:bg-gray-300"
            >
              Global TVK Events
            </button>

            {/* UPDATED: Button now navigates to /dashboard/feed */}
            <button
              onClick={() => handleNavigation('/dashboard/feed')}
              className="px-8 py-3 rounded-md font-bold transition-colors duration-300 bg-brand-gold text-brand-dark hover:bg-brand-goldDark"
            >
              Fan Created Content
            </button>
          </div>
        </motion.div>

        {/* Note: The content below displays the default 'content' tab data. 
            Since buttons navigate away, this serves as a static preview. */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="bg-[#FEF9D9] rounded-3xl p-6 md:p-12 w-full shadow-sm"
        >
          <div className="flex flex-col gap-6">
            {HIGHLIGHTS_DATA[activeTab].map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl md:text-2xl font-bold text-black">{item.name}</h3>
                  <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {item.location}
                  </span>
                  <p className="text-gray-800 text-base md:text-lg">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityHighlights;
