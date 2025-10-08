// IndexedDB utilities for offline storage
import { openDB, type IDBPDatabase } from 'idb';
import { Transaction, Expense, Settings } from '@/types';

const DB_NAME = 'BarbershopTracker';
const DB_VERSION = 1;

// Store names
const STORES = {
  TRANSACTIONS: 'transactions',
  EXPENSES: 'expenses',
  SETTINGS: 'settings',
} as const;

interface BarbershopDB {
  transactions: {
    key: string;
    value: Transaction;
    indexes: { date: string };
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: { date: string };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

let dbPromise: Promise<IDBPDatabase<BarbershopDB>>;

/**
 * Initialize IndexedDB database
 */
export const initDB = (): Promise<IDBPDatabase<BarbershopDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<BarbershopDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create transactions store
        if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
          const transactionStore = db.createObjectStore(STORES.TRANSACTIONS, {
            keyPath: 'id',
          });
          transactionStore.createIndex('date', 'date');
        }

        // Create expenses store
        if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
          const expenseStore = db.createObjectStore(STORES.EXPENSES, {
            keyPath: 'id',
          });
          expenseStore.createIndex('date', 'date');
        }

        // Create settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, {
            keyPath: 'id',
          });
        }
      },
    });
  }
  return dbPromise;
};

// Transaction operations
export const transactionDB = {
  async add(transaction: Transaction): Promise<void> {
    const db = await initDB();
    await db.add(STORES.TRANSACTIONS, transaction);
  },

  async getAll(): Promise<Transaction[]> {
    const db = await initDB();
    return db.getAll(STORES.TRANSACTIONS);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const db = await initDB();
    const tx = db.transaction(STORES.TRANSACTIONS, 'readonly');
    const index = tx.store.index('date');
    const range = IDBKeyRange.bound(startDate, endDate);
    return index.getAll(range);
  },

  async update(transaction: Transaction): Promise<void> {
    const db = await initDB();
    await db.put(STORES.TRANSACTIONS, transaction);
  },

  async delete(id: string): Promise<void> {
    const db = await initDB();
    await db.delete(STORES.TRANSACTIONS, id);
  },
};

// Expense operations
export const expenseDB = {
  async add(expense: Expense): Promise<void> {
    const db = await initDB();
    await db.add(STORES.EXPENSES, expense);
  },

  async getAll(): Promise<Expense[]> {
    const db = await initDB();
    return db.getAll(STORES.EXPENSES);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const db = await initDB();
    const tx = db.transaction(STORES.EXPENSES, 'readonly');
    const index = tx.store.index('date');
    const range = IDBKeyRange.bound(startDate, endDate);
    return index.getAll(range);
  },

  async update(expense: Expense): Promise<void> {
    const db = await initDB();
    await db.put(STORES.EXPENSES, expense);
  },

  async delete(id: string): Promise<void> {
    const db = await initDB();
    await db.delete(STORES.EXPENSES, id);
  },
};

// Settings operations
export const settingsDB = {
  async get(): Promise<Settings | undefined> {
    const db = await initDB();
    return db.get(STORES.SETTINGS, 'app-settings');
  },

  async set(settings: Settings): Promise<void> {
    const db = await initDB();
    await db.put(STORES.SETTINGS, { id: 'app-settings', ...settings });
  },
};

// Utility functions
export const dbUtils = {
  /**
   * Export all data as JSON for backup
   */
  async exportData() {
    const [transactions, expenses, settings] = await Promise.all([
      transactionDB.getAll(),
      expenseDB.getAll(),
      settingsDB.get(),
    ]);

    return {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      data: {
        transactions,
        expenses,
        settings,
      },
    };
  },

  /**
   * Import data from JSON backup
   */
  async importData(data: any): Promise<void> {
    const db = await initDB();
    const tx = db.transaction([STORES.TRANSACTIONS, STORES.EXPENSES, STORES.SETTINGS], 'readwrite');

    // Import transactions
    if (data.data?.transactions) {
      for (const transaction of data.data.transactions) {
        await tx.objectStore(STORES.TRANSACTIONS).put(transaction);
      }
    }

    // Import expenses
    if (data.data?.expenses) {
      for (const expense of data.data.expenses) {
        await tx.objectStore(STORES.EXPENSES).put(expense);
      }
    }

    // Import settings
    if (data.data?.settings) {
      await tx.objectStore(STORES.SETTINGS).put({ id: 'app-settings', ...data.data.settings });
    }

    await tx.done;
  },

  /**
   * Clear all data (for dev/testing)
   */
  async clearAll(): Promise<void> {
    const db = await initDB();
    const tx = db.transaction([STORES.TRANSACTIONS, STORES.EXPENSES, STORES.SETTINGS], 'readwrite');
    
    await Promise.all([
      tx.objectStore(STORES.TRANSACTIONS).clear(),
      tx.objectStore(STORES.EXPENSES).clear(),
      tx.objectStore(STORES.SETTINGS).clear(),
    ]);

    await tx.done;
  },
};