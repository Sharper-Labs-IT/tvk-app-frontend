import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RevenueAnalytics } from '../../../../types/reports';

interface RevenueChartProps {
  data: RevenueAnalytics;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const currencyData = data.by_currency.map((item) => ({
    name: item.currency,
    revenue: parseFloat(item.total_revenue.toFixed(2)),
    transactions: item.transaction_count,
  }));

  const gatewayData = data.by_payment_gateway.map((item) => ({
    name: item.gateway,
    revenue: parseFloat(item.total_revenue.toFixed(2)),
    transactions: item.transaction_count,
  }));

  return (
    <div className="space-y-6">
      {/* Revenue by Currency */}
      {currencyData.length > 0 && (
        <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
          <h3 className="text-xl text-white font-semibold mb-4">Revenue by Currency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={currencyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (name === 'revenue') return [`$${(value || 0).toFixed(2)}`, 'Revenue'];
                  return [value || 0, 'Transactions'];
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenue by Payment Gateway */}
      {gatewayData.length > 0 && (
        <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
          <h3 className="text-xl text-white font-semibold mb-4">Revenue by Payment Gateway</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={gatewayData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (name === 'revenue') return [`$${(value || 0).toFixed(2)}`, 'Revenue'];
                  return [value || 0, 'Transactions'];
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#D4AF37" name="Revenue ($)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="transactions" fill="#8b5cf6" name="Transactions" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {currencyData.length === 0 && gatewayData.length === 0 && (
        <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
          <h3 className="text-xl text-white font-semibold mb-4">Revenue Analytics</h3>
          <p className="text-gray-400 text-center py-8">No revenue data available</p>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
