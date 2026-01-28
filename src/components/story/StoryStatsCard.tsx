import type { LucideIcon } from 'lucide-react';

interface StoryStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: 'gold';
}

const COLOR_CLASSES = {
  gold: {
    bg: 'bg-brand-gold/10',
    text: 'text-brand-gold',
    icon: 'text-brand-gold',
    glow: 'from-brand-gold to-brand-goldDark',
  },
};

const StoryStatsCard = ({ icon: Icon, label, value, color }: StoryStatsCardProps) => {
  const colors = COLOR_CLASSES[color];

  return (
    <div className="relative bg-[#1E1E1E] border border-brand-gold/20 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:border-brand-gold/50 hover:shadow-[0_0_30px_rgba(230,198,91,0.2)] group">
      {/* Animated glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.glow} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300 -z-10`} />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">{label}</p>
          <p className={`text-4xl font-bold ${colors.text} drop-shadow-[0_0_10px_rgba(230,198,91,0.3)]`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-4 rounded-xl ${colors.bg} border border-brand-gold/20`}>
          <Icon className={`w-8 h-8 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StoryStatsCard;
