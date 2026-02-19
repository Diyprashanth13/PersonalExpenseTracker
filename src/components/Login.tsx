import React, { useEffect, useState } from 'react';
import { loginWithEmail, loginWithGoogle, isMobile, isStandalone } from '../firebase/auth';
import { Mail, Lock, LogIn, Eye, EyeOff, Smartphone } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // OAuth return path memory: ProtectedRoute passes the intended destination
    // via location.state.from so we can redirect the user back after sign-in.
    const from = (location.state as any)?.from?.pathname || '/';

    // If the user is already authenticated (e.g. navigated to /login manually),
    // redirect them to the app immediately.
    useEffect(() => {
        if (isAuthenticated) {
            console.log('✅ Login: Already authenticated — redirecting to', from);
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loginWithEmail(email, password);
            // Navigation handled by onAuthStateChanged in AuthContext → App.tsx
        } catch (err: any) {
            console.error('Login error:', err.code);
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password. Please try again.');
                    break;
                case 'auth/invalid-credential':
                    setError('Invalid email or password.');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many failed attempts. Please try again later.');
                    break;
                default:
                    setError(err.message || 'Failed to login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle();
            // On mobile/PWA: page unloads for redirect — no further execution here.
            // On desktop: popup resolves, onAuthStateChanged fires → App.tsx navigates.
            if (isMobile || isStandalone) {
                // Show a visual cue that redirect is happening
                setRedirecting(true);
            }
        } catch (err: any) {
            console.error('Google login error:', err.code);
            if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                setError(err.message || 'Failed to login with Google');
            }
        } finally {
            // Don't reset loading on mobile — page will unload
            if (!isMobile && !isStandalone) {
                setLoading(false);
            }
        }
    };

    // Show redirect overlay while Google OAuth redirect is in flight
    if (redirecting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-6 text-center">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-200">
                    F
                </div>
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium text-sm">
                    Redirecting to Google...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-8">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-emerald-100">F</div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 text-sm">Sign in to sync your expenses</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-700"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-700"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end pt-1">
                            <Link to="/forgot-password" className="font-medium text-xs text-emerald-600 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn size={20} />}
                        Sign In
                    </button>
                </form>

                <div className="mt-8 relative text-center text-slate-400 text-xs font-bold uppercase tracking-widest overflow-hidden">
                    <div className="absolute inset-0 flex items-center overflow-visible">
                        <div className="w-full border-t border-slate-100" />
                    </div>
                    <span className="relative px-4 bg-white">Or</span>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="mt-6 w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                    {(isMobile || isStandalone) && (
                        <Smartphone size={14} className="text-slate-400 ml-1" />
                    )}
                </button>

                {/* Debug info — visible in development only */}
                {import.meta.env.DEV && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-400 font-mono">
                        mode: {isStandalone ? 'standalone PWA' : isMobile ? 'mobile browser' : 'desktop'} |
                        strategy: {(isMobile || isStandalone) ? 'redirect' : 'popup'}
                    </div>
                )}

                <p className="mt-8 text-center text-slate-500 text-sm font-medium">
                    New to FinTrack?{' '}
                    <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
