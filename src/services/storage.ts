import { Transaction, Category, UserSettings, DashboardSectionConfig } from '../types';
import { dbService } from './db';
import { syncManager } from './sync';

const KEYS = {
  SETTINGS: 'fintrack_settings',
};

const OLD_KEYS = {
  TRANSACTIONS: 'fintrack_transactions',
  CATEGORIES: 'fintrack_categories',
};

const DEFAULT_DASHBOARD_SECTIONS: DashboardSectionConfig[] = [
  { id: 'stats', label: 'Summary Cards', isEnabled: true },
  { id: 'chart', label: 'Cash Flow Chart', isEnabled: true },
  { id: 'ledger', label: 'Recent Ledger', isEnabled: true },
];

let isSeeding = false;

export const StorageService = {
  async getTransactions(userId: string): Promise<Transaction[]> {
    let transactions = await dbService.getAllTransactions(userId);

    // Migration: Check if we have legacy data in localStorage
    const legacyData = localStorage.getItem(OLD_KEYS.TRANSACTIONS);
    if (transactions.length === 0 && legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Migrating transactions from localStorage to IndexedDB...', parsed.length);
          for (const tx of parsed) {
            // Mark migrated data as pending sync so it gets backed up
            await dbService.saveTransaction(tx, userId, 'pending');
          }
          // Refresh from DB
          transactions = await dbService.getAllTransactions(userId);
          // Clear legacy data to prevent re-migration
          localStorage.removeItem(OLD_KEYS.TRANSACTIONS);
        }
      } catch (e) {
        console.error('Failed to migrate transactions', e);
      }
    }

    return transactions;
  },

  async saveTransactions(transactions: Transaction[], userId: string) {
    for (const tx of transactions) {
      await dbService.saveTransaction(tx, userId);
    }
  },

  async saveTransaction(tx: Transaction, userId: string) {
    await dbService.saveTransaction(tx, userId);
  },

  async deleteTransaction(id: string) {
    await dbService.deleteTransaction(id);
  },

  async getCategories(userId: string): Promise<Category[]> {
    let cats = await dbService.getAllCategories(userId);

    // Migration: Check if we have legacy data in localStorage
    const legacyData = localStorage.getItem(OLD_KEYS.CATEGORIES);
    if (cats.length === 0 && legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Migrating categories from localStorage to IndexedDB...', parsed.length);
          for (const cat of parsed) {
            await dbService.saveCategory(cat, userId, 'pending');
          }
          cats = await dbService.getAllCategories(userId);
          localStorage.removeItem(OLD_KEYS.CATEGORIES);
        }
      } catch (e) {
        console.error('Failed to migrate categories', e);
      }
    }

    return cats;
  },

  async seedFactoryDefaults(userId: string): Promise<Category[]> {
    const { FACTORY_CATEGORIES } = await import('../utils/factoryDefaults');
    console.log('🌱 Storage: Seeding factory defaults for', userId);
    const seededCats: Category[] = [];
    for (const factoryCat of FACTORY_CATEGORIES) {
      const cat: Category = {
        ...factoryCat,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await dbService.saveCategory(cat, userId, 'pending');
      seededCats.push(cat);
    }
    return seededCats;
  },

  async saveCategories(categories: Category[], userId: string) {
    for (const cat of categories) {
      await dbService.saveCategory(cat, userId);
    }
  },

  async saveCategory(cat: Category, userId: string) {
    await dbService.saveCategory(cat, userId);
  },

  async deleteCategory(id: string) {
    await dbService.deleteCategory(id);
  },

  getSettings(): UserSettings {
    const data = localStorage.getItem(KEYS.SETTINGS);
    const settings = data ? JSON.parse(data) : {
      currency: 'INR',
      theme: 'light',
      hasCompletedOnboarding: false,
      dashboardSections: DEFAULT_DASHBOARD_SECTIONS,
    };

    if (!settings.dashboardSections) {
      settings.dashboardSections = DEFAULT_DASHBOARD_SECTIONS;
    }

    return settings;
  },

  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async clearAll() {
    localStorage.removeItem(KEYS.SETTINGS);
    await dbService.clearAll();
  }
};