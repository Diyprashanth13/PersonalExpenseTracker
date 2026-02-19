import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { TourProvider } from './context/TourContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// ─── Provider Stack ────────────────────────────────────────────────────────────
// Order is deliberate:
//   1. ErrorBoundary — outermost, catches render crashes across the entire tree
//   2. ToastProvider — needed by AuthProvider for error toasts
//   3. AuthProvider — MUST come before TransactionProvider and App.
//      It calls getRedirectResult() + onAuthStateChanged() on mount.
//      App.tsx blocks the Router until this hydration is complete.
//   4. TransactionProvider — reads `user` from AuthContext. Guards internally
//      against `user=null` so no Firestore reads happen before login.
//   5. TourProvider — UI-only, no auth dependency
//   6. App — rendered last, uses all providers above
const RootApp = () => (
  <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <TransactionProvider>
          <TourProvider>
            <App />
          </TourProvider>
        </TransactionProvider>
      </AuthProvider>
    </ToastProvider>
  </ErrorBoundary>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
