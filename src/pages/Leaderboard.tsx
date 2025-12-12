import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Star, Gamepad2, Target, Search, Users, Zap, Flame } from 'lucide-react';
import LogoHeader from '../components/common/LogoHeader';
import Footer from '../components/Footer';
import { getTrophyColor, type TrophyTier } from '../utils/trophySystem';
import { gameService, type LeaderboardEntry } from '../services/gameService'; // Import gameService

// --- Types ---
interface UserTrophyData {
  userId: string;
  username: string;
  nickname?: string; // Display name
  avatar: string;
  totalTrophies: number;
  trophyBreakdown: {
    PLATINUM: number;
    GOLD: number;
    SILVER: number;
    BRONZE: number;
  };
  recentAchievement?: {
    game: string;
    tier: TrophyTier;
    date: string;
  };
  rank: number;
}

// --- Dummy Data ---
const DUMMY_LEADERBOARD_DATA: UserTrophyData[] = [
  {
    userId: '1',
    username: 'CyberNinja',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CyberNinja&backgroundColor=b6e3f4',
    totalTrophies: 45,
    trophyBreakdown: { PLATINUM: 5, GOLD: 15, SILVER: 20, BRONZE: 5 },
    recentAchievement: { game: 'Space Invaders', tier: 'PLATINUM', date: '2 mins ago' },
    rank: 1
  },
  {
    userId: '2',
    username: 'PixelMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PixelMaster&backgroundColor=ffdfbf',
    totalTrophies: 38,
    trophyBreakdown: { PLATINUM: 3, GOLD: 10, SILVER: 15, BRONZE: 10 },
    recentAchievement: { game: 'City Defender', tier: 'GOLD', date: '1 hour ago' },
    rank: 2
  },
  {
    userId: '3',
    username: 'RetroGamer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RetroGamer&backgroundColor=c0aede',
    totalTrophies: 32,
    trophyBreakdown: { PLATINUM: 1, GOLD: 8, SILVER: 12, BRONZE: 11 },
    rank: 3
  },
  {
    userId: '4',
    username: 'SpeedRunner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SpeedRunner',
    totalTrophies: 28,
    trophyBreakdown: { PLATINUM: 0, GOLD: 5, SILVER: 15, BRONZE: 8 },
    rank: 4
  },
  {
    userId: '5',
    username: 'QuestHunter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuestHunter',
    totalTrophies: 25,
    trophyBreakdown: { PLATINUM: 0, GOLD: 3, SILVER: 10, BRONZE: 12 },
    rank: 5
  },
    {
    userId: '6',
    username: 'ShadowSlayer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowSlayer',
    totalTrophies: 22,
    trophyBreakdown: { PLATINUM: 0, GOLD: 2, SILVER: 8, BRONZE: 12 },
    rank: 6
  },
];

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<UserTrophyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'platinum' | 'gold'>('all');

  useEffect(() => {
    // --- Backend API Integration ---
    const fetchLeaderboard = async () => {
      try {
        const response = await gameService.getLeaderboard();
        console.log('[Leaderboard] API Response:', response);
        
        // Handle potential response wrapping (e.g. { leaderboard: [...] } or { data: [...] })
        const data = Array.isArray(response) 
          ? response 
          : (response as any).leaderboard || (response as any).data || [];
        console.log('[Leaderboard] Parsed data:', data);
        
        // If no data from API, use dummy data
        if (!data || data.length === 0) {
          console.log('[Leaderboard] No data from API, using dummy data');
          setLeaderboardData(DUMMY_LEADERBOARD_DATA);
          return;
        }
        
        // Map backend data to frontend format
        // Backend format: { user_id, total_score, total_coins, bronze_count, silver_count, gold_count, platinum_count, total_trophies, user: { id, name, avatar, nickname } }
        const formattedData: UserTrophyData[] = data.map((entry: any, index: number) => ({
          userId: entry.user_id?.toString() || entry.user?.id?.toString() || '0',
          username: entry.user?.name || entry.username || 'Unknown',
          nickname: entry.user?.nickname || entry.nickname || null,
          avatar: entry.user?.avatar || entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user?.nickname || entry.user?.name || entry.username}`,
          totalTrophies: entry.total_trophies || 0,
          trophyBreakdown: entry.trophy_breakdown || {
            PLATINUM: entry.platinum_count || 0,
            GOLD: entry.gold_count || 0,
            SILVER: entry.silver_count || 0,
            BRONZE: entry.bronze_count || 0
          },
          rank: entry.rank || index + 1
        }));
        console.log('[Leaderboard] Formatted data:', formattedData);
        setLeaderboardData(formattedData);
      } catch (error) {
        console.error("[Leaderboard] Failed to fetch leaderboard:", error);
        // Fallback to dummy data
        setLeaderboardData(DUMMY_LEADERBOARD_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = leaderboardData.slice(0, 3);
  const restOfPlayers = leaderboardData.slice(3);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 selection:text-red-200 overflow-x-hidden">
      <LogoHeader />

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>
      
      <main className="relative  pb-20 px-4 md:px-8 max-w-7xl mx-auto z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md">
              Season 2026
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            HALL OF <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-2xl">FAME</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium"
          >
            Rise through the ranks. Claim your throne.
          </motion.p>
        </div>

        {/* The Podium (Top 3) */}
        {!loading && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-20 min-h-[400px]">
            {/* Rank 2 */}
            {topThree[1] && <PodiumCard user={topThree[1]} rank={2} delay={0.2} />}
            
            {/* Rank 1 (Center, Largest) */}
            {topThree[0] && <PodiumCard user={topThree[0]} rank={1} delay={0} />}
            
            {/* Rank 3 */}
            {topThree[2] && <PodiumCard user={topThree[2]} rank={3} delay={0.4} />}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-24 max-w-7xl mx-auto px-4">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-bold mb-12 text-center text-zinc-600 uppercase tracking-[0.3em]"
          >
            Platform Statistics
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { icon: <Trophy className="w-8 h-8 text-yellow-500" />, label: "Total Trophies", value: "12.4K", color: "yellow", delay: 0 },
                { icon: <Users className="w-8 h-8 text-blue-500" />, label: "Active Players", value: "2,840", color: "blue", delay: 0.1 },
                { icon: <Target className="w-8 h-8 text-red-500" />, label: "Games Played", value: "45.2K", color: "red", delay: 0.2 },
                { icon: <Crown className="w-8 h-8 text-purple-500" />, label: "Champions", value: "156", color: "purple", delay: 0.3 },
            ].map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: stat.delay }}
                >
                    <StatCard {...stat} />
                </motion.div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-2 rounded-2xl">
           <div className="flex items-center gap-4 px-4">
              <Trophy className="w-5 h-5 text-zinc-500" />
              <span className="font-bold text-zinc-300">Global Rankings</span>
           </div>
           
           <div className="flex gap-2">
              {['all', 'platinum', 'gold'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    filter === f 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  } uppercase tracking-wider`}
                >
                  {f}
                </button>
              ))}
           </div>
           
           <div className="relative hidden md:block px-2">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               placeholder="Find player..." 
               className="bg-black/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 w-48 transition-colors"
             />
           </div>
        </div>

        {/* List View (Rank 4+) */}
        <div className="space-y-3">
            <AnimatePresence>
                {loading ? (
                    <div className="text-center py-20 text-zinc-500 animate-pulse">Syncing Leaderboard Data...</div>
                ) : (
                    restOfPlayers.map((user, index) => (
                        <ListRow key={user.userId} user={user} index={index + 3} />
                    ))
                )}
            </AnimatePresence>
        </div>
        
        <div className="mt-12 text-center">
             <button className="group relative px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 text-sm font-bold uppercase tracking-widest hover:text-white hover:border-red-500/50 transition-all overflow-hidden">
                <span className="relative z-10">Load More Players</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
             </button>
        </div>

      </main>

      <Footer />
    </div>
  );
};

// --- Sub Components ---

const PodiumCard = ({ user, rank, delay }: { user: UserTrophyData; rank: number; delay: number }) => {
    const isFirst = rank === 1;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, type: "spring" }}
            className={`relative flex flex-col items-center justify-end ${isFirst ? 'w-full md:w-1/3 -mt-12 z-20' : 'w-full md:w-1/4 z-10'}`}
        >
            {/* Crown for #1 */}
            {isFirst && (
                <motion.div 
                    animate={{ y: [-10, 0, -10] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-4"
                >
                    <Crown className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                </motion.div>
            )}

            <div className={`
                relative w-full p-6 rounded-3xl backdrop-blur-2xl border
                flex flex-col items-center gap-4 group transition-all duration-300
                ${isFirst 
                    ? 'bg-gradient-to-b from-yellow-500/10 to-black/80 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] h-[380px]' 
                    : rank === 2 
                        ? 'bg-gradient-to-b from-zinc-300/10 to-black/80 border-zinc-400/20 h-[320px]'
                        : 'bg-gradient-to-b from-amber-700/10 to-black/80 border-amber-700/20 h-[300px]'
                }
            `}>
                {/* Avatar */}
                <div className={`relative p-1 rounded-full border-2 ${isFirst ? 'border-yellow-400' : 'border-white/20'}`}>
                   <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className={`rounded-full object-cover bg-zinc-800 ${isFirst ? 'w-24 h-24' : 'w-20 h-20'}`}
                    />
                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black bg-black border ${isFirst ? 'border-yellow-500 text-yellow-400' : 'border-zinc-700 text-white'}`}>
                        #{rank}
                    </div>
                </div>

                {/* Info */}
                <div className="text-center mt-2">
                    <h3 className={`font-black tracking-tight ${isFirst ? 'text-2xl text-white' : 'text-xl text-zinc-200'}`}>
                        {user.nickname || user.username}
                    </h3>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Level {Math.floor(user.totalTrophies / 5) + 1}</p>
                </div>

                {/* Trophy Count */}
                <div className="mt-auto flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                    <Trophy className={`w-5 h-5 ${isFirst ? 'text-yellow-400' : 'text-zinc-400'}`} />
                    <span className="text-2xl font-bold font-mono">{user.totalTrophies}</span>
                </div>
                
                {/* Glow Effect on Hover */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t ${isFirst ? 'from-yellow-500/20' : 'from-white/10'} to-transparent`} />
            </div>
        </motion.div>
    );
};

const ListRow = ({ user, index }: { user: UserTrophyData; index: number }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex items-center gap-4 md:gap-8 p-4 bg-zinc-900/30 hover:bg-zinc-800/50 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all duration-300 backdrop-blur-sm"
        >
            {/* Rank */}
            <div className="w-12 text-center font-mono font-bold text-zinc-500 group-hover:text-white transition-colors text-xl">
                #{index + 1}
            </div>

            {/* User Info */}
            <div className="flex-1 flex items-center gap-4">
                <img src={user.avatar} alt={user.nickname || user.username} className="w-12 h-12 rounded-full border border-white/10 group-hover:border-red-500/50 transition-colors" />
                <div>
                    <h4 className="font-bold text-lg text-zinc-200 group-hover:text-white">{user.nickname || user.username}</h4>
                    <div className="flex gap-3 text-xs text-zinc-500">
                       <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />{user.trophyBreakdown.PLATINUM} Plat</span>
                       <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{user.trophyBreakdown.GOLD} Gold</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="text-right flex items-center gap-6">
                <div className="hidden md:block text-right">
                    <p className="text-xs text-zinc-500 mb-1">Recent</p>
                    <p className="text-xs font-medium text-zinc-300">{user.recentAchievement?.game || 'Idle'}</p>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 border border-white/5 group-hover:border-red-500/20 transition-colors">
                     <Trophy className="w-4 h-4 text-zinc-500 group-hover:text-yellow-500 transition-colors" />
                     <span className="font-mono font-bold text-white">{user.totalTrophies}</span>
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => {
    return (
        <div className="h-full p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-sm hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300 group flex flex-col items-center text-center justify-center gap-4">
            <div className={`p-4 rounded-2xl bg-${color}-500/10 group-hover:bg-${color}-500/20 transition-colors ring-1 ring-${color}-500/20 group-hover:ring-${color}-500/40`}>
                {icon}
            </div>
            <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
                <p className="text-4xl font-black text-white tracking-tight">{value}</p>
            </div>
        </div>
    );
}

export default Leaderboard;