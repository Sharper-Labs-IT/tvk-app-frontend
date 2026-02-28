import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import type { ReportFilters, FilterOptions } from '../../../../types/reports';

interface FilterPanelProps {
  filters: ReportFilters;
  onFilterChange: (filters: ReportFilters) => void;
  filterOptions: FilterOptions | null;
  onApply: () => void;
  isLoading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  filterOptions,
  onApply,
  isLoading = false,
}) => {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field: keyof ReportFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value === '' || value === 'all' ? undefined : value,
    }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onApply();
  };

  const handleReset = () => {
    const emptyFilters: ReportFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
    onApply();
  };

  const setQuickDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    setLocalFilters({
      ...localFilters,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="bg-tvk-dark-card rounded-lg border border-white/5 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="text-gold" size={20} />
        <h2 className="text-xl text-white font-semibold">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Start Date</label>
          <input
            type="date"
            value={localFilters.start_date || ''}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            className="w-full px-3 py-2 bg-tvk-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">End Date</label>
          <input
            type="date"
            value={localFilters.end_date || ''}
            onChange={(e) => handleInputChange('end_date', e.target.value)}
            className="w-full px-3 py-2 bg-tvk-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
          />
        </div>

        {/* Quick Date Presets */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Quick Dates</label>
          <div className="flex gap-2">
            <button
              onClick={() => setQuickDateRange(7)}
              className="px-3 py-2 bg-tvk-dark border border-white/10 rounded-lg text-sm text-white hover:border-gold transition-colors"
            >
              7 Days
            </button>
            <button
              onClick={() => setQuickDateRange(30)}
              className="px-3 py-2 bg-tvk-dark border border-white/10 rounded-lg text-sm text-white hover:border-gold transition-colors"
            >
              30 Days
            </button>
            <button
              onClick={() => setQuickDateRange(365)}
              className="px-3 py-2 bg-tvk-dark border border-white/10 rounded-lg text-sm text-white hover:border-gold transition-colors"
            >
              1 Year
            </button>
          </div>
        </div>

        {/* Country Filter */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Country</label>
          <select
            value={localFilters.country || 'all'}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-3 py-2 bg-tvk-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="all">All Countries</option>
            {filterOptions?.countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Gender</label>
          <select
            value={localFilters.gender || 'all'}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-3 py-2 bg-tvk-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="all">All Genders</option>
            {filterOptions?.genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Membership Plan Filter */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Membership Plan</label>
          <select
            value={localFilters.membership_plan || 'all'}
            onChange={(e) => handleInputChange('membership_plan', e.target.value)}
            className="w-full px-3 py-2 bg-tvk-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="all">All Plans</option>
            {filterOptions?.membership_plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - ${plan.price}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Filter className="w-4 h-4" />
          Apply Filters
        </button>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
