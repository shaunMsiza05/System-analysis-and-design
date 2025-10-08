// Seed data generator for development and testing
import { nanoid } from 'nanoid';
import { format, subDays, subMonths } from 'date-fns';
import { Transaction, Expense } from '@/types';

const services = ['Fade', 'Line-up', 'Buzz Cut', 'Scissor Cut', 'Beard Trim', 'Shave', 'Hair Wash'];
const prices = [15, 20, 25, 30, 35, 40, 45];

const expenseTypes = ['Fixed', 'Short-term'] as const;
const expenseDescriptions = [
  'Rent', 'Utilities', 'Equipment', 'Supplies', 'Marketing', 'Insurance', 
  'Cleaning supplies', 'Hair products', 'Tools maintenance', 'License renewal'
];
const expenseAmounts = [50, 75, 100, 150, 200, 300, 500, 750, 1000];

/**
 * Generate random transactions for the last 3 months
 */
export function generateTransactions(count: number = 50): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Random date within last 3 months
    const daysAgo = Math.floor(Math.random() * 90);
    const date = format(subDays(now, daysAgo), 'yyyy-MM-dd');
    
    const transaction: Transaction = {
      id: nanoid(),
      date,
      style: services[Math.floor(Math.random() * services.length)],
      price: prices[Math.floor(Math.random() * prices.length)],
      notes: Math.random() > 0.7 ? 'Regular customer' : '',
    };

    transactions.push(transaction);
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Generate random expenses for the last 3 months
 */
export function generateExpenses(count: number = 20): Expense[] {
  const expenses: Expense[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Random date within last 3 months
    const daysAgo = Math.floor(Math.random() * 90);
    const date = format(subDays(now, daysAgo), 'yyyy-MM-dd');
    
    const expense: Expense = {
      id: nanoid(),
      date,
      type: expenseTypes[Math.floor(Math.random() * expenseTypes.length)],
      description: expenseDescriptions[Math.floor(Math.random() * expenseDescriptions.length)],
      amount: expenseAmounts[Math.floor(Math.random() * expenseAmounts.length)],
    };

    expenses.push(expense);
  }

  return expenses.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Seed the database with sample data
 */
export async function seedDatabase() {
  const { transactionDB, expenseDB } = await import('@/lib/database');
  
  try {
    // Generate and add sample transactions
    const transactions = generateTransactions(50);
    for (const transaction of transactions) {
      await transactionDB.add(transaction);
    }

    // Generate and add sample expenses
    const expenses = generateExpenses(20);
    for (const expense of expenses) {
      await expenseDB.add(expense);
    }

    console.log('✅ Sample data seeded successfully!');
    console.log(`Added ${transactions.length} transactions and ${expenses.length} expenses`);
    
    return { transactions, expenses };
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}