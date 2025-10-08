import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Expense, Settings } from '@/types/index';
import { MonthlyAnalytics, KPICard } from '@/types/index';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';


interface SupabaseStore {
  transactions: Transaction[];
  expenses: Expense[];
  settings: Settings;
  currentMonth: string;
  isLoading: boolean;

  // Actions
  loadData: () => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addExpense: (data: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  setCurrentMonth: (month: string) => void;

  // Analytics
  getMonthlyAnalytics: (month: string) => MonthlyAnalytics;
  getKPIData: () => KPICard[];
}

export const useSupabaseStore = create<SupabaseStore>((set, get) => ({
  transactions: [],
  expenses: [],
  settings: {
    currency: 'USD',
    defaultStyles: [
      'Haircut', 'Fade', 'Line-up', 'Buzz Cut', 'Scissor Cut', 'Beard Trim',
      'Shave', 'Blowout', 'Hair Wash', 'Color', 'Highlights', 'Perm',
      'Straightening', 'Braiding', 'Styling', 'Deep Conditioning'
    ]
  },
  currentMonth: format(new Date(), 'yyyy-MM'),
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }
      const userId = user.id;

      // Load transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Load expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Load settings
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (settingsError) throw settingsError;

      set({
        transactions: transactions?.map(t => ({
          id: t.id,
          date: t.date,
          style: t.style,
          price: parseFloat(t.price.toString()),
          notes: t.notes || undefined
        })) || [],
        expenses: expenses?.map(e => ({
          id: e.id,
          date: e.date,
          type: e.type as 'Fixed' | 'Short-term',
          description: e.description,
          amount: parseFloat(e.amount.toString())
        })) || [],
        settings: settings ? {
          currency: settings.currency,
          defaultStyles: settings.default_styles
        } : get().settings
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('User not authenticated');
    const userId = user.id;
    
    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        date: data.date,
        style: data.style,
        price: data.price,
        notes: data.notes
      })
      .select()
      .single();

    if (error) throw error;

    const transaction: Transaction = {
      id: newTransaction.id,
      date: newTransaction.date,
      style: newTransaction.style,
      price: parseFloat(newTransaction.price.toString()),
      notes: newTransaction.notes || undefined
    };

    set(state => ({
      transactions: [transaction, ...state.transactions]
    }));
  },

  updateTransaction: async (id, data) => {
    const { error } = await supabase
      .from('transactions')
      .update({
        ...(data.date && { date: data.date }),
        ...(data.style && { style: data.style }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.notes !== undefined && { notes: data.notes })
      })
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id ? { ...t, ...data } : t
      )
    }));
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      transactions: state.transactions.filter(t => t.id !== id)
    }));
  },

  addExpense: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('User not authenticated');
    const userId = user.id;
    
    const { data: newExpense, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        date: data.date,
        type: data.type,
        description: data.description,
        amount: data.amount
      })
      .select()
      .single();

    if (error) throw error;

    const expense: Expense = {
      id: newExpense.id,
      date: newExpense.date,
      type: newExpense.type as 'Fixed' | 'Short-term',
      description: newExpense.description,
      amount: parseFloat(newExpense.amount.toString())
    };

    set(state => ({
      expenses: [expense, ...state.expenses]
    }));
  },

  updateExpense: async (id, data) => {
    const { error } = await supabase
      .from('expenses')
      .update({
        ...(data.date && { date: data.date }),
        ...(data.type && { type: data.type }),
        ...(data.description && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount })
      })
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === id ? { ...e, ...data } : e
      )
    }));
  },

  deleteExpense: async (id) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      expenses: state.expenses.filter(e => e.id !== id)
    }));
  },

  updateSettings: async (newSettings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('User not authenticated');
    const userId = user.id;
    const currentSettings = get().settings;
    
    const { error } = await supabase
      .from('settings')
      .update({
        currency: newSettings.currency || currentSettings.currency,
        default_styles: newSettings.defaultStyles || currentSettings.defaultStyles
      })
      .eq('user_id', userId);

    if (error) throw error;

    set(state => ({
      settings: { 
        ...state.settings, 
        currency: newSettings.currency || state.settings.currency,
        defaultStyles: newSettings.defaultStyles || state.settings.defaultStyles
      }
    }));
  },

  setCurrentMonth: (month) => set({ currentMonth: month }),

  getMonthlyAnalytics: (month) => {
    const state = get();
    const monthStart = startOfMonth(new Date(month + '-01'));
    const monthEnd = endOfMonth(monthStart);
    
    const monthTransactions = state.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });
    
    const monthExpenses = state.expenses.filter(e => {
      const date = new Date(e.date);
      return date >= monthStart && date <= monthEnd;
    });

    const totalIncome = monthTransactions.reduce((sum, t) => sum + t.price, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const totalCustomers = monthTransactions.length;

    // Calculate growth rates (simplified)
    const profitGrowth = Math.random() * 20 - 10; // Placeholder
    const customerGrowth = Math.random() * 30 - 15; // Placeholder

    // Find top service
    const serviceCount = monthTransactions.reduce((acc, t) => {
      acc[t.style] = (acc[t.style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topService = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      month,
      totalIncome,
      totalExpenses,
      netProfit,
      totalCustomers,
      customerGrowth,
      profitGrowth,
      topService,
      transactions: monthTransactions,
      expenses: monthExpenses
    };
  },

  getKPIData: () => {
    const state = get();
    const analytics = state.getMonthlyAnalytics(state.currentMonth);
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: state.settings.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };
    
    return [
      {
        title: 'Monthly Revenue',
        value: formatCurrency(analytics.totalIncome),
        change: {
          value: analytics.profitGrowth,
          type: analytics.profitGrowth >= 0 ? 'positive' : 'negative',
          label: 'vs last month'
        },
        icon: DollarSign
      },
      {
        title: 'Monthly Expenses',
        value: formatCurrency(analytics.totalExpenses),
        change: {
          value: analytics.profitGrowth,
          type: analytics.profitGrowth <= 0 ? 'positive' : 'negative',
          label: 'vs last month'
        },
        icon: CreditCard
      },
      {
        title: 'Net Profit',
        value: formatCurrency(analytics.netProfit),
        change: {
          value: analytics.profitGrowth,
          type: analytics.netProfit >= 0 ? 'positive' : 'negative',
          label: 'profit margin'
        },
        icon: TrendingUp
      },
      {
        title: 'Total Customers',
        value: analytics.totalCustomers.toString(),
        change: {
          value: analytics.customerGrowth,
          type: analytics.customerGrowth >= 0 ? 'positive' : 'negative',
          label: 'vs last month'
        },
        icon: Users
      }
    ];
  }
}));