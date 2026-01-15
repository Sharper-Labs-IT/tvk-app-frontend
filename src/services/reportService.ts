import api from '../utils/api';
import type {
  ReportFilters,
  AnalyticsReportResponse,
  FilterOptionsResponse,
} from '../types/reports';

export const reportService = {
  /**
   * Fetch analytics report with optional filters
   * @param filters - Optional filters for the report
   * @returns Promise with analytics report data
   */
  getAnalytics: async (filters?: ReportFilters): Promise<AnalyticsReportResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.membership_plan) {
      params.append('membership_plan', String(filters.membership_plan));
    }

    const response = await api.get<AnalyticsReportResponse>(
      `/v1/admin/reports/analytics${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Fetch available filter options (countries, membership plans, genders)
   * @returns Promise with filter options
   */
  getFilterOptions: async (): Promise<FilterOptionsResponse> => {
    const response = await api.get<FilterOptionsResponse>(
      '/v1/admin/reports/filter-options'
    );
    return response.data;
  },
};
