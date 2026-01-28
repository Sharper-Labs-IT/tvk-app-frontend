import React, { useMemo } from 'react';
import {
  Trophy,
  Gamepad2,
  Sparkles,
  ShieldCheck,
  Crown,
  Ticket,
  Medal,
  Flame,
  Zap,
  Star,
} from 'lucide-react';

const getBadgeVisuals = (badgeName: string) => {
  const name = badgeName.toLowerCase().trim();
  if (name.includes('new member'))
    return { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (name.includes('verified'))
    return { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  if (name.includes('premium'))
    return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  if (name.includes('event')) return { icon: Ticket, color: 'text-pink-400', bg: 'bg-pink-500/20' };
  if (name.includes('top performer'))
    return { icon: Medal, color: 'text-orange-400', bg: 'bg-orange-500/20' };
  if (name.includes('super fan'))
    return { icon: Flame, color: 'text-red-500', bg: 'bg-red-500/20' };
  if (name.includes('legend'))
    return { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/20' };
  return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
};

const GameStats: React.FC<{ user: any }> = ({ user }) => {
  const totalPoints = user?.points || 0;
  const gamesPlayed = user?.game_participation?.length || 0;
  const badgeCount = user?.badges?.length || 0;

  const trophyCount = useMemo(() => {
    if (!user?.trophies) return 0;
    if (Array.isArray(user.trophies)) return user.trophies.length;
    return Object.values(user.trophies).reduce((acc: number, group: any) => acc + group.length, 0);
  }, [user?.trophies]);

  return (
    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="bg-slate-900 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-slate-700/50 text-center shadow-lg hover:border-yellow-500/30 transition-colors">
          <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Total Points</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-500">{totalPoints}</p>
        </div>
        <div className="bg-slate-900 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-slate-700/50 text-center shadow-lg hover:border-blue-500/30 transition-colors">
          <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Games Played</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{gamesPlayed}</p>
        </div>
        <div className="bg-slate-900 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-slate-700/50 text-center shadow-lg hover:border-purple-500/30 transition-colors">
          <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Trophies</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{trophyCount}</p>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-5 md:p-6 shadow-xl">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={18} /> 
          <span className="sm:inline">Achievements</span>
        </h3>

        {badgeCount === 0 && trophyCount === 0 ? (
          <div className="text-center py-6 sm:py-8 text-slate-500 text-xs sm:text-sm bg-slate-800/30 rounded-lg sm:rounded-xl border border-dashed border-slate-700">
            <p>No achievements yet.</p>
            <p className="mt-1 text-[10px] sm:text-xs">Play games to earn badges & trophies!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {user?.badges?.map((badge: any) => {
              const { icon: BadgeIcon, color: iconColor, bg: iconBg } = getBadgeVisuals(badge.name);
              return (
                <div
                  key={badge.id}
                  className="bg-slate-800 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl flex flex-col items-center text-center group border border-slate-700 hover:border-slate-500 transition shadow-sm hover:shadow-md active:scale-95 touch-manipulation"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg mb-2 sm:mb-3 ${iconBg} ${iconColor} ring-2 ring-slate-700 group-hover:scale-110 transition-transform`}
                  >
                    <BadgeIcon size={20} strokeWidth={2} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  </div>
                  <span className="text-slate-200 text-[10px] sm:text-xs md:text-sm font-bold leading-tight line-clamp-2">
                    {badge.name}
                  </span>
                  <span className="text-slate-500 text-[8px] sm:text-[10px] mt-1 font-mono tracking-wide bg-slate-900 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-700/50">
                    {badge.points_required} PTS
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Game History List */}
      <div className="bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-5 md:p-6 shadow-xl">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Gamepad2 className="text-purple-400" size={18} /> 
          <span className="sm:inline">Recent Games</span>
        </h3>
        {user?.game_participation && user.game_participation.length > 0 ? (
          <div className="space-y-2 sm:space-y-3 max-h-56 sm:max-h-64 md:max-h-72 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            {user.game_participation.map((game: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center p-2.5 sm:p-3 bg-slate-800 rounded-lg sm:rounded-xl border border-slate-700 hover:border-purple-500/50 transition group active:scale-[0.98] touch-manipulation"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-purple-400 transition-colors shrink-0">
                    <Gamepad2 size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-200 font-bold text-xs sm:text-sm truncate">
                      {game.game?.name || 'Unknown Game'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500">Score: {game.score}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-yellow-500 font-bold text-xs sm:text-sm">+{game.coins}</p>
                  <p className="text-[8px] sm:text-[10px] text-green-400 uppercase tracking-wide bg-green-500/10 px-1.5 sm:px-2 py-0.5 rounded-full inline-block mt-1">
                    {game.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 text-xs sm:text-sm py-6 sm:py-8 bg-slate-800/30 rounded-lg sm:rounded-xl border border-dashed border-slate-700">
            No recent games played.
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;
