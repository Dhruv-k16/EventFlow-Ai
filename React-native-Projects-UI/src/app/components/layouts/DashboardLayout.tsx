import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion } from 'motion/react';

export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user) return;

    // Role-based redirects
    const path = location.pathname;
    
    // Redirect to role-specific dashboard if on generic dashboard
    if (path === '/dashboard' && user.role !== 'PLANNER') {
      if (user.role === 'VENDOR') {
        navigate('/vendor/dashboard', { replace: true });
      } else if (user.role === 'CLIENT') {
        navigate('/client/dashboard', { replace: true });
      }
      return;
    }

    // Protect planner-only routes
    const plannerRoutes = ['/dashboard', '/events/new', '/marketplace', '/financials', '/staff'];
    if (plannerRoutes.some(route => path.startsWith(route)) && user.role !== 'PLANNER') {
      navigate(getRoleHome(user.role), { replace: true });
      return;
    }

    // Protect vendor-only routes
    if (path.startsWith('/vendor/') && user.role !== 'VENDOR') {
      navigate(getRoleHome(user.role), { replace: true });
      return;
    }

    // Protect client-only routes
    if (path.startsWith('/client/') && user.role !== 'CLIENT') {
      navigate(getRoleHome(user.role), { replace: true });
      return;
    }
  }, [user, isAuthenticated, loading, navigate, location.pathname]);

  const getRoleHome = (role: UserRole): string => {
    switch (role) {
      case 'PLANNER':
        return '/dashboard';
      case 'VENDOR':
        return '/vendor/dashboard';
      case 'CLIENT':
        return '/client/dashboard';
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F5EBFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#A56ABD] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EBFA]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="p-4 md:p-8 max-w-7xl mx-auto"
        >
          <Outlet />
        </motion.main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};