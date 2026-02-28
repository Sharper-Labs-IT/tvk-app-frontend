import React from 'react';
import { Users, UserCheck, CreditCard, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import type { ReportSummary } from '../../../../types/reports';

interface SummaryCardsProps {
  summary: ReportSummary;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, subtitle }) => {
  return (
    <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6 hover:border-gold/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        label="Total Users"
        value={formatNumber(summary.total_users)}
        icon={Users}
        color="bg-blue-600"
        subtitle="All registered users"
      />

      <StatCard
        label="Active Users"
        value={formatNumber(summary.active_users)}
        icon={UserCheck}
        color="bg-green-600"
        subtitle="Currently active users"
      />

      <StatCard
        label="Total Memberships"
        value={formatNumber(summary.total_memberships)}
        icon={CreditCard}
        color="bg-purple-600"
        subtitle="All membership subscriptions"
      />

      <StatCard
        label="Active Memberships"
        value={formatNumber(summary.active_memberships)}
        icon={ShoppingCart}
        color="bg-indigo-600"
        subtitle="Currently active subscriptions"
      />

      <StatCard
        label="Total Revenue"
        value={formatCurrency(summary.total_revenue)}
        icon={DollarSign}
        color="bg-gold"
        subtitle={`From ${formatNumber(summary.total_transactions)} transactions`}
      />

      <StatCard
        label="Avg Transaction Value"
        value={formatCurrency(summary.average_transaction_value)}
        icon={TrendingUp}
        color="bg-orange-600"
        subtitle="Average per transaction"
      />
    </div>
  );
};

export default SummaryCards;
