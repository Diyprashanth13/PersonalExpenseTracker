import { create } from 'zustand';
import { UserSettings } from '../types';
import { StorageService } from '../services/storage';

interface FinanceState {
    settings: UserSettings;
    loading: boolean;
    currentUserId: string | null;

    // Actions
    setUserId: (userId: string) => void;
    updateSettings: (newSettings: Partial<UserSettings>) => void;
    resetApplication: () => Promise<void>;
    clearAllData: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    settings: StorageService.getSettings(),
    loading: false,
    currentUserId: null,

    setUserId: (userId: string) => set({ currentUserId: userId }),

    resetApplication: async (userId?: string) => {
        console.log('⚠️ Store: Application reset requested');
        if (userId) {
            await StorageService.resetApplication(userId);
        } else {
            await StorageService.clearAll();
        }
        localStorage.clear();
        set({ settings: StorageService.getSettings() });
    },

    clearAllData: async () => {
        await StorageService.clearAll();
    },

    updateSettings: (newSettings: Partial<UserSettings>) => {
        set(state => {
            const nextSettings = { ...state.settings, ...newSettings };
            StorageService.saveSettings(nextSettings);
            return { settings: nextSettings };
        });
    }
}));
