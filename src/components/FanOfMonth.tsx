import React, { useEffect, useState } from 'react';
import { Star, Gem, Zap, Award, Trophy, ArrowRight, MessageCircle, Calendar, Gamepad2 } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { isLastWeekOfMonth, getToday } from '../utils/dateUtils';
import { getCountryFromMobile } from '../utils/countryHelper';
import { pointsService, type TopFan } from '../services/pointsService';

const FanOfMonth: React.FC = () => {
  const isRevealTime = isLastWeekOfMonth();
  const today = getToday();
  // Check if we are in the new year (Jan 2026) to update the previous winner
  const isNewMonth = today.getMonth() === 0 && today.getFullYear() === 2026;

  const [topFan, setTopFan] = useState<TopFan | null>(null);

  useEffect(() => {
    const fetchTopFan = async () => {
      try {
        const response = await pointsService.getFanOfTheMonth();
        if (response.top_fans && response.top_fans.length > 0) {
          setTopFan(response.top_fans[0]);
        }
      } catch (error) {
        console.error('Failed to fetch top fan:', error);
      }
    };

    fetchTopFan();
  }, []);

  const previousWinner = {
    name: isNewMonth ? (topFan?.name || "Winner") : "Winner",
    image: "/images/tvk-logo.png", // Force TVK logo
    label: isNewMonth ? "December Winner" : "Previous Winner"
  };

  const currentTopName = topFan?.nickname || topFan?.name || "Loading...";
  const currentTopCountry = topFan?.country || topFan?.user?.country || topFan?.location || topFan?.user?.location || getCountryFromMobile(topFan?.mobile || topFan?.user?.mobile) || "Global";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section className="relative w-full bg-brand-dark py-12 md:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/MemOfMonthBack.png"
          alt="Background"
          className="w-full h-full object-cover opacity-100"
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Left Column - Text */}
          <div className="flex flex-col space-y-8">
            <motion.div variants={itemVariants}>
              {isRevealTime ? (
                <span className="inline-block py-1 px-3 rounded-full bg-brand-gold text-brand-dark font-bold text-sm mb-4 animate-pulse">
                  🏆 WINNER REVEALED
                </span>
              ) : (
                <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-brand-gold font-bold text-sm mb-4 border border-brand-gold/30">
                  LIVE Competitors
                </span>
              )}
              
              <h2 className="font-extrabold tracking-tight uppercase text-[clamp(1.5rem,2vw,2.5rem)] lg:text-[clamp(2.5rem,3.5vw,4rem)] leading-none mb-4">
                <span className="bg-[linear-gradient(to_bottom,theme('colors.brand.goldDark'),#e8d479ff,#a06800ff,#e8d479ff)] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  Top Fan of the Month
                </span>
              </h2>
              <p className="text-xs lg:text-sm text-gray-300 font-medium max-w-md">
                {isRevealTime 
                  ? "The results are in! See who claimed the throne this month and won exclusive rewards."
                  : "Compete with other fans, earn points, and win exclusive digital collectibles and shoutouts."}
              </p>
            </motion.div>

            <motion.ul variants={itemVariants} className="space-y-4 pl-2">
              <ListItem
                icon={<Star className="w-5 h-5 text-brand-gold" />}
                text="Exclusive Top Fan Badge"
              />
              <ListItem
                icon={<Gem className="w-5 h-5 text-brand-gold" />}
                text="Special Digital Collectible"
              />
              <ListItem
                icon={<Zap className="w-5 h-5 text-brand-gold" />}
                text="Priority Shoutout"
              />
            </motion.ul>

            {/* How to Win Section - Modern UX */}
            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-gray-400 font-medium mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-gold" /> Path to Victory
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col items-center text-center transition-all group cursor-default">
                  <div className="bg-brand-gold/10 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-5 h-5 text-brand-gold" />
                  </div>
                  <span className="text-[10px] text-brand-gold/80 uppercase tracking-bold font-bold">Engage</span>
                  <span className="text-[11px] text-gray-400 leading-tight mt-1">Join Discussions</span>
                </div>
                
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col items-center text-center transition-all group cursor-default">
                  <div className="bg-brand-gold/10 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-5 h-5 text-brand-gold" />
                  </div>
                  <span className="text-[10px] text-brand-gold/80 uppercase tracking-bold font-bold">Attend</span>
                  <span className="text-[11px] text-gray-400 leading-tight mt-1">Events & Streams</span>
                </div>

                <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col items-center text-center transition-all group cursor-default">
                  <div className="bg-brand-gold/10 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Gamepad2 className="w-5 h-5 text-brand-gold" />
                  </div>
                  <span className="text-[10px] text-brand-gold/80 uppercase tracking-bold font-bold">Play</span>
                  <span className="text-[11px] text-gray-400 leading-tight mt-1">Top Leaderboards</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link 
                to="/fan-of-the-month"
                className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark font-bold py-3 px-8 rounded-xl hover:bg-white transition-colors shadow-lg shadow-brand-gold/20"
              >
                {isRevealTime ? "Reveal Winner" : "View Top Fans"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column - Visuals */}
          <div className="flex justify-center items-center relative">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-brand-gold/20 blur-[100px] rounded-full pointer-events-none" />
            
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="relative z-10"
            >
              <img
                src="/images/GoldCup.png"
                alt="Gold Cup"
                className="h-64 md:h-80 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
              
              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 md:right-10 bg-[#1a1a1a] border border-brand-gold/30 p-4 rounded-xl shadow-xl flex items-center gap-3"
              >
                <div className="bg-brand-gold/20 p-2 rounded-lg">
                  <Trophy className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase">
                    {isRevealTime ? "Previous Winner" : "🏆 Fan of the Month"}
                  </div>
                  <div className="text-white font-bold">
                    {isRevealTime ? previousWinner.name : currentTopName}
                  </div>
                  <div className="text-[10px] text-brand-gold/80">
                    {isRevealTime ? "Global" : currentTopCountry}
                  </div>
                </div>
              </motion.div>

              {/* Previous Winner Card - Hidden during Reveal to avoid duplication */}
              {!isRevealTime && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-0 -left-4 md:-left-12 bg-[#1a1a1a]/90 backdrop-blur-sm border border-white/10 p-3 rounded-lg shadow-lg flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-brand-gold/30">
                      <img 
                        src={previousWinner.image} 
                        alt="Prev" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {previousWinner.label}
                      </div>
                      <div className="text-sm text-white font-bold">
                        {previousWinner.name}
                      </div>
                    </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ListItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <li className="flex items-center gap-3 text-gray-200">
    <div className="flex-shrink-0 bg-white/5 p-2 rounded-lg">{icon}</div>
    <span className="font-medium text-lg tracking-wide">{text}</span>
  </li>
);

export default FanOfMonth;
