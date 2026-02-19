import { Transaction, Category, UserSettings, DashboardSectionConfig } from '../types';
import { dbService } from './db';

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
  async resetApplication(userId: string) {
    console.log('🧹 Storage: Resetting application data for', userId);

    // 1. Clear IndexedDB
    await dbService.clearAll();

    // 2. Clear Settings
    localStorage.removeItem(KEYS.SETTINGS);

    // 3. Clear Firestore
    const { db } = await import('../firebase/firebaseConfig');
    const { collection, getDocs, deleteDoc, doc, updateDoc } = await import('firebase/firestore');

    const txs = await getDocs(collection(db, 'users', userId, 'transactions'));
    const cats = await getDocs(collection(db, 'users', userId, 'categories'));

    await Promise.all([
      ...txs.docs.map(d => deleteDoc(d.ref)),
      ...cats.docs.map(d => deleteDoc(d.ref))
    ]);

    // 4. Mark as not initialized to trigger re-seeding
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      hasInitializedDefaults: false
    });

    // 5. Re-trigger initialization using the architecturally defined method
    const { initializeUserAccount, auth } = await import('../firebase/auth');
    if (auth.currentUser) {
      await initializeUserAccount(auth.currentUser);
    }
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