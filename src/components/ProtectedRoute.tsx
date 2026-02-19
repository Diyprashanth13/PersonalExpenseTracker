import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute — Guards any route that requires authentication.
 *
 * Behaviour matrix:
 *   status=idle|loading  → Show splash (auth hydration in progress)
 *   status=authenticated → Render children
 *   status=unauthenticated → Redirect to /login, preserving the attempted path
 *                            so we can navigate back after sign-in.
 *
 * This component is RACE-CONDITION SAFE:
 *   It never redirects to /login while auth is still loading (the most common
 *   cause of the "redirect loop on mobile PWA" bug).
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { status, loading } = useAuth();
    const location = useLocation();

    // Auth hydration in progress — show splash instead of redirecting.
    // Without this, mobile/PWA will send the user to /login the instant the
    // component mounts, before Firebase has had a chance to restore the session.
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium text-sm animate-pulse">
                    Authenticating...
                </p>
            </div>
        );
    }

    // Confirmed unauthenticated — redirect to login, remembering the intended path
    // so we can redirect back after a successful sign-in (OAuth return path memory).
    if (status === 'unauthenticated') {
        console.log('🔒 ProtectedRoute: Unauthenticated — redirecting to /login from', location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
