// Zustand store for global state management
import { create } from 'zustand';
import { Transaction, Expense, Settings, MonthlyAnalytics } from '@/types';
import { transactionDB, expenseDB, settingsDB } from '@/lib/database';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

interface StoreState {
  // Data
  transactions: Transaction[];
  expenses: Expense[];
  settings: Settings;
  
  // UI State
  currentMonth: Date;
  isLoading: boolean;
  
  // Actions
  loadData: () => Promise<void>;
  setCurrentMonth: (month: Date) => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  
  // Analytics
  getMonthlyAnalytics: (month?: Date) => MonthlyAnalytics;
  getKPIData: () => {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalCustomers: number;
    customerGrowth: number;
    profitGrowth: number;
    topService: string;
  };
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  transactions: [],
  expenses: [],
  settings: {
    currency: 'USD',
    defaultStyles: [
      'Haircut', 'Fade', 'Line-up', 'Buzz Cut', 'Scissor Cut', 'Beard Trim', 
      'Shave', 'Blowout', 'Hair Wash', 'Color', 'Highlights', 'Perm', 
      'Straightening', 'Braiding', 'Styling', 'Deep Conditioning'
    ],
  },
  currentMonth: new Date(),
  isLoading: false,

  // Load data from IndexedDB
  loadData: async () => {
    set({ isLoading: true });
    try {
      const [transactions, expenses, settings] = await Promise.all([
        transactionDB.getAll(),
        expenseDB.getAll(),
        settingsDB.get(),
      ]);

      set({
        transactions,
        expenses,
        settings: settings || get().settings,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoading: false });
    }
  },

  setCurrentMonth: (month: Date) => {
    set({ currentMonth: month });
  },

  // Transaction actions
  addTransaction: async (transactionData) => {
    const transaction: Transaction = {
      ...transactionData,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    try {
      await transactionDB.add(transaction);
      set((state) => ({
        transactions: [...state.transactions, transaction],
      }));
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  },

  updateTransaction: async (transaction) => {
    try {
      await transactionDB.update(transaction);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transaction.id ? transaction : t
        ),
      }));
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      await transactionDB.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  },

  // Expense actions
  addExpense: async (expenseData) => {
    const expense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    try {
      await expenseDB.add(expense);
      set((state) => ({
        expenses: [...state.expenses, expense],
      }));
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    }
  },

  updateExpense: async (expense) => {
    try {
      await expenseDB.update(expense);
      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === expense.id ? expense : e
        ),
      }));
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  },

  deleteExpense: async (id) => {
    try {
      await expenseDB.delete(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  },

  // Settings actions
  updateSettings: async (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    try {
      await settingsDB.set(updatedSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  // Analytics
  getMonthlyAnalytics: (month = get().currentMonth) => {
    const { transactions, expenses } = get();
    const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
    
    // Filter data for the month
    const monthTransactions = transactions.filter(t => 
      t.date >= monthStart && t.date <= monthEnd
    );
    const monthExpenses = expenses.filter(e => 
      e.date >= monthStart && e.date <= monthEnd
    );

    // Calculate metrics
    const totalIncome = monthTransactions.reduce((sum, t) => sum + t.price, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const totalCustomers = monthTransactions.length;

    // Calculate previous month for growth
    const prevMonth = subMonths(month, 1);
    const prevMonthStart = format(startOfMonth(prevMonth), 'yyyy-MM-dd');
    const prevMonthEnd = format(endOfMonth(prevMonth), 'yyyy-MM-dd');
    
    const prevMonthTransactions = transactions.filter(t => 
      t.date >= prevMonthStart && t.date <= prevMonthEnd
    );
    const prevMonthExpenses = expenses.filter(e => 
      e.date >= prevMonthStart && e.date <= prevMonthEnd
    );

    const prevTotalCustomers = prevMonthTransactions.length;
    const prevNetProfit = prevMonthTransactions.reduce((sum, t) => sum + t.price, 0) - 
                         prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const customerGrowth = prevTotalCustomers > 0 
      ? ((totalCustomers - prevTotalCustomers) / prevTotalCustomers) * 100 
      : 0;
    const profitGrowth = prevNetProfit > 0 
      ? ((netProfit - prevNetProfit) / prevNetProfit) * 100 
      : 0;

    // Find most popular service
    const styleCount = monthTransactions.reduce((acc, t) => {
      acc[t.style] = (acc[t.style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topService = Object.entries(styleCount).reduce((top, [style, count]) => 
      count > top.count ? { style, count } : top, 
      { style: 'None', count: 0 }
    ).style;

    return {
      month: format(month, 'yyyy-MM'),
      totalIncome,
      totalExpenses,
      netProfit,
      totalCustomers,
      customerGrowth,
      profitGrowth,
      topService,
      transactions: monthTransactions,
      expenses: monthExpenses,
    };
  },

  getKPIData: () => {
    const analytics = get().getMonthlyAnalytics();
    return {
      totalIncome: analytics.totalIncome,
      totalExpenses: analytics.totalExpenses,
      netProfit: analytics.netProfit,
      totalCustomers: analytics.totalCustomers,
      customerGrowth: analytics.customerGrowth,
      profitGrowth: analytics.profitGrowth,
      topService: analytics.topService,
    };
  },
}));