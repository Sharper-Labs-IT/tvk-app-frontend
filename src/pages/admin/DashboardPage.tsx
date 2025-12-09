import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white font-serif">Welcome Back, Admin</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Members', value: '1,234', color: 'border-gold' },
          { label: 'Active Posts', value: '56', color: 'border-blue-400' },
          { label: 'Pending Approvals', value: '12', color: 'border-red-400' },
        ].map((stat, index) => (
          <div
            key={index}
            className={`bg-tvk-dark-card p-6 rounded-lg border-t-4 ${stat.color} shadow-lg`}
          >
            <p className="text-gray-400 text-sm font-medium uppercase">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-tvk-dark-card rounded-lg border border-white/5">
        <h2 className="text-xl text-gold mb-4">Recent Activity</h2>
        <p className="text-gray-400">System is running smoothly. No new alerts.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
