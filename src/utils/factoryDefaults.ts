import { Category } from '../types';

export const FACTORY_CATEGORIES: Category[] = [
    { id: 'cat_food', name: 'Food', icon: '🍔', color: '#ef4444', type: 'expense' },
    { id: 'cat_shopping', name: 'Shopping', icon: '🛍️', color: '#f59e0b', type: 'expense' },
    { id: 'cat_rent', name: 'Rent', icon: '🏠', color: '#6366f1', type: 'expense' },
    { id: 'cat_transport', name: 'Transport', icon: '🚗', color: '#0ea5e9', type: 'expense' },
    { id: 'cat_entertainment', name: 'Entertainment', icon: '🎬', color: '#d946ef', type: 'expense' },
    { id: 'cat_health', name: 'Health', icon: '🏥', color: '#ec4899', type: 'expense' },
    { id: 'cat_salary', name: 'Salary', icon: '💰', color: '#10b981', type: 'income' },
    { id: 'cat_freelance', name: 'Freelance', icon: '💻', color: '#3b82f6', type: 'income' },
];
