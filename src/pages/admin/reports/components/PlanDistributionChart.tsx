import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MembershipPlanDistribution } from '../../../../types/reports';

interface PlanDistributionChartProps {
  data: MembershipPlanDistribution[];
}

const PlanDistributionChart: React.FC<PlanDistributionChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
        <h3 className="text-xl text-white font-semibold mb-4">Membership Plans Distribution</h3>
        <p className="text-gray-400 text-center py-8">No membership plan data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.plan_name,
    subscriptions: item.subscription_count,
    price: item.plan_price,
  }));

  return (
    <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
      <h3 className="text-xl text-white font-semibold mb-4">Membership Plans Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="name"
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
            formatter={(value: number | undefined, name: string | undefined) => {
              if (name === 'price') return [`$${(value || 0).toFixed(2)}`, 'Price'];
              return [value || 0, 'Subscriptions'];
            }}
          />
          <Legend />
          <Bar dataKey="subscriptions" fill="#8b5cf6" name="Subscriptions" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlanDistributionChart;
