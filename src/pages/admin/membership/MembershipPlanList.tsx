import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
// FIX: Added 'type' keyword here
import type { MembershipPlan } from '../../../types/membership';

const MembershipPlanList: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/v1/membership/plans');
      setPlans(response.data.plans);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch plans.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">Membership Plans</h1>
          <p className="text-gray-400 mt-1">Manage subscription tiers and pricing.</p>
        </div>

        <Link
          to="/admin/membership/create"
          className="flex items-center gap-2 bg-gold text-black font-bold px-6 py-2.5 rounded-lg hover:bg-white transition-all shadow-lg"
        >
          <PlusCircle size={20} />
          Create New Plan
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 && !error ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No membership plans found. Create one to get started.
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-tvk-dark-card border border-white/10 rounded-xl overflow-hidden hover:border-gold/50 transition-all duration-300 flex flex-col"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-white/5 bg-white/5">
                <h3 className="text-xl font-bold text-gold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-sm text-gray-400">/ {plan.duration_days} days</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1">
                <p className="text-gray-300 text-sm mb-4 min-h-[40px]">
                  {plan.description || 'No description provided.'}
                </p>

                {/* Benefits List */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Benefits
                  </p>
                  {plan.benefits && plan.benefits.length > 0 ? (
                    <ul className="space-y-2">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle size={16} className="text-gold mt-0.5 shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No benefits listed.</p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    plan.status === 1
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {plan.status === 1 ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">ID: {plan.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MembershipPlanList;
