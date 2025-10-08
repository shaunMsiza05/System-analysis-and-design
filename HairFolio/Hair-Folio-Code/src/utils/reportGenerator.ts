// Report generation utilities
import { Transaction, Expense } from '@/types/index';
import {
  BusinessSummaryReport,
  ServicePerformanceReport,
  FinancialSummaryReport,
  CustomerAnalyticsReport,
  TransactionHistoryReport,
  ExpenseBreakdownReport,
  DailyOperationsReport,
  HighValueTransactionsReport,
  ExpenseAnomaliesReport,
  InactiveCustomersReport,
  LowPerformanceServicesReport,
  RevenueOutliersReport,
  ReportDateRange
} from '@/types/reports';
import { format, parseISO, differenceInDays, eachDayOfInterval } from 'date-fns';

export class ReportGenerator {
  private transactions: Transaction[];
  private expenses: Expense[];

  constructor(transactions: Transaction[], expenses: Expense[]) {
    this.transactions = transactions;
    this.expenses = expenses;
  }

  private filterTransactionsByDateRange(transactions: Transaction[], dateRange: ReportDateRange): Transaction[] {
    return transactions.filter(item => {
      const itemDate = item.date;
      return itemDate && itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    });
  }

  private filterExpensesByDateRange(expenses: Expense[], dateRange: ReportDateRange): Expense[] {
    return expenses.filter(item => {
      const itemDate = item.date;
      return itemDate && itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    });
  }

  // Summary Reports
  generateBusinessSummary(dateRange: ReportDateRange): BusinessSummaryReport {
    const filteredTransactions = this.filterTransactionsByDateRange(this.transactions, dateRange);
    const filteredExpenses = this.filterExpensesByDateRange(this.expenses, dateRange);

    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.price || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const totalCustomers = filteredTransactions.length; // Each transaction = 1 customer visit
    const averageTransactionValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      totalRevenue,
      totalExpenses,
      netProfit,
      totalCustomers,
      averageTransactionValue,
      profitMargin
    };
  }

  generateServicePerformance(dateRange: ReportDateRange): ServicePerformanceReport {
    const filteredTransactions = this.filterTransactionsByDateRange(this.transactions, dateRange);
    
    const serviceStats = filteredTransactions.reduce((acc, t) => {
      const style = t.style || 'Unknown';
      if (!acc[style]) {
        acc[style] = { count: 0, totalRevenue: 0 };
      }
      acc[style].count++;
      acc[style].totalRevenue += t.price || 0;
      return acc;
    }, {} as Record<string, { count: number; totalRevenue: number }>);

    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.price || 0), 0);
    
    const services = Object.entries(serviceStats).map(([name, stats]) => ({
      name,
      count: stats.count,
      totalRevenue: stats.totalRevenue,
      averagePrice: stats.totalRevenue / stats.count,
      percentage: totalRevenue > 0 ? (stats.totalRevenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      services,
      topService: services[0]?.name || 'None',
      leastPopularService: services[services.length - 1]?.name || 'None'
    };
  }

  generateFinancialSummary(dateRange: ReportDateRange): FinancialSummaryReport {
    const filteredTransactions = this.filterTransactionsByDateRange(this.transactions, dateRange);
    const filteredExpenses = this.filterExpensesByDateRange(this.expenses, dateRange);

    // Group by month
    const monthlyData = {} as Record<string, { revenue: number; expenses: number }>;
    
    filteredTransactions.forEach(t => {
      if (t.date) {
        const month = format(parseISO(t.date), 'yyyy-MM');
        if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
        monthlyData[month].revenue += t.price || 0;
      }
    });

    filteredExpenses.forEach(e => {
      if (e.date) {
        const month = format(parseISO(e.date), 'yyyy-MM');
        if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
        monthlyData[month].expenses += e.amount || 0;
      }
    });

    const revenueByMonth = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Expense categories
    const expenseStats = filteredExpenses.reduce((acc, e) => {
      const type = e.type || 'Unknown';
      if (!acc[type]) acc[type] = 0;
      acc[type] += e.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    const totalExpenseAmount = Object.values(expenseStats).reduce((sum, amount) => sum + amount, 0);
    const expenseCategories = Object.entries(expenseStats).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0
    }));

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      revenueByMonth,
      expenseCategories
    };
  }

  generateCustomerAnalytics(dateRange: ReportDateRange): CustomerAnalyticsReport {
    const filteredTransactions = this.filterTransactionsByDateRange(this.transactions, dateRange);
    
    // For this basic version, we'll treat each transaction as a customer visit
    // In a real app, you'd have customer IDs to track properly
    const totalCustomers = filteredTransactions.length;
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.price || 0), 0);
    const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Simple approximation - assume 70% are returning customers for demo
    const returningCustomers = Math.floor(totalCustomers * 0.7);
    const newCustomers = totalCustomers - returningCustomers;
    const customerRetentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      totalCustomers,
      newCustomers,
      returningCustomers,
      averageCustomerValue,
      customerRetentionRate
    };
  }

  // Detailed Reports
  generateTransactionHistory(dateRange: ReportDateRange): TransactionHistoryReport {
    const filteredTransactions = this.filterTransactionsByDateRange(this.transactions, dateRange);
    
    const transactions = filteredTransactions.map(t => ({
      id: t.id || '',
      date: t.date || '',
      service: t.style || 'Unknown',
      amount: t.price || 0,
      notes: t.notes || ''
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      transactions,
      totalCount: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }

  generateExpenseBreakdown(dateRange: ReportDateRange): ExpenseBreakdownReport {
    const filteredExpenses = this.filterExpensesByDateRange(this.expenses, dateRange);
    
    const expenses = filteredExpenses.map(e => ({
      id: e.id || '',
      date: e.date || '',
      type: e.type || 'Unknown',
      description: e.description || '',
      amount: e.amount || 0
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const byCategory = filteredExpenses.reduce((acc, e) => {
      const type = e.type || 'Unknown';
      if (!acc[type]) acc[type] = 0;
      acc[type] += e.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      expenses,
      totalCount: expenses.length,
      totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
      byCategory
    };
  }

  generateDailyOperations(dateRange: ReportDateRange): DailyOperationsReport {
    const filteredTransactions = this.filterTransactionsByDateRange(this.transactions, dateRange);
    const filteredExpenses = this.filterExpensesByDateRange(this.expenses, dateRange);

    const dailyStats = {} as Record<string, {
      transactions: number;
      revenue: number;
      expenses: number;
      customers: number;
    }>;

    // Initialize all days in range
    const days = eachDayOfInterval({
      start: parseISO(dateRange.startDate),
      end: parseISO(dateRange.endDate)
    });

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      dailyStats[dateStr] = { transactions: 0, revenue: 0, expenses: 0, customers: 0 };
    });

    // Add transaction data
    filteredTransactions.forEach(t => {
      const date = t.date;
      if (date && dailyStats[date]) {
        dailyStats[date].transactions++;
        dailyStats[date].revenue += t.price || 0;
        dailyStats[date].customers++;
      }
    });

    // Add expense data
    filteredExpenses.forEach(e => {
      const date = e.date;
      if (date && dailyStats[date]) {
        dailyStats[date].expenses += e.amount || 0;
      }
    });

    const dailyData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      transactions: stats.transactions,
      revenue: stats.revenue,
      expenses: stats.expenses,
      profit: stats.revenue - stats.expenses,
      customers: stats.customers
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      dailyData
    };
  }

  // Exception Reports
  generateHighValueTransactions(dateRange: ReportDateRange, threshold: number = 100): HighValueTransactionsReport {
    const filteredTransactions = this.filterTransactionsByDateRange(this.transactions, dateRange);
    
    const highValueTransactions = filteredTransactions
      .filter(t => (t.price || 0) >= threshold)
      .map(t => ({
        id: t.id || '',
        date: t.date || '',
        service: t.style || 'Unknown',
        amount: t.price || 0,
        notes: t.notes || ''
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      threshold,
      transactions: highValueTransactions,
      count: highValueTransactions.length,
      totalValue: highValueTransactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }

  generateExpenseAnomalies(dateRange: ReportDateRange): ExpenseAnomaliesReport {
    const filteredExpenses = this.filterExpensesByDateRange(this.expenses, dateRange);
    
    // Calculate average expense amount
    const averageExpense = filteredExpenses.length > 0 
      ? filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0) / filteredExpenses.length
      : 0;

    const anomalies = filteredExpenses
      .filter(e => (e.amount || 0) > averageExpense * 2) // More than 2x average
      .map(e => {
        const amount = e.amount || 0;
        return {
          id: e.id || '',
          date: e.date || '',
          description: e.description || '',
          amount,
          reason: `Amount is ${Math.round((amount / averageExpense) * 100)}% of average expense`,
          severity: amount > averageExpense * 5 ? 'high' as const : 
                   amount > averageExpense * 3 ? 'medium' as const : 'low' as const
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      anomalies,
      totalAnomalies: anomalies.length
    };
  }

  generateInactiveCustomers(dateRange: ReportDateRange, inactiveDays: number = 30): InactiveCustomersReport {
    // This is a simplified version - in a real app you'd track actual customers
    const today = new Date();
    const cutoffDate = new Date(today.getTime() - inactiveDays * 24 * 60 * 60 * 1000);
    
    // For demo purposes, create some mock inactive customers based on old transactions
    const oldTransactions = this.transactions.filter(t => 
      t.date && parseISO(t.date) < cutoffDate
    );

    const customers = oldTransactions.slice(0, 5).map(t => {
      const lastVisitDate = t.date ? parseISO(t.date) : new Date();
      const daysSince = differenceInDays(today, lastVisitDate);
      return {
        lastVisit: t.date || '',
        daysSinceLastVisit: daysSince,
        totalVisits: Math.floor(Math.random() * 10) + 1,
        lastService: t.style || 'Unknown',
        totalSpent: (t.price || 0) * (Math.floor(Math.random() * 5) + 1)
      };
    });

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      inactiveDays,
      customers,
      count: customers.length
    };
  }

  generateLowPerformanceServices(dateRange: ReportDateRange, threshold: number = 50): LowPerformanceServicesReport {
    const servicePerformance = this.generateServicePerformance(dateRange);
    
    const lowPerformingServices = servicePerformance.services
      .filter(s => s.totalRevenue < threshold)
      .map(s => ({
        ...s,
        performanceScore: (s.totalRevenue / threshold) * 100
      }))
      .sort((a, b) => a.performanceScore - b.performanceScore);

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      threshold,
      services: lowPerformingServices
    };
  }

  generateRevenueOutliers(dateRange: ReportDateRange): RevenueOutliersReport {
    const dailyOps = this.generateDailyOperations(dateRange);
    
    const revenues = dailyOps.dailyData.map(d => d.revenue).filter(r => r > 0);
    const averageRevenue = revenues.length > 0 ? revenues.reduce((sum, r) => sum + r, 0) / revenues.length : 0;
    const threshold = averageRevenue * 0.5; // 50% deviation threshold

    const outliers = dailyOps.dailyData
      .filter(d => Math.abs(d.revenue - averageRevenue) > threshold)
      .map(d => ({
        date: d.date,
        revenue: d.revenue,
        deviation: averageRevenue > 0 ? ((d.revenue - averageRevenue) / averageRevenue) * 100 : 0,
        type: d.revenue > averageRevenue ? 'high' as const : 'low' as const,
        transactions: d.transactions
      }))
      .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      averageDailyRevenue: averageRevenue,
      outliers
    };
  }
}