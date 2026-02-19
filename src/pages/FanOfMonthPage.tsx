import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Trophy, Clock, Gift, Crown, Award, Star, Medal } from 'lucide-react';
import Header from '../components/Header';
import { isLastWeekOfMonth, getTargetRevealDate, getToday, getPreviousMonthName } from '../utils/dateUtils';
import { getCountryFromMobile } from '../utils/countryHelper';
import { pointsService, type TopFan } from '../services/pointsService';
import { getPreviousWinner, savePreviousWinner, getAllWinners, type StoredWinner } from '../utils/winnerStorage';

import { getStoryImageUrl } from '../utils/storyUtils';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = getTargetRevealDate();
    
    const interval = setInterval(() => {
      const now = getToday(); 
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 justify-center mb-8">
      <TimeBox value={timeLeft.days} label="Days" />
      <TimeBox value={timeLeft.hours} label="Hours" />
      <TimeBox value={timeLeft.minutes} label="Mins" />
      <TimeBox value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-gold/10 border border-brand-gold/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
      <span className="text-2xl md:text-3xl font-bold text-brand-gold font-mono">
        {value.toString().padStart(2, '0')}
      </span>
    </div>
    <span className="text-xs text-gray-400 mt-2 uppercase tracking-wider">{label}</span>
  </div>
);

const FanOfMonthPage: React.FC = () => {
  const [isRevealTime] = useState(() => isLastWeekOfMonth());
  const [isUnboxed, setIsUnboxed] = useState(false);
  const { width, height } = useWindowSize();
  const [currentTopFan, setCurrentTopFan] = useState<TopFan | null>(null);
  const [previousWinnerData, setPreviousWinnerData] = useState<StoredWinner | null>(() => getPreviousWinner());
  const [allWinners, setAllWinners] = useState<StoredWinner[]>(() => getAllWinners());
  const [apiMonth, setApiMonth] = useState<string>("");
  
  const previousMonthName = getPreviousMonthName();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await pointsService.getFanOfTheMonth();
        setApiMonth(response.month);
        
        if (response.top_fans && response.top_fans.length > 0) {
          const topFanData = response.top_fans[0];
          setCurrentTopFan(topFanData);
          
          // If this is archived data from the previous month, save it as the winner
          if (response.month === previousMonthName) {
            const rawAvatar = topFanData.avatar_url || topFanData.user?.avatar || null;
            const fullAvatarUrl = rawAvatar ? getStoryImageUrl(rawAvatar) : null;

            const winnerToStore = {
              name: topFanData.nickname || topFanData.name,
              month: response.month,
              year: response.year,
              points: topFanData.month_points,
              country: topFanData.country || topFanData.user?.country || 
                      topFanData.location || topFanData.user?.location ||
                      getCountryFromMobile(topFanData.mobile || topFanData.user?.mobile) || "Global",
              avatar_url: fullAvatarUrl || undefined
            };
            savePreviousWinner(winnerToStore);
            setPreviousWinnerData({ ...winnerToStore, storedAt: new Date().toISOString() });
            setAllWinners(getAllWinners()); // Update all winners after saving
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [previousMonthName]);

  const handleUnbox = () => {
    setIsUnboxed(true);
  };

  // Determine what data to show based on context
  const isShowingPreviousMonthData = apiMonth === previousMonthName;
  
  // For reveal mode: show the archived winner from previous month
  // For countdown mode: show the stored previous winner as "Reigning Champion"
  const displayWinnerName = isRevealTime 
    ? (isShowingPreviousMonthData ? (currentTopFan?.nickname || currentTopFan?.name || "Loading...") : (previousWinnerData?.name || "TBA"))
    : (previousWinnerData?.name || "TBA");
  
  const displayWinnerPoints = isRevealTime && isShowingPreviousMonthData
    ? (currentTopFan?.month_points || 0)
    : (previousWinnerData?.points || 0);
  
  const displayWinnerAvatar = "/images/tvk-logo.png";
  
  const displayWinnerLocation = isRevealTime && isShowingPreviousMonthData
    ? (currentTopFan?.country || currentTopFan?.user?.country || currentTopFan?.location || currentTopFan?.user?.location || getCountryFromMobile(currentTopFan?.mobile || currentTopFan?.user?.mobile) || "Global")
    : (previousWinnerData?.country || "Global");
  
  const displayMonthName = isRevealTime && isShowingPreviousMonthData
    ? apiMonth
    : (previousWinnerData?.month || previousMonthName);
  
  const winnerBadge = "Super Fan"; // Static for now

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      <Header />
      
      <main className="flex-grow relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/MemOfMonthBack.png')] bg-cover bg-center" />
        </div>

        {isRevealTime ? (
          // REVEAL MODE
          <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
            {isUnboxed && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
            
            <AnimatePresence mode="wait">
              {!isUnboxed ? (
                <motion.div 
                  key="locked"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-center"
                >
                  <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mb-8 relative inline-block cursor-pointer group"
                    onClick={handleUnbox}
                  >
                    <div className="w-64 h-64 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.4)] group-hover:shadow-[0_0_80px_rgba(255,215,0,0.6)] transition-all duration-500">
                      <Gift className="w-32 h-32 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-brand-dark px-6 py-2 rounded-full font-bold shadow-lg">
                      Tap to Reveal
                    </div>
                  </motion.div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-white mb-4">
                    The Results Are In!
                  </h1>
                  <p className="text-xl text-gray-300">
                    The Fan of the Month for {displayMonthName || "this month"} is ready to be crowned.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="winner"
                  initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-full max-w-4xl"
                >
                  <div className="bg-gradient-to-b from-[#2a2a2a] to-[#111] border-2 border-brand-gold rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    {/* Shine Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                      {/* Winner Image */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-brand-gold blur-3xl opacity-30 rounded-full" />
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-brand-gold overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                        >
                          <img src={displayWinnerAvatar} alt={displayWinnerName} className="w-full h-full object-cover" />
                        </motion.div>
                        <motion.div 
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-brand-gold text-brand-dark font-bold px-6 py-1 rounded-full whitespace-nowrap flex items-center gap-2"
                        >
                          <Trophy className="w-4 h-4" /> WINNER
                        </motion.div>
                      </div>

                      {/* Winner Details */}
                      <div className="text-center md:text-left flex-1">
                        <motion.div
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <h2 className="text-brand-gold font-bold tracking-wider uppercase mb-2">Fan of the Month</h2>
                          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{displayWinnerName}</h1>
                          <p className="text-xl text-gray-400 mb-6 flex items-center justify-center md:justify-start gap-2">
                            <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">{displayWinnerLocation}</span>
                            <span className="bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-lg text-sm border border-brand-gold/30">{winnerBadge}</span>
                          </p>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="grid grid-cols-2 gap-4 mb-8"
                        >
                          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="text-gray-400 text-sm">Total Points</div>
                            <div className="text-2xl font-bold text-white">{displayWinnerPoints.toLocaleString()}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="text-gray-400 text-sm">Month</div>
                            <div className="text-xl font-bold text-white">{displayMonthName || "Current"}</div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // COUNTDOWN MODE (Leaderboard Hidden)
          <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 bg-brand-gold/10 text-brand-gold px-4 py-2 rounded-full mb-8 border border-brand-gold/20"
              >
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Next Reveal Countdown</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                Who Will Be The Next <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Legend?</span>
              </h1>

              <div className="mb-12">
                <CountdownTimer />
              </div>

              <p className="text-xl text-gray-400 mb-12">
                The race is on! Earn points by engaging with the community, attending events, and playing games. The top fan gets exclusive rewards.
              </p>
            </div>

            {/* Hall of Fame - Previous Winners - Always visible */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 w-full max-w-7xl mx-auto px-4"
            >
              {/* Section Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="inline-flex items-center gap-2 mb-4"
                >
                  <Crown className="w-8 h-8 text-brand-gold" />
                  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold">
                    Hall of Fame
                  </h2>
                  <Crown className="w-8 h-8 text-brand-gold" />
                </motion.div>
                <p className="text-gray-400 text-lg">Celebrating our legendary champions</p>
              </div>

              {/* Winner Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Display all historical winners */}
                {allWinners.map((winner, index) => (
                    <motion.div
                      key={`${winner.month}-${winner.year}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + (index * 0.1) }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      className="relative group"
                    >
                      {/* Card Background with Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 via-yellow-600/10 to-brand-gold/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60 group-hover:opacity-100" />
                      
                      {/* Card Content */}
                      <div className="relative bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-brand-gold/40 group-hover:border-brand-gold rounded-2xl overflow-hidden transition-all duration-500">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold rounded-full blur-3xl" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl" />
                        </div>
                        
                        {/* Champion Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-gradient-to-br from-brand-gold to-yellow-600 text-brand-dark text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Medal className="w-3 h-3" />
                            CHAMPION
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="relative p-6">
                          {/* Avatar Section */}
                          <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-4">
                              {/* Rotating Ring - Only for most recent winner */}
                              {index === 0 && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                  className="absolute inset-0 rounded-full"
                                  style={{
                                    background: 'conic-gradient(from 0deg, transparent, #FFD700, transparent)',
                                    padding: '3px',
                                    width: '120px',
                                    height: '120px',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                />
                              )}
                              
                              {/* Avatar */}
                              <div className="relative w-28 h-28 rounded-full border-4 border-brand-dark overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.4)] group-hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transition-all">
                                <img 
                                  src={winner.avatar_url || displayWinnerAvatar} 
                                  alt={winner.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Crown Icon - Only for most recent winner */}
                              {index === 0 && (
                                <motion.div
                                  initial={{ y: -5 }}
                                  animate={{ y: [-5, -10, -5] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                                >
                                  <Crown className="w-8 h-8 text-brand-gold drop-shadow-lg" />
                                </motion.div>
                              )}
                            </div>

                            {/* Name & Location */}
                            <h3 className="text-2xl font-bold text-white mb-2 text-center group-hover:text-brand-gold transition-colors">
                              {winner.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                              <span className="flex items-center gap-1">
                                🌍 {winner.country}
                              </span>
                            </div>
                            <div className="text-brand-gold text-xs font-semibold uppercase tracking-wider bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                              {winner.month} {winner.year}
                            </div>
                          </div>

                          {/* Stats Section */}
                          <div className="space-y-3">
                            {/* Points */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Star className="w-5 h-5 text-brand-gold" />
                                  <span className="text-gray-400 text-sm">Total Points</span>
                                </div>
                                <span className="text-2xl font-bold text-white">
                                  {winner.points.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Achievement Badge */}
                            <div className="bg-gradient-to-r from-brand-gold/10 to-yellow-600/10 rounded-xl p-4 border border-brand-gold/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Award className="w-5 h-5 text-brand-gold" />
                                  <span className="text-gray-400 text-sm">Achievement</span>
                                </div>
                                <span className="text-brand-gold font-semibold">
                                  Super Fan
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Trophy Icon at Bottom */}
                          <div className="mt-6 flex justify-center">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              <Trophy className="w-12 h-12 text-brand-gold opacity-30 group-hover:opacity-50 transition-opacity" />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                ))}

                {/* Placeholder Cards - Show only if less than 3 winners */}
                {Array.from({ length: Math.max(0, 3 - allWinners.length) }).map((_, index) => (
                      <motion.div
                        key={`placeholder-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + ((allWinners.length + index) * 0.1) }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-[#2a2a2a]/50 to-[#1a1a1a]/50 border-2 border-dashed border-white/20 rounded-2xl overflow-hidden h-full">
                          <div className="relative p-6 flex flex-col items-center justify-center min-h-[400px]">
                            <motion.div
                              animate={{ 
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                              className="text-center"
                            >
                              <div className="w-28 h-28 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center mb-4 mx-auto">
                                <Trophy className="w-12 h-12 text-white/30" />
                              </div>
                              <h3 className="text-xl font-bold text-white/40 mb-2">Coming Soon</h3>
                              <p className="text-gray-500 text-sm">
                                Future champion awaits
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom CTA */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-12"
                  >
                    <p className="text-gray-400 text-lg mb-4">
                      Will you be the next champion?
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <div className="bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm">
                        <span className="text-brand-gold font-semibold">🎮 Play Games</span>
                      </div>
                      <div className="bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm">
                        <span className="text-brand-gold font-semibold">🎉 Join Events</span>
                      </div>
                      <div className="bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm">
                        <span className="text-brand-gold font-semibold">💬 Engage</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
            </div>
          )}
        </main>
      {/* <Footer /> */}
    </div>
  );
};

export default FanOfMonthPage;
