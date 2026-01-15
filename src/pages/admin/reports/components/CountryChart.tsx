import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CountryDistribution } from '../../../../types/reports';

interface CountryChartProps {
  data: CountryDistribution[];
}

const CountryChart: React.FC<CountryChartProps> = ({ data }) => {
  // Sort by count and take top 10
  const topCountries = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (topCountries.length === 0) {
    return (
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
        <h3 className="text-xl text-white font-semibold mb-4">Users by Country</h3>
        <p className="text-gray-400 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
      <h3 className="text-xl text-white font-semibold mb-4">Users by Country (Top 10)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={topCountries}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="country"
            stroke="#999"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="#999" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#D4AF37" name="Users" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CountryChart;
