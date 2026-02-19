import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    User
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    writeBatch,
    collection
} from 'firebase/firestore';
import { auth, googleProvider, db } from './firebaseConfig';
import { FACTORY_CATEGORIES } from '../utils/factoryDefaults';

// Configure Google Provider — always prompt account selection
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth };

// --- Environment helpers ---
export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
export const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

// --- Per-user initialization guard ---
// Using a Set keyed by uid prevents the bug where the old module-level boolean
// `isInitializing` was never reset, silently blocking initialization on re-login.
const initializedUids = new Set<string>();

/**
 * Creates user profile + seeds default categories on first login.
 * Called only from AuthContext — never from UI components.
 * Safe to call multiple times for the same user.
 */
export const initializeUserAccount = async (user: User): Promise<void> => {
    if (initializedUids.has(user.uid)) {
        console.log('👤 Auth: Already initialized this session — skipping seed for', user.uid);
        return;
    }

    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        // First login — create the profile document
        if (!userDoc.exists()) {
            console.log('👤 Auth: New user — creating profile for', user.email);
            await setDoc(userRef, {
                email: user.email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                currency: 'INR',
                theme: 'light',
                hasCompletedOnboarding: false,
                hasInitializedDefaults: false,
            });
            console.log('✅ Auth: Profile created');
        }

        // Re-read to check initialization status
        const freshDoc = await getDoc(userRef);
        const alreadyInitialized = freshDoc.data()?.hasInitializedDefaults === true;

        if (!alreadyInitialized) {
            console.log('🌱 Auth: Creating default categories...');
            const batch = writeBatch(db);

            FACTORY_CATEGORIES.forEach((cat) => {
                const catId = `cat_${cat.name.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 5)}`;
                const ref = doc(collection(db, 'users', user.uid, 'categories'), catId);
                batch.set(ref, {
                    ...cat,
                    id: catId,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            });

            batch.update(userRef, {
                hasInitializedDefaults: true,
                updatedAt: serverTimestamp(),
            });

            await batch.commit();
            console.log('✅ Auth: Default categories created successfully');
        } else {
            console.log('👤 Auth: Already initialized — skipping seed');
        }

        // Mark this uid as initialized for the lifetime of this page session
        initializedUids.add(user.uid);
    } catch (error) {
        console.error('❌ Auth: initializeUserAccount failed', error);
        throw error;
    }
};

// --- Auth actions ---
// PART 4 — Ensure persistence is set BEFORE every login so it takes effect
// even if the config module hasn't resolved it yet.
const ensurePersistence = async () => {
    await setPersistence(auth, browserLocalPersistence);
};

export const loginWithEmail = async (email: string, pass: string) => {
    await ensurePersistence();
    return signInWithEmailAndPassword(auth, email, pass);
};

export const registerWithEmail = async (email: string, pass: string) => {
    await ensurePersistence();
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await initializeUserAccount(cred.user);
    return cred;
};

/**
 * PART 1 — Mobile/Standalone: redirect. Desktop: popup.
 * Does NOT navigate — navigation is driven purely by onAuthStateChanged in AuthContext.
 */
export const loginWithGoogle = async () => {
    await ensurePersistence();
    if (isMobile || isStandalone) {
        console.log('📱 Auth: Mobile/Standalone — using redirect');
        // Returns null; page will unload and return via getRedirectResult
        return signInWithRedirect(auth, googleProvider);
    } else {
        console.log('💻 Auth: Desktop — using popup');
        const result = await signInWithPopup(auth, googleProvider);
        return result;
    }
};

/**
 * PART 2 — Must be called once on app start to capture any pending redirect result.
 * Called from AuthContext before the auth state listener is attached.
 */
export const handleRedirectResult = () => getRedirectResult(auth);

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);

export const subscribeToAuthChanges = (cb: (user: User | null) => void) =>
    onAuthStateChanged(auth, cb);
