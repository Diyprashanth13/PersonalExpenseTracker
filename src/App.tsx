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
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import { useToast } from './context/ToastContext';
import { useTransactions } from './context/TransactionContext';

const App: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const {
        transactions,
        categories,
        saveTransaction,
        deleteTransaction,
        saveCategory,
        deleteCategory,
        loading: txLoading
    } = useTransactions();

    const {
        settings,
        loading: storeLoading,
        updateSettings,
        clearAllData,
        resetApplication
    } = useFinanceStore();

    const { showToast } = useToast();
    const [timedOut, setTimedOut] = React.useState(false);
    const hasToastedTimeout = React.useRef(false);

    // 1. Log initialization
    useEffect(() => {
        console.log('🏁 App: Rendering. Auth:', authLoading ? 'Loading' : (user ? 'Authenticated' : 'Logged out'), 'Store:', storeLoading ? 'Loading' : 'Ready', 'Live Data:', txLoading ? 'Syncing' : 'Ready');
    }, [authLoading, storeLoading, user, txLoading]);

    useEffect(() => {
        if (user) {
            console.log('👤 App: User context identified', user.uid);
            localStorage.setItem('last_user_uid', user.uid);
        }
    }, [user]);

    // 3. Safety timeout for infinite loading
    useEffect(() => {
        if (!authLoading && (!user || !storeLoading)) {
            setTimedOut(false);
            hasToastedTimeout.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (authLoading || (user && storeLoading)) {
                console.warn('⚠️ App: Loading timed out after 5s');
                setTimedOut(true);
                if (!hasToastedTimeout.current) {
                    showToast('info', 'Loading is taking longer than usual...');
                    hasToastedTimeout.current = true;
                }
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [authLoading, storeLoading, user, showToast]);

    // 4. Loading State - consolidated
    // If timed out, we force release the UI so the user can interact
    const isActuallyLoading = (authLoading || (user && (storeLoading || txLoading))) && !timedOut;

    if (isActuallyLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium text-sm animate-pulse">Synchronizing workspace...</p>
            </div>
        );
    }

    return (
        <Router>
            {!user ? (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            ) : !settings.hasCompletedOnboarding ? (
                <Onboarding onComplete={() => updateSettings({ hasCompletedOnboarding: true })} />
            ) : (
                <Layout theme={settings.theme} user={user}>
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
                        <Route path="/settings" element={<Settings settings={settings} updateSettings={updateSettings} resetApplication={resetApplication} onClearData={clearAllData} user={user} />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}
        </Router>
    );
};

export default App;