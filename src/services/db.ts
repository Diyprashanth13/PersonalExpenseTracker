import { openDB, IDBPDatabase } from 'idb';
import { Transaction, Category } from '../types';

const DB_NAME = 'fintrack_db';
const DB_VERSION = 3;

export interface SyncableTransaction extends Transaction {
    userId: string;
    syncStatus: 'synced' | 'pending';
}

export interface SyncableCategory extends Category {
    userId: string;
    syncStatus: 'synced' | 'pending';
}

class DatabaseService {
    private dbPromise: Promise<IDBPDatabase>;

    constructor() {
        console.log('💾 DB: Initializing IndexedDB v' + DB_VERSION);
        this.dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`💾 DB: Upgrading from v${oldVersion} to v${newVersion}`);
                try {
                    if (!db.objectStoreNames.contains('transactions')) {
                        console.log('💾 DB: Creating transactions store');
                        db.createObjectStore('transactions', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('categories')) {
                        console.log('💾 DB: Creating categories store');
                        db.createObjectStore('categories', { keyPath: 'id' });
                    }

                    const txStore = transaction.objectStore('transactions');
                    if (!txStore.indexNames.contains('userId')) {
                        console.log('💾 DB: Creating userId index on transactions');
                        txStore.createIndex('userId', 'userId');
                    }

                    const catStore = transaction.objectStore('categories');
                    if (!catStore.indexNames.contains('userId')) {
                        console.log('💾 DB: Creating userId index on categories');
                        catStore.createIndex('userId', 'userId');
                    }
                } catch (err) {
                    console.error('💾 DB: Upgrade failed!', err);
                }
            },
            blocked() {
                console.warn('💾 DB: Database is BLOCKED. Please close other tabs of this app.');
            },
        });

        this.dbPromise.then(() => console.log('💾 DB: Database ready'))
            .catch(err => console.error('💾 DB: Database failed to open', err));
    }

    async getAllTransactions(userId: string): Promise<SyncableTransaction[]> {
        const db = await this.dbPromise;
        const txs = await db.getAllFromIndex('transactions', 'userId', userId);
        return txs as SyncableTransaction[];
    }

    async saveTransaction(tx: Transaction, userId: string, syncStatus: 'synced' | 'pending' = 'pending'): Promise<void> {
        const db = await this.dbPromise;
        const now = Date.now();
        const syncableTx: SyncableTransaction = {
            ...tx,
            userId,
            syncStatus,
            createdAt: tx.createdAt || now,
            updatedAt: now,
        };
        await db.put('transactions', syncableTx);
    }

    // Bulk Save for Performance
    async bulkSaveSyncableItems(storeName: 'transactions' | 'categories', items: (SyncableTransaction | SyncableCategory)[]): Promise<void> {
        if (items.length === 0) return;
        const db = await this.dbPromise;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        await Promise.all([
            ...items.map(item => store.put(item)),
            tx.done
        ]);
    }

    async saveSyncableTransaction(tx: SyncableTransaction): Promise<void> {
        const db = await this.dbPromise;
        await db.put('transactions', tx);
    }

    async deleteTransaction(id: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete('transactions', id);
    }

    async getAllCategories(userId: string): Promise<SyncableCategory[]> {
        const db = await this.dbPromise;
        const cats = await db.getAllFromIndex('categories', 'userId', userId);
        return cats as SyncableCategory[];
    }

    async saveCategory(cat: Category, userId: string, syncStatus: 'synced' | 'pending' = 'pending'): Promise<void> {
        const db = await this.dbPromise;
        const now = Date.now();
        const syncableCat: SyncableCategory = {
            ...cat,
            userId,
            syncStatus,
            createdAt: cat.createdAt || now,
            updatedAt: now,
        };
        await db.put('categories', syncableCat);
    }

    async saveSyncableCategory(cat: SyncableCategory): Promise<void> {
        const db = await this.dbPromise;
        await db.put('categories', cat);
    }

    async deleteCategory(id: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete('categories', id);
    }

    async getPendingTransactions(userId: string): Promise<SyncableTransaction[]> {
        const transactions = await this.getAllTransactions(userId);
        return transactions.filter(t => t.syncStatus === 'pending');
    }

    async getPendingCategories(userId: string): Promise<SyncableCategory[]> {
        const categories = await this.getAllCategories(userId);
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

    // Bulk Mark As Synced
    async bulkMarkAsSynced(storeName: 'transactions' | 'categories', ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        const db = await this.dbPromise;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        for (const id of ids) {
            const item = await store.get(id);
            if (item) {
                item.syncStatus = 'synced';
                await store.put(item);
            }
        }
        await tx.done;
    }

    async clearAll(): Promise<void> {
        const db = await this.dbPromise;
        await db.clear('transactions');
        await db.clear('categories');
    }
}

export const dbService = new DatabaseService();
