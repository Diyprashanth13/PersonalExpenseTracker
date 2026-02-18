import { Transaction, Category, UserSettings, DashboardSectionConfig } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import { dbService } from './db';
import { syncManager } from './sync';

const KEYS = {
  SETTINGS: 'fintrack_settings',
};

const DEFAULT_DASHBOARD_SECTIONS: DashboardSectionConfig[] = [
  { id: 'stats', label: 'Summary Cards', isEnabled: true },
  { id: 'chart', label: 'Cash Flow Chart', isEnabled: true },
  { id: 'ledger', label: 'Recent Ledger', isEnabled: true },
];

export const StorageService = {
  async getTransactions(): Promise<Transaction[]> {
    return dbService.getAllTransactions();
  },

  async saveTransactions(transactions: Transaction[]) {
    // Note: The store usually passes the whole list, but we want to handle individual updates
    // In an offline-first app, we'd ideally save them one by one.
    // For compatibility with the current store logic, we ensure all exist in DB.
    for (const tx of transactions) {
      await dbService.saveTransaction(tx);
    }
    syncManager.sync(); // Attempt sync after save
  },

  // Added for direct store usage
  async saveTransaction(tx: Transaction) {
    await dbService.saveTransaction(tx);
    syncManager.sync();
  },

  async deleteTransaction(id: string) {
    await dbService.deleteTransaction(id);
    // Ideally notify backend of deletion too
  },

  async getCategories(): Promise<Category[]> {
    const cats = await dbService.getAllCategories();
    return cats.length > 0 ? cats : DEFAULT_CATEGORIES;
  },

  async saveCategories(categories: Category[]) {
    for (const cat of categories) {
      await dbService.saveCategory(cat);
    }
    syncManager.sync();
  },

  async saveCategory(cat: Category) {
    await dbService.saveCategory(cat);
    syncManager.sync();
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
    window.location.reload();
  }
};