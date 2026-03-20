import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  LogOut,
  Box,
  UserCheck,
  ClipboardList,
  Briefcase,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; exact?: boolean }> = ({
    to,
    icon,
    label,
    exact,
  }) => {
    const active = exact ? location.pathname === to : isActive(to);
    return (
      <Link
        to={to}
        onClick={() => onClose()}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2 transition-all duration-200 ${
          active
            ? 'gradient-purple-primary text-white shadow-md'
            : 'text-gray-600 hover:bg-[#F3E8FF] hover:text-[#6E3482]'
        }`}
      >
        <span className="w-5 h-5">{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </Link>
    );
  };

  const NavSection: React.FC<{ label: string }> = ({ label }) => (
    <div className="px-4 py-2 mt-4">
      <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
    </div>
  );

  const getPlannerNav = () => (
    <>
      <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" exact />
      <NavItem to="/events" icon={<Calendar size={18} />} label="Events" />
      <NavItem to="/marketplace" icon={<ShoppingBag size={18} />} label="Marketplace" />
      <NavItem to="/bookings" icon={<ClipboardList size={18} />} label="Bookings" />
      
      <NavSection label="Management" />
      <NavItem to="/staff" icon={<UserCheck size={18} />} label="Team" />
      
      <NavSection label="Analytics" />
      <NavItem to="/financials" icon={<DollarSign size={18} />} label="Financials" />
    </>
  );

  const getVendorNav = () => (
    <>
      <NavItem to="/vendor/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" exact />
      <NavItem to="/vendor/portfolio" icon={<Briefcase size={18} />} label="My Portfolio" />
      <NavItem to="/bookings" icon={<ClipboardList size={18} />} label="Bookings" />
      
      <NavSection label="Management" />
      <NavItem to="/vendor/inventory" icon={<Box size={18} />} label="Inventory" />
      <NavItem to="/vendor/staff" icon={<UserCheck size={18} />} label="Staff" />
      
      <NavSection label="Analytics" />
      <NavItem to="/vendor/financials" icon={<DollarSign size={18} />} label="Financials" />
      <NavItem to="/vendor/risk" icon={<AlertTriangle size={18} />} label="Risk Analysis" />
    </>
  );

  const getClientNav = () => (
    <>
      <NavItem to="/client/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" exact />
      <NavItem to="/client/events" icon={<Calendar size={18} />} label="My Events" />
      <NavItem to="/bookings" icon={<ClipboardList size={18} />} label="Bookings" />
      <NavItem to="/client/financials" icon={<DollarSign size={18} />} label="Financials" />
    </>
  );

  const getNavItems = () => {
    switch (user.role) {
      case 'PLANNER':
        return getPlannerNav();
      case 'VENDOR':
        return getVendorNav();
      case 'CLIENT':
        return getClientNav();
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Header */}
      <div className="h-16 gradient-purple-primary flex items-center justify-center">
        <h1 className="text-white text-2xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          EventFlow <span className="text-pink-300 text-sm font-bold">AI</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {getNavItems()}
      </nav>

      {/* User card */}
      <div className="p-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-purple-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};