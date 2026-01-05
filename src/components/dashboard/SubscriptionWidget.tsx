import React from 'react';
import { Crown } from 'lucide-react';

interface SubscriptionWidgetProps {
  user: any;
  isPremium: boolean;
  onUpgradeClick: () => void;
  onCancelClick: () => void;
}

const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({
  user,
  isPremium,
  onUpgradeClick,
  onCancelClick,
}) => {
  const calculateDaysLeft = () => {
    if (!user?.membership?.end_date) return 0;
    const end = new Date(user.membership.end_date).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  };

  // Safe fallback for plan name
  const planName = user?.membership_tier || user?.membership?.plan?.name || 'Free Member';

  return (
    <div
      className={`p-5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
        isPremium
          ? 'bg-gradient-to-br from-purple-900/40 to-black border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
          : 'bg-black/40 border-white/10'
      }`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Crown size={64} className={isPremium ? 'text-purple-500' : 'text-gray-500'} />
      </div>

      <h3 className={`text-lg font-bold mb-1 ${isPremium ? 'text-purple-400' : 'text-gray-400'}`}>
        Current Plan
      </h3>

      <p className="text-2xl font-bold text-white mb-2 capitalize">{planName}</p>

      {isPremium ? (
        <>
          <p className="text-sm text-green-400 mb-4 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Active • {calculateDaysLeft()} days left
          </p>
          <button
            onClick={onCancelClick}
            className="w-full py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition rounded-lg font-bold text-sm"
          >
            Cancel Subscription
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            Upgrade to unlock exclusive contents & badges.
          </p>
          <button
            onClick={onUpgradeClick}
            className="w-full py-2.5 bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition rounded-lg font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-yellow-500/20"
          >
            Buy Premium Plan
          </button>
        </>
      )}
    </div>
  );
};

export default SubscriptionWidget;
