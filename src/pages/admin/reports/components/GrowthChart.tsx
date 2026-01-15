import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { UserGrowth } from '../../../../types/reports';

interface GrowthChartProps {
  data: UserGrowth[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
        <h3 className="text-xl text-white font-semibold mb-4">User Growth</h3>
        <p className="text-gray-400 text-center py-8">No growth data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    newUsers: item.new_users,
  }));

  return (
    <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
      <h3 className="text-xl text-white font-semibold mb-4">User Growth Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
            }}
            labelStyle={{ color: '#D4AF37' }}
          />
          <Area
            type="monotone"
            dataKey="newUsers"
            stroke="#D4AF37"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUsers)"
            name="New Users"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
