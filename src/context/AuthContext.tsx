import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, subscribeToAuthChanges } from '../firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔐 Auth: Initializing observer...');

        // Safety timeout to prevent infinite loading if Firebase hangs
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn('🔐 Auth: Loading timed out after 6s. Proceeding as logged out.');
                setLoading(false);
            }
        }, 6000);

        const unsubscribe = subscribeToAuthChanges((currentUser) => {
            console.log('👤 Auth: State changed', currentUser?.email || 'Logged out');
            clearTimeout(timeoutId);
            setUser(currentUser);
            setLoading(false);
        });

        return () => {
            console.log('🔐 Auth: Unmounting observer');
            clearTimeout(timeoutId);
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
