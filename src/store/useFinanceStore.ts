import { create } from 'zustand';
import { Transaction, Category, UserSettings } from '../types';
import { StorageService } from '../services/storage';

interface FinanceState {
    transactions: Transaction[];
    categories: Category[];
    settings: UserSettings;
    loading: boolean;

    // Actions
    fetchData: () => Promise<void>;
    saveTransaction: (tx: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    saveCategory: (cat: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateSettings: (newSettings: Partial<UserSettings>) => void;
    clearAllData: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    transactions: [],
    categories: [],
    settings: StorageService.getSettings(),
    loading: true,

    fetchData: async () => {
        const transactions = await StorageService.getTransactions();
        const categories = await StorageService.getCategories();
        set({ transactions, categories, loading: false });
    },

    saveTransaction: async (tx: Transaction) => {
        await StorageService.saveTransaction(tx);
        const transactions = await StorageService.getTransactions();
        set({ transactions });
    },

    deleteTransaction: async (id: string) => {
        await StorageService.deleteTransaction(id);
        const transactions = await StorageService.getTransactions();
        set({ transactions });
    },

    saveCategory: async (cat: Category) => {
        await StorageService.saveCategory(cat);
        const categories = await StorageService.getCategories();
        set({ categories });
    },

    deleteCategory: async (id: string) => {
        await StorageService.deleteCategory(id);
        const categories = await StorageService.getCategories();
        set({ categories });
    },

    updateSettings: (newSettings: Partial<UserSettings>) => {
        set(state => {
            const nextSettings = { ...state.settings, ...newSettings };
            StorageService.saveSettings(nextSettings);
            return { settings: nextSettings };
        });
    },

    clearAllData: async () => {
        await StorageService.clearAll();
    }
}));
