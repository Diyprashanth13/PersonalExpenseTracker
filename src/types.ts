export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
}

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    categoryId: string;
    date: string; // ISO String
    notes?: string;
}

export interface DashboardSectionConfig {
    id: 'stats' | 'chart' | 'ledger';
    label: string;
    isEnabled: boolean;
}

export interface UserSettings {
    currency: string;
    theme: 'light' | 'dark';
    hasCompletedOnboarding: boolean;
    dashboardSections: DashboardSectionConfig[];
}

export interface DailySpending {
    date: string;
    amount: number;
}

export interface FilterState {
    type: 'all' | 'income' | 'expense';
    categories: string[];
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
}
