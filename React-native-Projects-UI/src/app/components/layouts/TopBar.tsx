import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/events') return 'Events';
    if (path === '/events/new') return 'Create Event';
    if (path.startsWith('/events/')) return 'Event Details';
    if (path === '/marketplace') return 'Marketplace';
    if (path.startsWith('/marketplace/vendor/')) return 'Vendor Profile';
    if (path === '/bookings/new') return 'Book Vendor';
    if (path === '/bookings') return 'Bookings';
    if (path.startsWith('/bookings/')) return 'Booking Details';
    if (path === '/financials') return 'Financials';
    if (path.startsWith('/risk/')) return 'Risk Analysis';
    if (path === '/vendor/dashboard') return 'Dashboard';
    if (path === '/vendor/inventory') return 'Inventory';
    if (path === '/vendor/staff') return 'Staff';
    if (path === '/vendor/financials') return 'Financials';
    if (path === '/vendor/risk') return 'Risk Analysis';
    if (path === '/client/dashboard') return 'Dashboard';
    if (path === '/client/events') return 'My Events';
    if (path === '/client/financials') return 'Financials';
    return 'EventFlow AI';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {getPageTitle()}
          </h2>
        </div>

        {/* Right: Search + Notifications + Avatar */}
        <div className="flex items-center gap-3">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full w-72 focus-within:border-[#A56ABD] focus-within:ring-2 focus-within:ring-[#F3E8FF] transition-all duration-300">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Avatar */}
          {user && (
            <div className="w-10 h-10 rounded-full gradient-purple-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};