import { Category } from '../types';

export const DEFAULT_EXPENSE_CATEGORIES: (Omit<Category, 'createdAt' | 'updatedAt' | 'id'>)[] = [
    { name: "Food", type: "expense", icon: "🍔", color: "#ef4444" },
    { name: "Transport", type: "expense", icon: "🚗", color: "#0ea5e9" },
    { name: "Shopping", type: "expense", icon: "🛍️", color: "#f59e0b" },
    { name: "Entertainment", type: "expense", icon: "🎬", color: "#d946ef" },
    { name: "Bills", type: "expense", icon: "💡", color: "#6366f1" }
];

export const DEFAULT_INCOME_CATEGORIES: (Omit<Category, 'createdAt' | 'updatedAt' | 'id'>)[] = [
    { name: "Salary", type: "income", icon: "💰", color: "#10b981" },
    { name: "Business", type: "income", icon: "📈", color: "#3b82f6" },
    { name: "Freelance", type: "income", icon: "💻", color: "#8b5cf6" }
];

export const FACTORY_CATEGORIES = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INCOME_CATEGORIES
];
