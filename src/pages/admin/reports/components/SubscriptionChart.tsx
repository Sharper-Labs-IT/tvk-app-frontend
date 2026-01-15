import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { SubscriptionsOverview } from '../../../../types/reports';

interface SubscriptionChartProps {
  data: SubscriptionsOverview;
}

const STATUS_COLORS: { [key: string]: string } = {
  active: '#10b981',
  cancelled: '#ef4444',
  expired: '#f59e0b',
  pending: '#3b82f6',
  suspended: '#6b7280',
};

const SubscriptionChart: React.FC<SubscriptionChartProps> = ({ data }) => {
  if (data.by_status.length === 0) {
    return (
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
        <h3 className="text-xl text-white font-semibold mb-4">Subscriptions Overview</h3>
        <p className="text-gray-400 text-center py-8">No subscription data available</p>
      </div>
    );
  }

  const statusData = data.by_status.map((item) => ({
    ...item,
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
  }));

  const autoRenewData = [
    { name: 'Auto-Renew Enabled', value: data.auto_renew_enabled },
    { name: 'Auto-Renew Disabled', value: data.auto_renew_disabled },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Subscription Status */}
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
        <h3 className="text-xl text-white font-semibold mb-4">Subscription Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {statusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.status.toLowerCase()] || '#6b7280'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Auto-Renew Status */}
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
        <h3 className="text-xl text-white font-semibold mb-4">Auto-Renew Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={autoRenewData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubscriptionChart;
