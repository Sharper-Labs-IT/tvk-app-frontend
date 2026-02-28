import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthlyTrend } from '../../../../types/reports';

interface TrendsChartProps {
  data: MonthlyTrend[];
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
        <h3 className="text-xl text-white font-semibold mb-4">Monthly Trends</h3>
        <p className="text-gray-400 text-center py-8">No trend data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    month: item.month,
    newUsers: item.new_users,
    newSubscriptions: item.new_subscriptions,
    revenue: parseFloat(item.revenue.toFixed(2)),
  }));

  return (
    <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
      <h3 className="text-xl text-white font-semibold mb-4">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="month" stroke="#999" />
          <YAxis yAxisId="left" stroke="#999" />
          <YAxis yAxisId="right" orientation="right" stroke="#999" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number | undefined, name: string | undefined) => {
              if (name === 'revenue') return [`$${(value || 0).toFixed(2)}`, 'Revenue'];
              if (name === 'newUsers') return [value || 0, 'New Users'];
              return [value || 0, 'New Subscriptions'];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="newUsers"
            stroke="#3b82f6"
            strokeWidth={2}
            name="New Users"
            dot={{ fill: '#3b82f6' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="newSubscriptions"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="New Subscriptions"
            dot={{ fill: '#8b5cf6' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#D4AF37"
            strokeWidth={2}
            name="Revenue ($)"
            dot={{ fill: '#D4AF37' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendsChart;
