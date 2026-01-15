import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService } from '../../../services/reportService';
import type { AnalyticsReport, ReportFilters, FilterOptions } from '../../../types/reports';
import { exportToExcel } from './exportToExcel';
import { exportToPDF } from './exportToPDF';

// Components
import FilterPanel from './components/FilterPanel';
import SummaryCards from './components/SummaryCards';
import CountryChart from './components/CountryChart';
import GenderChart from './components/GenderChart';
import RevenueChart from './components/RevenueChart';
import TrendsChart from './components/TrendsChart';
import GrowthChart from './components/GrowthChart';
import SubscriptionChart from './components/SubscriptionChart';
import PlanDistributionChart from './components/PlanDistributionChart';
import ExportButtons from './components/ExportButtons';

const AnalyticsReportPage: React.FC = () => {
  const [reportData, setReportData] = useState<AnalyticsReport | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch analytics report on mount and when filters change
  useEffect(() => {
    fetchReport();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await reportService.getFilterOptions();
      if (response.success) {
        setFilterOptions(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching filter options:', err);
      toast.error('Failed to load filter options');
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportService.getAnalytics(filters);
      if (response.success) {
        setReportData(response.data);
      } else {
        throw new Error('Failed to fetch report data');
      }
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to load analytics report');
      toast.error('Failed to load analytics report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleExportExcel = useCallback(() => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    try {
      setExporting(true);
      exportToExcel(reportData);
      toast.success('Report exported to Excel successfully!');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      toast.error('Failed to export to Excel');
    } finally {
      setExporting(false);
    }
  }, [reportData]);

  const handleExportPDF = useCallback(async () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    try {
      setExporting(true);
      await exportToPDF('report-container');
      toast.success('Report exported to PDF successfully!');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      toast.error('Failed to export to PDF');
    } finally {
      setExporting(false);
    }
  }, [reportData]);

  if (loading && !reportData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        <span>{error}</span>
        <button
          onClick={fetchReport}
          className="ml-auto underline hover:text-red-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-gold" size={32} />
          <h1 className="text-3xl font-bold text-white font-serif">Analytics Report</h1>
        </div>
        <ExportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          isLoading={exporting}
          disabled={!reportData || loading}
        />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        onApply={handleApplyFilters}
        isLoading={loading}
      />

      {/* Report Container - This is what gets exported */}
      <div id="report-container" className="space-y-6">
        {reportData && (
          <>
            {/* Summary Cards */}
            <SummaryCards summary={reportData.summary} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CountryChart data={reportData.users_by_country} />
              <GenderChart data={reportData.users_by_gender} />
            </div>

            {/* Subscription Overview */}
            <SubscriptionChart data={reportData.subscriptions_overview} />

            {/* Revenue Analytics */}
            <RevenueChart data={reportData.revenue_analytics} />

            {/* Membership Plans Distribution */}
            <PlanDistributionChart data={reportData.membership_plans_distribution} />

            {/* Monthly Trends */}
            <TrendsChart data={reportData.monthly_trends} />

            {/* User Growth */}
            <GrowthChart data={reportData.user_growth} />

            {/* Filters Applied Info */}
            <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
              <h3 className="text-xl text-white font-semibold mb-4">Filters Applied</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Date Range:</span>
                  <span className="text-white ml-2">
                    {reportData.filters_applied.start_date || 'All Time'} to{' '}
                    {reportData.filters_applied.end_date || 'All Time'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Country:</span>
                  <span className="text-white ml-2">
                    {reportData.filters_applied.country || 'All Countries'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Gender:</span>
                  <span className="text-white ml-2">
                    {reportData.filters_applied.gender || 'All Genders'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Membership Plan:</span>
                  <span className="text-white ml-2">
                    {reportData.filters_applied.membership_plan || 'All Plans'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Report Generated:</span>
                  <span className="text-white ml-2">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && reportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-tvk-dark-card rounded-lg p-6 flex items-center gap-4">
            <Loader2 className="animate-spin text-gold w-8 h-8" />
            <span className="text-white text-lg">Updating report...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsReportPage;
