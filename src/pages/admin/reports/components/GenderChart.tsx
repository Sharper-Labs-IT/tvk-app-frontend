import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { GenderDistribution } from '../../../../types/reports';

interface GenderChartProps {
  data: GenderDistribution[];
}

const COLORS = {
  male: '#3b82f6',
  female: '#ec4899',
  unknown: '#6b7280',
  other: '#8b5cf6',
};

const GenderChart: React.FC<GenderChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
        <h3 className="text-xl text-white font-semibold mb-4">Users by Gender</h3>
        <p className="text-gray-400 text-center py-8">No data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    name: item.gender.charAt(0).toUpperCase() + item.gender.slice(1),
  }));

  return (
    <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
      <h3 className="text-xl text-white font-semibold mb-4">Users by Gender</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.gender.toLowerCase() as keyof typeof COLORS] || COLORS.other}
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
  );
};

export default GenderChart;
