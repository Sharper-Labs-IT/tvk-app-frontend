import React, { useEffect, useState } from 'react';
import { Star, Gem, Zap, Trophy, ArrowRight, MessageCircle, Calendar, Gamepad2 } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { isLastWeekOfMonth, getPreviousMonthName, getCurrentMonthName } from '../utils/dateUtils';
import { getCountryFromMobile } from '../utils/countryHelper';
import { pointsService, type TopFan } from '../services/pointsService';
import { getPreviousWinner, savePreviousWinner, type StoredWinner } from '../utils/winnerStorage';
import { getStoryImageUrl } from '../utils/storyUtils';

const FanOfMonth: React.FC = () => {
  const isRevealTime = isLastWeekOfMonth();
  const previousMonthName = getPreviousMonthName();
  const currentMonthName = getCurrentMonthName();

  const [topFan, setTopFan] = useState<TopFan | null>(null);
  const [previousWinnerData, setPreviousWinnerData] = useState<StoredWinner | null>(null);
  const [apiMonth, setApiMonth] = useState<string>("");

  useEffect(() => {
    const fetchTopFan = async () => {
      try {
        const response = await pointsService.getFanOfTheMonth();
        setApiMonth(response.month);
        
        if (response.top_fans && response.top_fans.length > 0) {
          const topFanData = response.top_fans[0];
          setTopFan(topFanData);
          
          // If the API returns data for the previous month (archived winner),
          // save it as the previous winner
          if (response.month !== currentMonthName && response.month === previousMonthName) {
            // This is the archived winner from last month - store it
            const rawAvatar = topFanData.avatar_url || topFanData.user?.avatar || null;
            const fullAvatarUrl = rawAvatar ? getStoryImageUrl(rawAvatar) : null;
            
            savePreviousWinner({
              name: topFanData.nickname || topFanData.name,
              month: response.month,
              year: response.year,
              points: topFanData.month_points,
              country: topFanData.country || topFanData.user?.country || 
                      topFanData.location || topFanData.user?.location ||
                      getCountryFromMobile(topFanData.mobile || topFanData.user?.mobile) || "Global",
              avatar_url: fullAvatarUrl || undefined
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch top fan:', error);
      }
    };

    // Load stored previous winner
    const storedWinner = getPreviousWinner();
    if (storedWinner) {
      setPreviousWinnerData(storedWinner);
    }

    fetchTopFan();
  }, [currentMonthName, previousMonthName]);

  // Determine if API data is for current month (live leaderboard) or archived winner
  const isCurrentMonthData = apiMonth === currentMonthName || apiMonth === "";
  
  // Previous winner comes from stored data, NOT from current API call
  const previousWinner = {
    name: previousWinnerData?.name || "TBA",
    image: previousWinnerData?.avatar_url || "/images/tvk-logo.png",
    label: previousWinnerData?.month ? `${previousWinnerData.month} Winner` : `${previousMonthName} Winner`
  };

  // Current top fan is the live leader for THIS month
  const currentTopName = isCurrentMonthData 
    ? (topFan?.nickname || topFan?.name || "Loading...")
    : "Competition Open";
  const currentTopCountry = isCurrentMonthData 
    ? (topFan?.country || topFan?.user?.country || topFan?.location || topFan?.user?.location || getCountryFromMobile(topFan?.mobile || topFan?.user?.mobile) || "Global")
    : "Join Now";

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
      {/* <div className="absolute inset-0 z-0">
        <img
          src="/images/MemOfMonthBack.png"
          alt="Background"
          className="w-full h-full object-cover opacity-100"
        />
      </div> */}

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
              <p className="text-base lg:text-lg text-white font-semibold mb-3">
                Step into the spotlight and prove your passion.
              </p>
              <p className="text-xs lg:text-sm text-gray-300 font-medium max-w-lg leading-relaxed text-justify">
                Compete with fans from around the world, earn points through games, events, and community engagement, and climb the leaderboard to be crowned Top Fan of the Month. Each month, the most active and dedicated fan will be recognised with exclusive digital rewards, a special Top Fan badge, and a featured shoutout visible across the platform. It's not just about winning it's about showing up, staying engaged, and representing your fandom with pride.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wider">What You Can Win</h3>
              <ul className="space-y-4 pl-2">
                <ListItem
                  icon={<Star className="w-5 h-5 text-brand-gold" />}
                  title="Exclusive Top Fan Badge"
                  description="A rare digital badge to showcase your achievement"
                />
                <ListItem
                  icon={<Gem className="w-5 h-5 text-brand-gold" />}
                  title="Special Digital Collectible"
                  description="A limited-edition reward available only to monthly winners"
                />
                <ListItem
                  icon={<Zap className="w-5 h-5 text-brand-gold" />}
                  title="Priority Shoutout"
                  description="Public recognition on the platform and community highlights"
                />
              </ul>
            </motion.div>

            {/* How to Win Section - Modern UX */}
            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-gray-300 font-semibold mb-3 text-sm uppercase tracking-wider">
                Your Path to the Top
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col items-center text-center transition-all group cursor-default">
                  <div className="bg-brand-gold/10 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-5 h-5 text-brand-gold" />
                  </div>
                  <span className="text-[10px] text-brand-gold/80 uppercase tracking-bold font-bold">Engage</span>
                  <span className="text-[11px] text-gray-400 leading-tight mt-1">Join discussions and interact with the community</span>
                </div>
                
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col items-center text-center transition-all group cursor-default">
                  <div className="bg-brand-gold/10 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-5 h-5 text-brand-gold" />
                  </div>
                  <span className="text-[10px] text-brand-gold/80 uppercase tracking-bold font-bold">Attend</span>
                  <span className="text-[11px] text-gray-400 leading-tight mt-1">Take part in events and live streams</span>
                </div>

                <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col items-center text-center transition-all group cursor-default">
                  <div className="bg-brand-gold/10 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Gamepad2 className="w-5 h-5 text-brand-gold" />
                  </div>
                  <span className="text-[10px] text-brand-gold/80 uppercase tracking-bold font-bold">Play</span>
                  <span className="text-[11px] text-gray-400 leading-tight mt-1">Compete in games and climb the leaderboards</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 italic">
                Every action counts. The more you participate, the closer you get to the top.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link 
                to="/fan-of-the-month"
                className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark font-bold py-3 px-8 rounded-xl hover:bg-white transition-colors shadow-lg shadow-brand-gold/20"
              >
                {isRevealTime ? "Reveal Winner" : "Countdown"}
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
                    {isRevealTime ? "Previous Winner" : "🏆 Current Leader"}
                  </div>
                  <div className="text-white font-bold">
                    {isRevealTime ? previousWinner.name : currentTopName}
                  </div>
                  <div className="text-[10px] text-brand-gold/80">
                    {isRevealTime ? "Global" : currentTopCountry}
                  </div>
                </div>
              </motion.div>

              {/* Previous Winner Card - Only show if we have actual winner data */}
              {!isRevealTime && previousWinnerData && previousWinnerData.name !== "TBA" && (
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

const ListItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) => (
  <li className="flex items-start gap-3 text-gray-200">
    <div className="flex-shrink-0 bg-white/5 p-2 rounded-lg">{icon}</div>
    <div className="flex flex-col">
      <span className="font-semibold text-base tracking-wide text-white">{title}</span>
      {description && <span className="text-xs text-gray-400 mt-1">{description}</span>}
    </div>
  </li>
);

export default FanOfMonth;
