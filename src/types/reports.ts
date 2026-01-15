// Report Filter Types
export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  country?: string;
  gender?: 'male' | 'female' | 'unknown' | 'all';
  membership_plan?: number | 'all';
}

// Summary Statistics
export interface ReportSummary {
  total_users: number;
  active_users: number;
  total_memberships: number;
  active_memberships: number;
  total_revenue: number;
  total_transactions: number;
  average_transaction_value: number;
}

// Country Distribution
export interface CountryDistribution {
  country: string;
  count: number;
}

// Gender Distribution
export interface GenderDistribution {
  gender: string;
  count: number;
}

// Subscription Status
export interface SubscriptionStatus {
  status: string;
  count: number;
}

// Subscriptions Overview
export interface SubscriptionsOverview {
  by_status: SubscriptionStatus[];
  auto_renew_enabled: number;
  auto_renew_disabled: number;
}

// Revenue by Currency
export interface RevenueByCurrency {
  currency: string;
  total_revenue: number;
  transaction_count: number;
}

// Revenue by Payment Gateway
export interface RevenueByGateway {
  gateway: string;
  total_revenue: number;
  transaction_count: number;
}

// Revenue Analytics
export interface RevenueAnalytics {
  by_currency: RevenueByCurrency[];
  by_payment_gateway: RevenueByGateway[];
}

// Membership Plan Distribution
export interface MembershipPlanDistribution {
  plan_name: string;
  plan_price: number;
  subscription_count: number;
}

// Monthly Trends
export interface MonthlyTrend {
  month: string;
  new_users: number;
  new_subscriptions: number;
  revenue: number;
}

// User Growth
export interface UserGrowth {
  date: string;
  new_users: number;
}

// Filters Applied
export interface FiltersApplied {
  start_date: string;
  end_date: string;
  country: string;
  gender: string;
  membership_plan: string;
}

// Complete Analytics Report
export interface AnalyticsReport {
  summary: ReportSummary;
  users_by_country: CountryDistribution[];
  users_by_gender: GenderDistribution[];
  subscriptions_overview: SubscriptionsOverview;
  revenue_analytics: RevenueAnalytics;
  membership_plans_distribution: MembershipPlanDistribution[];
  monthly_trends: MonthlyTrend[];
  user_growth: UserGrowth[];
  filters_applied: FiltersApplied;
}

// Filter Options
export interface MembershipPlanOption {
  id: number;
  name: string;
  price: number;
}

export interface FilterOptions {
  countries: string[];
  membership_plans: MembershipPlanOption[];
  genders: string[];
}

// API Response Types
export interface AnalyticsReportResponse {
  success: boolean;
  data: AnalyticsReport;
}

export interface FilterOptionsResponse {
  success: boolean;
  data: FilterOptions;
}
