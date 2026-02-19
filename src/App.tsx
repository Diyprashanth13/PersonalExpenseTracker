import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { TransactionList } from './screens/TransactionList';
import { TransactionForm } from './screens/TransactionForm';
import { CategoryManager } from './screens/CategoryManager';
import { CategoryForm } from './screens/CategoryForm';
import { DashboardCustomizer } from './screens/DashboardCustomizer';
import { Insights } from './screens/Insights';
import { Settings } from './screens/Settings';
import { Onboarding } from './screens/Onboarding';
import { useFinanceStore } from './store/useFinanceStore';
import { useAuth } from './context/AuthContext';
import { useTour } from './context/TourContext';
import { TourOverlay } from './components/TourOverlay';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import { useToast } from './context/ToastContext';
import { useTransactions } from './context/TransactionContext';

// ─── Authenticated Shell ───────────────────────────────────────────────────────
// Only rendered after ProtectedRoute confirms the user is signed in.
const AuthenticatedApp: React.FC = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const { startTour } = useTour();
    const { showToast } = useToast();
    const [timedOut, setTimedOut] = React.useState(false);
    const hasToastedTimeout = React.useRef(false);

    const {
        settings,
        loading: storeLoading,
        updateSettings,
        resetApplication,
    } = useFinanceStore();

    const {
        transactions,
        categories,
        saveTransaction,
        deleteTransaction,
        saveCategory,
        deleteCategory,
        loading: txLoading,
    } = useTransactions();

    // Auto-trigger Product Tour for first-time users
    useEffect(() => {
        if (user && profile && !authLoading && !storeLoading && !txLoading) {
            if (profile.hasCompletedOnboarding === false) {
                console.log('✨ App: First-time user — starting Product Tour');
                const timer = setTimeout(() => startTour(), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [user, profile, authLoading, storeLoading, txLoading, startTour]);

    // Safety timeout — prevents infinite spinner if data loading stalls after auth
    useEffect(() => {
        if (!storeLoading && !txLoading) {
            setTimedOut(false);
            hasToastedTimeout.current = false;
            return;
        }
        const timer = setTimeout(() => {
            console.warn('⚠️ App: Store/transaction loading timed out');
            setTimedOut(true);
            if (!hasToastedTimeout.current) {
                showToast('info', 'Loading is taking longer than usual...');
                hasToastedTimeout.current = true;
            }
        }, 7000);
        return () => clearTimeout(timer);
    }, [storeLoading, txLoading, showToast]);

    // Hold render until data is ready (auth is already verified by ProtectedRoute)
    if ((storeLoading || txLoading) && !timedOut) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium text-sm animate-pulse">
                    Synchronizing workspace...
                </p>
            </div>
        );
    }

    // Onboarding for first-time users (shown between auth confirmation and main app)
    if (!settings.hasCompletedOnboarding) {
        return <Onboarding onComplete={() => updateSettings({ hasCompletedOnboarding: true })} />;
    }

    return (
        <>
            <TourOverlay />
            <Layout theme={settings.theme} user={user!}>
                <Routes>
                    <Route path="/" element={<Dashboard transactions={transactions} categories={categories} settings={settings} />} />
                    <Route path="/transactions" element={<TransactionList transactions={transactions} categories={categories} settings={settings} />} />
                    <Route path="/add" element={<TransactionForm categories={categories} transactions={transactions} onSave={saveTransaction} onDelete={deleteTransaction} />} />
                    <Route path="/edit/:id" element={<TransactionForm categories={categories} transactions={transactions} onSave={saveTransaction} onDelete={deleteTransaction} />} />
                    <Route path="/categories" element={<CategoryManager categories={categories} onDelete={deleteCategory} />} />
                    <Route path="/categories/add" element={<CategoryForm onSave={saveCategory} />} />
                    <Route path="/categories/edit/:id" element={<CategoryForm categories={categories} onSave={saveCategory} />} />
                    <Route path="/customize-dashboard" element={<DashboardCustomizer settings={settings} updateSettings={updateSettings} />} />
                    <Route path="/insights" element={<Insights transactions={transactions} categories={categories} settings={settings} />} />
                    <Route path="/settings" element={<Settings settings={settings} updateSettings={updateSettings} resetApplication={resetApplication} user={user!} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </>
    );
};

// ─── Root App ──────────────────────────────────────────────────────────────────
const App: React.FC = () => {
    const { loading: authLoading } = useAuth();
    const [timedOut, setTimedOut] = React.useState(false);
    const { showToast } = useToast();
    const hasToastedTimeout = React.useRef(false);

    // Global auth timeout guard — in case Firebase auth hydration stalls completely
    useEffect(() => {
        if (!authLoading) {
            setTimedOut(false);
            hasToastedTimeout.current = false;
            return;
        }
        const timer = setTimeout(() => {
            console.warn('⚠️ App: Auth hydration timed out after 8s — rendering anyway');
            setTimedOut(true);
            if (!hasToastedTimeout.current) {
                showToast('info', 'Having trouble connecting. Please check your network.');
                hasToastedTimeout.current = true;
            }
        }, 8000);
        return () => clearTimeout(timer);
    }, [authLoading, showToast]);

    // ── CRITICAL: Block the entire Router until auth hydration completes ──────
    //
    // This is THE root fix for the "redirect loop on mobile PWA" bug.
    //
    // Timeline on mobile without this fix:
    //   t=0ms   App mounts, authLoading=true, user=null
    //   t=1ms   Router renders → sees user=null → Navigate to="/login" fires
    //   t=50ms  onAuthStateChanged fires with restored user → too late, already on /login
    //
    // Timeline on mobile WITH this fix:
    //   t=0ms   App mounts, authLoading=true → show splash, NO Router
    //   t=50ms  getRedirectResult resolves → onAuthStateChanged fires → user set
    //   t=51ms  authLoading=false → Router renders → user exists → Dashboard shows ✅
    if (authLoading && !timedOut) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/60">
                    F
                </div>
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-medium text-sm animate-pulse">
                    Starting FinTrack...
                </p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public routes — accessible without authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected application shell — ProtectedRoute is the last gate */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <AuthenticatedApp />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
