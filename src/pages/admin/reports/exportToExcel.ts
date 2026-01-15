import * as XLSX from 'xlsx';
import type { AnalyticsReport } from '../../../types/reports';

/**
 * Export analytics report data to Excel
 * @param data - The analytics report data
 */
export const exportToExcel = (data: AnalyticsReport): void => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary Statistics
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Users', data.summary.total_users],
      ['Active Users', data.summary.active_users],
      ['Total Memberships', data.summary.total_memberships],
      ['Active Memberships', data.summary.active_memberships],
      ['Total Revenue', data.summary.total_revenue.toFixed(2)],
      ['Total Transactions', data.summary.total_transactions],
      ['Average Transaction Value', data.summary.average_transaction_value.toFixed(2)],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Users by Country
    if (data.users_by_country.length > 0) {
      const countrySheet = XLSX.utils.json_to_sheet(data.users_by_country);
      XLSX.utils.book_append_sheet(workbook, countrySheet, 'Users by Country');
    }

    // Sheet 3: Users by Gender
    if (data.users_by_gender.length > 0) {
      const genderSheet = XLSX.utils.json_to_sheet(data.users_by_gender);
      XLSX.utils.book_append_sheet(workbook, genderSheet, 'Users by Gender');
    }

    // Sheet 4: Subscription Status
    if (data.subscriptions_overview.by_status.length > 0) {
      const subscriptionData = [
        ['Status', 'Count'],
        ...data.subscriptions_overview.by_status.map((item: any) => [item.status, item.count]),
        [],
        ['Auto Renew Enabled', data.subscriptions_overview.auto_renew_enabled],
        ['Auto Renew Disabled', data.subscriptions_overview.auto_renew_disabled],
      ];
      const subscriptionSheet = XLSX.utils.aoa_to_sheet(subscriptionData);
      XLSX.utils.book_append_sheet(workbook, subscriptionSheet, 'Subscriptions');
    }

    // Sheet 5: Revenue by Currency
    if (data.revenue_analytics.by_currency.length > 0) {
      const currencySheet = XLSX.utils.json_to_sheet(data.revenue_analytics.by_currency);
      XLSX.utils.book_append_sheet(workbook, currencySheet, 'Revenue by Currency');
    }

    // Sheet 6: Revenue by Gateway
    if (data.revenue_analytics.by_payment_gateway.length > 0) {
      const gatewaySheet = XLSX.utils.json_to_sheet(data.revenue_analytics.by_payment_gateway);
      XLSX.utils.book_append_sheet(workbook, gatewaySheet, 'Revenue by Gateway');
    }

    // Sheet 7: Membership Plans Distribution
    if (data.membership_plans_distribution.length > 0) {
      const plansSheet = XLSX.utils.json_to_sheet(data.membership_plans_distribution);
      XLSX.utils.book_append_sheet(workbook, plansSheet, 'Membership Plans');
    }

    // Sheet 8: Monthly Trends
    if (data.monthly_trends.length > 0) {
      const trendsSheet = XLSX.utils.json_to_sheet(data.monthly_trends);
      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Monthly Trends');
    }

    // Sheet 9: User Growth
    if (data.user_growth.length > 0) {
      const growthSheet = XLSX.utils.json_to_sheet(data.user_growth);
      XLSX.utils.book_append_sheet(workbook, growthSheet, 'User Growth');
    }

    // Sheet 10: Filters Applied
    const filtersData = [
      ['Filter', 'Value'],
      ['Start Date', data.filters_applied.start_date || 'All Time'],
      ['End Date', data.filters_applied.end_date || 'All Time'],
      ['Country', data.filters_applied.country || 'All Countries'],
      ['Gender', data.filters_applied.gender || 'All Genders'],
      ['Membership Plan', data.filters_applied.membership_plan || 'All Plans'],
    ];
    const filtersSheet = XLSX.utils.aoa_to_sheet(filtersData);
    XLSX.utils.book_append_sheet(workbook, filtersSheet, 'Filters');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `Vijay_Fan_Analytics_Report_${timestamp}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
};
