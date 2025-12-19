import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, CreditCard } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
// Import 'type' to satisfy your strict TypeScript rules
import type { MembershipPlan } from '../../types/membership';

const AvailablePlans: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Fetching from the same endpoint used in Admin, but this should be publicly accessible
      const response = await api.get('/v1/membership/plans');
      setPlans(response.data.plans);
    } catch (err) {
      setError('Unable to load membership plans at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId: number) => {
    if (!isLoggedIn) {
      // If not logged in, redirect to login page
      navigate('/login', { state: { returnUrl: '/membership' } });
      return;
    }
    // If logged in, you would trigger the payment process here
    // For now, we'll alert or navigate to a payment page
    alert(`Initiating payment for Plan ID: ${planId} (Payment Gateway integration required)`);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-400 bg-red-500/10 rounded-lg max-w-2xl mx-auto mt-8 border border-red-500/20">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="relative flex flex-col p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-gold/40 hover:to-gold/5 transition-all duration-300 group"
          >
            {/* Card Content */}
            <div className="flex-1 bg-tvk-dark-card rounded-xl p-8 flex flex-col h-full border border-white/5 relative overflow-hidden">
              {/* Optional: 'Popular' Badge if the plan is named 'Gold' or similar logic */}
              {plan.name.toLowerCase().includes('gold') && (
                <div className="absolute top-0 right-0 bg-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors font-serif">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gold">${plan.price}</span>
                  <span className="text-sm text-gray-400">/ {plan.duration_days} Days</span>
                </div>
                <p className="text-sm text-gray-400 mt-4 min-h-[40px]">
                  {plan.description || 'Unlock exclusive access to premium content.'}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

              {/* Benefits List */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.benefits && plan.benefits.length > 0 ? (
                  plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm leading-relaxed">{benefit}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 text-sm italic">Standard benefits included</li>
                )}
              </ul>

              {/* Action Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                className="w-full py-3.5 rounded-lg font-bold text-sm tracking-wide uppercase transition-all duration-300 
                  bg-white/5 text-gold border border-gold/30 hover:bg-gold hover:text-black hover:shadow-[0_0_20px_rgba(230,198,91,0.3)]
                  flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                {isLoggedIn ? 'Subscribe Now' : 'Login to Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailablePlans;
