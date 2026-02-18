import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const RootApp = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <TransactionProvider>
            <App />
          </TransactionProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

