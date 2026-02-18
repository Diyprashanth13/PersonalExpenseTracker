import { Category } from './types';

const now = 1700000000000; // Fixed base timestamp for defaults

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Salary', icon: '💰', color: '#10b981', type: 'income', isDefault: true, createdAt: now, updatedAt: now },
  { id: 'cat_2', name: 'Freelance', icon: '💻', color: '#3b82f6', type: 'income', isDefault: true, createdAt: now, updatedAt: now },
  { id: 'cat_3', name: 'Food', icon: '🍔', color: '#ef4444', type: 'expense', isDefault: true, createdAt: now, updatedAt: now },
  { id: 'cat_4', name: 'Shopping', icon: '🛍️', color: '#f59e0b', type: 'expense', isDefault: true, createdAt: now, updatedAt: now },
  { id: 'cat_5', name: 'Rent', icon: '🏠', color: '#6366f1', type: 'expense', isDefault: true, createdAt: now, updatedAt: now },
  { id: 'cat_6', name: 'Transport', icon: '🚗', color: '#0ea5e9', type: 'expense', isDefault: true, createdAt: now, updatedAt: now },
  { id: 'cat_7', name: 'Entertainment', icon: '🎬', color: '#d946ef', type: 'expense', isDefault: true, createdAt: now, updatedAt: now },
  { id: 'cat_8', name: 'Health', icon: '🏥', color: '#ec4899', type: 'expense', isDefault: true, createdAt: now, updatedAt: now },
];

export const CATEGORY_PRESET_COLORS = [
  '#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#6366f1', '#0ea5e9',
  '#d946ef', '#ec4899', '#f43f5e', '#8b5cf6', '#14b8a6', '#475569'
];

export const CATEGORY_PRESET_ICONS = [
  '💰', '💻', '🍔', '🛍️', '🏠', '🚗', '🎬', '🏥', '☕', '🎁', '✈️', '🎮',
  '📚', '👗', '🥦', '🏋️', '⚡', '📱', '💳', '🛡️', '📈', '🎟️', '🍕', '🍻'
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
];