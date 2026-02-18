import { dbService, SyncableTransaction, SyncableCategory } from './db';

// Mock API endpoints - in a real app, these would be your backend URLs
const API_ENDPOINTS = {
    SYNC_TRANSACTIONS: '/api/sync/transactions',
    SYNC_CATEGORIES: '/api/sync/categories',
};

class SyncManager {
    private isSyncing = false;

    constructor() {
        // Listen for online events to trigger automatic sync
        window.addEventListener('online', () => this.sync());

        // Periodically check for sync if browser supports background sync
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            // Background sync will be handled by the Service Worker
        }
    }

    public async sync(): Promise<void> {
        if (this.isSyncing || !navigator.onLine) return;

        this.isSyncing = true;
        console.log('🔄 Starting background sync...');

        try {
            await Promise.all([
                this.syncTransactions(),
                this.syncCategories()
            ]);
            console.log('✅ Sync completed successfully');
        } catch (error) {
            console.error('❌ Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    private async syncTransactions(): Promise<void> {
        const pending = await dbService.getPendingTransactions();
        if (pending.length === 0) return;

        for (const tx of pending) {
            try {
                await this.uploadTransaction(tx);
                await dbService.markAsSynced('transactions', tx.id);
            } catch (error) {
                console.warn(`Failed to sync transaction ${tx.id}, will retry later.`);
            }
        }
    }

    private async syncCategories(): Promise<void> {
        const pending = await dbService.getPendingCategories();
        if (pending.length === 0) return;

        for (const cat of pending) {
            try {
                await this.uploadCategory(cat);
                await dbService.markAsSynced('categories', cat.id);
            } catch (error) {
                console.warn(`Failed to sync category ${cat.id}, will retry later.`);
            }
        }
    }

    // Example API calls - Replace with real fetch/axios calls to your backend
    private async uploadTransaction(tx: SyncableTransaction): Promise<void> {
        // This is where you would call your API
        // const response = await fetch(API_ENDPOINTS.SYNC_TRANSACTIONS, {
        //   method: 'POST',
        //   body: JSON.stringify(tx),
        //   headers: { 'Content-Type': 'application/json' }
        // });
        // if (!response.ok) throw new Error('Upload failed');

        // Simulate API delay and success
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Uploaded transaction: ${tx.id}`);
    }

    private async uploadCategory(cat: SyncableCategory): Promise<void> {
        // Simulate API delay and success
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log(`Uploaded category: ${cat.id}`);
    }

    public registerBackgroundSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                // @ts-ignore - periodicsync is still experimental in some types
                return registration.sync.register('fintrack-sync');
            }).catch(err => console.error('Background sync registration failed:', err));
        }
    }
}

export const syncManager = new SyncManager();
