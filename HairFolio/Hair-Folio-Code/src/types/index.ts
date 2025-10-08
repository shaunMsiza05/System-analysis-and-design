// Core data types for Barbershop Financial Tracker
import { z } from 'zod';

// Transaction (Income) Schema
export const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date string
  style: z.string().min(1, 'Service/style is required'),
  price: z.number().min(0, 'Price must be positive'),
  notes: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Expense Schema
export const ExpenseSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date string
  type: z.enum(['Fixed', 'Short-term']),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be positive'),
});

export type Expense = z.infer<typeof ExpenseSchema>;

// Settings Schema
export const SettingsSchema = z.object({
  currency: z.string().default('USD'),
  defaultStyles: z.array(z.string()).default([
    'Haircut',
    'Fade',
    'Line-up',
    'Buzz Cut',
    'Scissor Cut',
    'Beard Trim',
    'Shave',
    'Blowout',
    'Hair Wash',
    'Color',
    'Highlights',
    'Perm',
    'Straightening',
    'Braiding',
    'Styling',
    'Deep Conditioning',
  ]),
});

export type Settings = z.infer<typeof SettingsSchema>;

// Analytics types
export interface MonthlyAnalytics {
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalCustomers: number;
  customerGrowth: number; // percentage
  profitGrowth: number; // percentage
  topService: string;
  transactions: Transaction[];
  expenses: Expense[];
}

export interface KPICard {
  title: string;
  value: string;
  change?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
    label: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
}

// Form types
export type TransactionFormData = Omit<Transaction, 'id'>;
export type ExpenseFormData = Omit<Expense, 'id'>;

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}