import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    signInWithRedirect,
    onAuthStateChanged,
    sendPasswordResetEmail,
    User
} from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';
export { auth };

export const loginWithEmail = (email: string, pass: string) =>
    signInWithEmailAndPassword(auth, email, pass);

export const registerWithEmail = (email: string, pass: string) =>
    createUserWithEmailAndPassword(auth, email, pass);

export const resetPassword = (email: string) =>
    sendPasswordResetEmail(auth, email);

export const loginWithGoogle = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        return signInWithRedirect(auth, googleProvider);
    }
    return signInWithPopup(auth, googleProvider);
};

export const logout = () => signOut(auth);

export const subscribeToAuthChanges = (callback: (user: User | null) => void) =>
    onAuthStateChanged(auth, callback);
