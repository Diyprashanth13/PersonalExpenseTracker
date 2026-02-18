import { openDB, IDBPDatabase } from 'idb';
import { Transaction, Category } from '../types';

const DB_NAME = 'fintrack_db';
const DB_VERSION = 1;

export interface SyncableTransaction extends Transaction {
    syncStatus: 'synced' | 'pending';
    lastUpdated: number;
}

export interface SyncableCategory extends Category {
    syncStatus: 'synced' | 'pending';
    lastUpdated: number;
}

class DatabaseService {
    private dbPromise: Promise<IDBPDatabase>;

    constructor() {
        this.dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('transactions')) {
                    db.createObjectStore('transactions', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('categories')) {
                    db.createObjectStore('categories', { keyPath: 'id' });
                }
            },
        });
    }

    async getAllTransactions(): Promise<SyncableTransaction[]> {
        const db = await this.dbPromise;
        return db.getAll('transactions');
    }

    async saveTransaction(tx: Transaction, syncStatus: 'synced' | 'pending' = 'pending'): Promise<void> {
        const db = await this.dbPromise;
        const syncableTx: SyncableTransaction = {
            ...tx,
            syncStatus,
            lastUpdated: Date.now(),
        };
        await db.put('transactions', syncableTx);
    }

    async deleteTransaction(id: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete('transactions', id);
    }

    async getAllCategories(): Promise<SyncableCategory[]> {
        const db = await this.dbPromise;
        return db.getAll('categories');
    }

    async saveCategory(cat: Category, syncStatus: 'synced' | 'pending' = 'pending'): Promise<void> {
        const db = await this.dbPromise;
        const syncableCat: SyncableCategory = {
            ...cat,
            syncStatus,
            lastUpdated: Date.now(),
        };
        await db.put('categories', syncableCat);
    }

    async deleteCategory(id: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete('categories', id);
    }

    async getPendingTransactions(): Promise<SyncableTransaction[]> {
        const transactions = await this.getAllTransactions();
        return transactions.filter(t => t.syncStatus === 'pending');
    }

    async getPendingCategories(): Promise<SyncableCategory[]> {
        const categories = await this.getAllCategories();
        return categories.filter(c => c.syncStatus === 'pending');
    }

    async markAsSynced(storeName: 'transactions' | 'categories', id: string): Promise<void> {
        const db = await this.dbPromise;
        const item = await db.get(storeName, id);
        if (item) {
            item.syncStatus = 'synced';
            await db.put(storeName, item);
        }
    }

    async clearAll(): Promise<void> {
        const db = await this.dbPromise;
        await db.clear('transactions');
        await db.clear('categories');
    }
}

export const dbService = new DatabaseService();
