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

const App: React.FC = () => {
    const {
        transactions,
        categories,
        settings,
        loading,
        fetchData,
        saveTransaction,
        deleteTransaction,
        saveCategory,
        deleteCategory,
        updateSettings,
        clearAllData
    } = useFinanceStore();

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!settings.hasCompletedOnboarding) {
        return <Onboarding onComplete={() => updateSettings({ hasCompletedOnboarding: true })} />;
    }

    return (
        <Router>
            <Layout theme={settings.theme}>
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
                    <Route path="/settings" element={<Settings settings={settings} updateSettings={updateSettings} onClearData={clearAllData} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;