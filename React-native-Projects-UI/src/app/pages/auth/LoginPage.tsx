// src/app/pages/auth/LoginPage.tsx
// Only change from original: quick login buttons now use real seed emails.
// The handleLogin and all UI is identical — no UI changes.

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const home =
        user.role === 'PLANNER' ? '/dashboard' :
        user.role === 'VENDOR'  ? '/vendor/dashboard' :
                                  '/client/dashboard';
      navigate(home, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (err: any) {
      toast.error(err.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FIX: use real seed emails (was @eventflow.ai, now @eventflow.dev)
  const quickLogin = async (seedEmail: string) => {
    setLoading(true);
    try {
      await login(seedEmail, 'password123');
      toast.success('Logged in!');
    } catch (err: any) {
      toast.error(err.message ?? 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[45%] gradient-purple-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center space-y-8">
          <h1 className="text-4xl font-extrabold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            EventFlow <span className="text-pink-300">AI</span>
          </h1>
          <p className="text-lg text-[#E7DBEF]">Intelligent event planning, powered by AI</p>

          <div className="space-y-3 mt-12">
            <p className="text-sm text-white/80 mb-4">Quick Test Login:</p>
            <button
              onClick={() => quickLogin('planner@eventflow.dev')}
              disabled={loading}
              className="w-full bg-white text-[#49225B] px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              Planner Login
            </button>
            <button
              onClick={() => quickLogin('decor@eventflow.dev')}
              disabled={loading}
              className="w-full bg-white text-[#49225B] px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              Vendor Login
            </button>
            <button
              onClick={() => quickLogin('client@eventflow.dev')}
              disabled={loading}
              className="w-full bg-white text-[#49225B] px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              Client Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Welcome back 👋
            </h2>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@eventflow.dev"
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200 text-[15px]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200 text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-purple-primary text-white font-semibold py-3.5 rounded-xl text-[15px] hover:opacity-90 hover:shadow-lg hover:shadow-[#A56ABD]/30 active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6E3482] font-semibold hover:text-[#49225B]">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
