// Report types for the comprehensive reporting system
export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export interface ReportFilters extends ReportDateRange {
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Summary Reports
export interface BusinessSummaryReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalCustomers: number;
  averageTransactionValue: number;
  profitMargin: number;
}

export interface ServicePerformanceReport {
  period: string;
  services: Array<{
    name: string;
    count: number;
    totalRevenue: number;
    averagePrice: number;
    percentage: number;
  }>;
  topService: string;
  leastPopularService: string;
}

export interface FinancialSummaryReport {
  period: string;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface CustomerAnalyticsReport {
  period: string;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageCustomerValue: number;
  customerRetentionRate: number;
}

// Detailed Reports
export interface TransactionHistoryReport {
  period: string;
  transactions: Array<{
    id: string;
    date: string;
    service: string;
    amount: number;
    notes?: string;
  }>;
  totalCount: number;
  totalAmount: number;
}

export interface ExpenseBreakdownReport {
  period: string;
  expenses: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
  }>;
  totalCount: number;
  totalAmount: number;
  byCategory: Record<string, number>;
}

export interface DailyOperationsReport {
  period: string;
  dailyData: Array<{
    date: string;
    transactions: number;
    revenue: number;
    expenses: number;
    profit: number;
    customers: number;
  }>;
}

// Exception Reports
export interface HighValueTransactionsReport {
  period: string;
  threshold: number;
  transactions: Array<{
    id: string;
    date: string;
    service: string;
    amount: number;
    notes?: string;
  }>;
  count: number;
  totalValue: number;
}

export interface ExpenseAnomaliesReport {
  period: string;
  anomalies: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    reason: string; // Why it's considered an anomaly
    severity: 'low' | 'medium' | 'high';
  }>;
  totalAnomalies: number;
}

export interface InactiveCustomersReport {
  period: string;
  inactiveDays: number;
  customers: Array<{
    lastVisit: string;
    daysSinceLastVisit: number;
    totalVisits: number;
    lastService: string;
    totalSpent: number;
  }>;
  count: number;
}

export interface LowPerformanceServicesReport {
  period: string;
  threshold: number;
  services: Array<{
    name: string;
    count: number;
    totalRevenue: number;
    averagePrice: number;
    performanceScore: number;
  }>;
}

export interface RevenueOutliersReport {
  period: string;
  averageDailyRevenue: number;
  outliers: Array<{
    date: string;
    revenue: number;
    deviation: number;
    type: 'high' | 'low';
    transactions: number;
  }>;
}

// Report Export Options
export interface ReportExportOptions {
  format: 'pdf' | 'csv' | 'json';
  includeCharts?: boolean;
  fileName?: string;
}

// Report Categories
export type ReportCategory = 'summary' | 'detailed' | 'exception';

export interface ReportConfig {
  type: string;
  name: string;
  description: string;
  category: ReportCategory;
  defaultDateRange: 'last7days' | 'last30days' | 'last90days' | 'lastYear' | 'custom';
  exportFormats: Array<'pdf' | 'csv' | 'json'>;
}