import React, { useMemo } from 'react';
import { Crown, AlertCircle } from 'lucide-react';

interface SubscriptionWidgetProps {
  user: any;
  // isPremium can still be passed, but we will calculate the specific status inside
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
  // --- HELPERS ---
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // --- REFINED STATUS LOGIC (Mirrors MembershipPage) ---
  const membershipStatus = useMemo(() => {
    if (!user?.membership) return 'none';

    const isPaidPlan = user.membership.plan_id !== 1;
    const isActive = user.membership.status === 'active';
    const isAutoRenew = user.membership.auto_renew === true;

    if (isPaidPlan && isActive) {
      if (isAutoRenew) return 'active_auto_renew_on';
      return 'active_auto_renew_off'; // Grace period after cancellation
    }

    return 'free';
  }, [user]);

  const planName = user?.membership?.plan?.name || user?.membership_tier || 'Free Member';

  return (
    <div
      className={`p-5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
        isPremium
          ? 'bg-gradient-to-br from-[#1a1c2e] to-black border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
          : 'bg-black/40 border-white/10'
      }`}
    >
      {/* Background Icon Decoration */}
      <div className="absolute top-0 right-0 p-3 opacity-5">
        <Crown size={80} className={isPremium ? 'text-purple-500' : 'text-gray-500'} />
      </div>

      <h3
        className={`text-xs font-bold uppercase tracking-widest mb-1 ${
          isPremium ? 'text-purple-400' : 'text-gray-500'
        }`}
      >
        Current Plan
      </h3>

      <div className="flex items-center gap-2 mb-3">
        <p className="text-2xl font-bold text-white capitalize">{planName}</p>
        {isPremium && <Crown size={18} className="text-yellow-500" />}
      </div>

      {/* --- DYNAMIC CONTENT BASED ON STATUS --- */}
      <div className="mb-5">
        {membershipStatus === 'active_auto_renew_on' && (
          <div className="space-y-1">
            <p className="text-sm text-green-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Subscription Active
            </p>
            <p className="text-xs text-gray-400">
              Next billing: {formatDate(user?.membership?.end_date)}
            </p>
          </div>
        )}

        {membershipStatus === 'active_auto_renew_off' && (
          <div className="space-y-1">
            <p className="text-sm text-orange-400 flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} />
              Expires Soon
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Access until: {formatDate(user?.membership?.end_date)}
            </p>
          </div>
        )}

        {membershipStatus === 'free' && (
          <p className="text-xs text-gray-400 leading-relaxed">
            Upgrade to Super Fan to unlock exclusive live streams, 4K content, and priority meetups.
          </p>
        )}
      </div>

      {/* --- DYNAMIC BUTTON --- */}
      {membershipStatus === 'active_auto_renew_on' && (
        <button
          onClick={onCancelClick}
          className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-lg font-bold text-sm"
        >
          Cancel Auto-Renewal
        </button>
      )}

      {membershipStatus === 'active_auto_renew_off' && (
        <button
          disabled
          className="w-full py-2.5 bg-white/5 border border-white/10 text-gray-500 rounded-lg font-bold text-sm cursor-not-allowed"
        >
          Cancelled Auto Reneval
        </button>
      )}

      {(membershipStatus === 'free' || membershipStatus === 'none') && (
        <button
          onClick={onUpgradeClick}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white transition-all rounded-lg font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20"
        >
          Become a Super Fan
        </button>
      )}
    </div>
  );
};

export default SubscriptionWidget;
