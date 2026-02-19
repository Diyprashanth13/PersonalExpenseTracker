import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

console.log('🔥 Firebase: Initializing...');
const app = initializeApp(firebaseConfig);

// Auth — persistence is set in auth.ts via setPersistence() before every login action.
// Setting it here too (at module load) would be a fire-and-forget race; auth.ts handles it properly.
export const auth = getAuth(app);

// Firestore with proper IndexedDB persistence (replaces deprecated enableIndexedDbPersistence).
// persistentLocalCache sets up IndexedDB-backed offline cache in modular SDK v9.6+.
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
    }),
});

export const googleProvider = new GoogleAuthProvider();

console.log('🔥 Firebase: Services ready');
export default app;
