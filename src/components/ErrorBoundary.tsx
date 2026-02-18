import * as React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('🏗️ ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-10 space-y-6">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto text-rose-500 dark:text-rose-400">
                            <AlertTriangle size={40} />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Interrupted</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Something went wrong while rendering this page. We've logged the error and you can try to restore the session below.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left overflow-auto max-h-32">
                            <code className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                                {this.state.error?.message || 'Unknown runtime error'}
                            </code>
                        </div>

                        <button
                            onClick={this.handleRetry}
                            className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <RefreshCcw size={18} />
                            Attempt Recovery
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
