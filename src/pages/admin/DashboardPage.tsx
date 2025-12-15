import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { type DashboardData } from '../../types/dashboard';
import { Loader2, AlertCircle, Users, FileText, Gamepad2, Clock } from 'lucide-react';

// If you don't have date-fns, run: npm install date-fns
// OR use a simple helper function (included below)

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const stats = await dashboardService.getStats();
      setData(stats);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date if you don't want to install date-fns
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        <span>{error}</span>
        <button onClick={fetchData} className="ml-auto underline hover:text-red-300">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white font-serif">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Members */}
        <StatCard
          label="Total Members"
          value={data?.totalMembers.toLocaleString() || '0'}
          color="border-gold"
          icon={Users}
        />

        {/* Total Posts */}
        <StatCard
          label="Total Content"
          value={data?.totalPosts.toLocaleString() || '0'}
          color="border-blue-500"
          icon={FileText}
        />

        {/* Total Games */}
        <StatCard
          label="Total Games"
          value={data?.totalGames.toLocaleString() || '0'}
          color="border-purple-500"
          icon={Gamepad2}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-tvk-dark-card rounded-lg border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Clock className="text-gold" size={20} />
          <h2 className="text-xl text-white font-semibold">Recent System Activity</h2>
        </div>

        <div className="p-6">
          {data?.recentActivities && data.recentActivities.length > 0 ? (
            <div className="space-y-6">
              {data.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div
                    className={`mt-1.5 w-2.5 h-2.5 rounded-full ${
                      activity.type === 'user' ? 'bg-gold' : 'bg-blue-400'
                    }`}
                  />

                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon: Icon }) => (
  <div
    className={`bg-tvk-dark-card p-6 rounded-lg border-t-4 ${color} shadow-lg flex items-center justify-between`}
  >
    <div>
      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
    <div className={`p-3 rounded-full bg-white/5 ${color.replace('border', 'text')}`}>
      <Icon size={24} />
    </div>
  </div>
);

export default DashboardPage;
