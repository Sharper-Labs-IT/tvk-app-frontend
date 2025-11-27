import React from 'react';
import { Star, Gem, Zap, Award, Trophy } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const FanOfMonth: React.FC = () => {
  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 0.4,
      x: 0,
      transition: {
        duration: 0.8,
        delay: 0.4,
      },
    },
  };

  return (
    // UPDATED: min-h-[1200px] for mobile to ensure section is very tall
    <section className="relative w-full overflow-hidden bg-brand-dark py-12 md:py-24 min-h-[1200px] lg:min-h-[800px] flex items-center">
      {/* --- 1. Background Pattern Layer --- */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/MemOfMonthBack.png"
          alt="Background Pattern"
          className="w-full h-full object-cover opacity-100"
        />
      </div>

      {/* --- 2. Vijay Image Layer --- */}
      <motion.img
        src="/images/VijayImg2.png"
        alt="TVK Leader"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={imageVariants}
        // UPDATED: w-full for mobile, adjusted opacity
        className="absolute bottom-0 right-0 w-full md:w-[45%] lg:w-[35%] max-w-[600px] object-contain z-0 pointer-events-none origin-bottom-right opacity-80 lg:opacity-40"
      />

      {/* --- 3. Main Content Container --- */}
      {/* UPDATED: pb-[500px] pushes text/cards UP, leaving huge space at bottom for image */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-12 pb-[500px] lg:pb-0">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-end"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* ================= LEFT COLUMN ================= */}
          <div className="flex flex-col space-y-10 relative z-10 pb-8 lg:pb-0">
            {/* Title & List Group */}
            <div className="space-y-8">
              <motion.h2
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold text-white leading-[1.1]"
              >
                Top Fan of <br />
                the Month
              </motion.h2>

              <motion.ul variants={itemVariants} className="space-y-6 pl-4 md:pl-6">
                <ListItem
                  icon={<Star className="w-6 h-6 text-white" />}
                  text="Exclusive Top Fan Badge"
                />
                <ListItem
                  icon={<Gem className="w-6 h-6 text-white" />}
                  text="Special Digital Collectible"
                />
                <ListItem icon={<Zap className="w-6 h-6 text-white" />} text="Priority Shoutout" />
                <ListItem icon={<Award className="w-6 h-6 text-white" />} text="Bonus Fan Points" />
              </motion.ul>
            </div>

            {/* LEADERBOARD CARD (Bottom card) */}
            <motion.div variants={itemVariants} className="w-full flex justify-start lg:pl-12">
              <div className="w-80 md:w-96 bg-[#111] border border-brand-gold/30 rounded-xl p-6 shadow-2xl relative z-10">
                <h3 className="text-brand-gold text-xs font-bold uppercase tracking-wider mb-4">
                  Lead Board Preview
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className="flex items-center justify-between border-b border-gray-800 pb-2"
                    >
                      <span className="text-white font-bold text-xl">{num}.</span>
                      <Trophy className="w-5 h-5 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <motion.div
            variants={itemVariants}
            className="relative w-full flex justify-center lg:justify-start mt-[-40px] lg:mt-0 pointer-events-none lg:pointer-events-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative bg-[#1a1a1a] border-2 border-brand-gold rounded-2xl p-8 w-80 md:w-96 h-72 flex flex-col items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-30 lg:-ml-[320px] lg:mb-[180px] pointer-events-auto"
            >
              <Star className="absolute top-6 left-6 text-white w-7 h-7 opacity-80" />
              <Gem className="absolute top-6 right-6 text-white w-7 h-7 opacity-80" />

              <img
                src="/images/GoldCup.png"
                alt="Gold Cup"
                className="h-48 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Helper Component
const ListItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <li className="flex items-center gap-4 text-gray-200">
    <div className="flex-shrink-0">{icon}</div>
    <span className="font-medium text-lg md:text-xl tracking-wide">{text}</span>
  </li>
);

export default FanOfMonth;
