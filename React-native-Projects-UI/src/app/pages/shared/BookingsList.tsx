// src/app/pages/shared/BookingsList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { Plus } from 'lucide-react';
import { bookings as bookingsApi, type Booking } from '../../../lib/api';
import { toast } from 'sonner';

const FILTERS = ['All', 'Requested', 'Meeting', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'];

const matchFilter = (status: string, filter: string) => {
  if (filter === 'All') return true;
  if (filter === 'Meeting') return status.includes('MEETING') || status === 'CONFIRMATION_PENDING';
  return status === filter.toUpperCase();
};

export const BookingsList: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading]           = useState(true);
  const [allBookings, setAllBookings]   = useState<Booking[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Vendors use vendor/bookings endpoint; planners/clients use shared bookings
        const data = user?.role === 'VENDOR'
          ? await bookingsApi.vendorList()
          : await bookingsApi.list();
        if (mounted) setAllBookings(data);
      } catch {
        if (mounted) toast.error('Failed to load bookings');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.role]);

  const filtered = allBookings.filter(b => matchFilter(b.status, activeFilter));

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return (
    <div className="space-y-6">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {user?.role === 'VENDOR' ? 'Incoming Bookings' : 'My Bookings'}
          </h1>
          <p className="text-gray-500 mt-1">{allBookings.length} total booking{allBookings.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'PLANNER' && (
          <Link to="/bookings/new"
            className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2">
            <Plus size={20} /> Book Vendor
          </Link>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
              activeFilter === f
                ? 'gradient-purple-primary text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-[#A56ABD]'
            }`}>
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({allBookings.filter(b => matchFilter(b.status, f)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-2">No bookings found</p>
            {activeFilter !== 'All' && (
              <button onClick={() => setActiveFilter('All')} className="text-[#6E3482] text-sm font-semibold hover:underline">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {user?.role === 'VENDOR' ? 'Event' : 'Vendor'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  {user?.role !== 'CLIENT' && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(booking => (
                  <tr key={booking.id} className="hover:bg-[#F3E8FF] transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user?.role === 'VENDOR' ? booking.event?.name ?? '—' : booking.vendor?.businessName ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.event?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.event?.startDate ? fmtDate(booking.event.startDate) : '—'}
                    </td>
                    {user?.role !== 'CLIENT' && (
                      <td className="px-6 py-4 text-sm font-mono font-bold text-[#49225B]">
                        ₹{Number(booking.totalCost).toLocaleString('en-IN')}
                      </td>
                    )}
                    <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                    <td className="px-6 py-4">
                      <Link to={`/bookings/${booking.id}`}
                        className="text-sm font-semibold text-[#6E3482] hover:text-[#49225B]">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};
