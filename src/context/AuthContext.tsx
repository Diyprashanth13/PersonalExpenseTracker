import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, handleRedirectResult, subscribeToAuthChanges, initializeUserAccount } from '../firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// ─── Auth State Machine ────────────────────────────────────────────────────────
// Using an explicit state machine instead of multiple booleans eliminates the race
// condition where `loading=false && user=null` flashes for a frame on redirect-back,
// causing the Router to briefly show the login screen before auth hydrates.
//
//   idle  →  loading  →  authenticated
//                     ↘  unauthenticated

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
    /** Typed auth state: use this for all render decisions instead of raw booleans. */
    status: AuthStatus;
    user: User | null;
    profile: any | null;
    /** True while the very first auth hydration is in progress. Components should
     *  block all routing decisions until this is false. */
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    status: 'idle',
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<AuthStatus>('idle');
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);

    // Use a ref for the auth unsubscribe so we can call it synchronously in the
    // cleanup function — avoids the async promise-in-cleanup bug from the old version.
    const unsubAuthRef = useRef<(() => void) | null>(null);
    const unsubProfileRef = useRef<(() => void) | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        setStatus('loading');

        const init = async () => {
            // ── Step 1: Resolve any pending OAuth redirect FIRST ─────────────────
            // On mobile/PWA, Google redirects back to the app and embeds the auth
            // credential in the URL. getRedirectResult() extracts it and creates the
            // Firebase session. This MUST happen before we attach the state listener,
            // otherwise onAuthStateChanged fires with null before the session exists.
            try {
                const result = await handleRedirectResult();
                if (result?.user) {
                    console.log('🔁 AuthContext: Redirect result captured —', result.user.email);
                } else {
                    console.log('ℹ️ AuthContext: No pending redirect result.');
                }
            } catch (err: any) {
                // auth/null-user is expected when there's no pending redirect
                if (err?.code !== 'auth/null-user') {
                    console.error('❌ AuthContext: getRedirectResult failed', err);
                }
            }

            // ── Step 2: Attach the single global auth state listener ──────────────
            // After redirect resolution, attach onAuthStateChanged. Firebase will now
            // fire synchronously with the persisted session (from IndexedDB/localStorage)
            // or null if truly signed out.
            unsubAuthRef.current = subscribeToAuthChanges(async (currentUser) => {
                if (!isMountedRef.current) return;

                console.log(
                    '👤 AuthContext: onAuthStateChanged →',
                    currentUser ? `authenticated as ${currentUser.email}` : 'unauthenticated'
                );

                if (currentUser) {
                    setUser(currentUser);
                    setStatus('authenticated');

                    try {
                        // Initialize profile + seed default categories (idempotent)
                        await initializeUserAccount(currentUser);

                        // Tear down any previous profile listener before re-attaching
                        if (unsubProfileRef.current) {
                            unsubProfileRef.current();
                            unsubProfileRef.current = null;
                        }

                        // Real-time Firestore profile listener
                        const userRef = doc(db, 'users', currentUser.uid);
                        unsubProfileRef.current = onSnapshot(
                            userRef,
                            (snap) => {
                                if (!isMountedRef.current) return;
                                setProfile(snap.exists() ? snap.data() : null);
                            },
                            (err) => {
                                console.error('❌ AuthContext: Profile snapshot error', err);
                            }
                        );
                    } catch (err) {
                        console.error('❌ AuthContext: Post-login initialization failed', err);
                        // Don't block auth — user is still authenticated even if init fails
                    }
                } else {
                    // Signed out — tear down profile listener
                    if (unsubProfileRef.current) {
                        unsubProfileRef.current();
                        unsubProfileRef.current = null;
                    }
                    setUser(null);
                    setProfile(null);
                    setStatus('unauthenticated');
                }
            });
        };

        init();

        // Cleanup: synchronously unsubscribe both listeners.
        // The old version had a bug where cleanup called .then() on the init promise,
        // which means the auth unsubscribe ran AFTER the component was unmounted —
        // potentially after a new listener had already been attached (StrictMode).
        return () => {
            isMountedRef.current = false;
            if (unsubAuthRef.current) {
                unsubAuthRef.current();
                unsubAuthRef.current = null;
            }
            if (unsubProfileRef.current) {
                unsubProfileRef.current();
                unsubProfileRef.current = null;
            }
        };
    }, []);

    const loading = status === 'idle' || status === 'loading';

    return (
        <AuthContext.Provider
            value={{
                status,
                user,
                profile,
                loading,
                isAuthenticated: status === 'authenticated',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
