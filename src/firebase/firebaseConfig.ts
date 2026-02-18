import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
import { enableIndexedDbPersistence } from 'firebase/firestore';
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('🔥 Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('🔥 Persistence failed: Browser doesn\'t support persistence');
    }
});

export const googleProvider = new GoogleAuthProvider();

console.log('🔥 Firebase: Services ready');
export default app;
