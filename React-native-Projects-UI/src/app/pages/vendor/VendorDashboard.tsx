// src/app/pages/vendor/VendorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { Clock, DollarSign, CheckCircle2, Calendar, Briefcase, Loader2 } from 'lucide-react';
import { bookings as bookingsApi, type Booking } from '../../../lib/api';
import { toast } from 'sonner';

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading]       = useState(true);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [actionId, setActionId]     = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await bookingsApi.vendorList();
      setAllBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pending   = allBookings.filter(b => b.status === 'REQUESTED');
  const confirmed = allBookings.filter(b => b.status === 'CONFIRMED');
  const upcoming  = allBookings.filter(b =>
    ['REQUESTED','MEETING_PHASE_1','CONFIRMATION_PENDING','MEETING_PHASE_2','CONFIRMED'].includes(b.status)
  ).slice(0, 5);

  const totalRevenue = allBookings
    .filter(b => ['CONFIRMED','COMPLETED'].includes(b.status))
    .reduce((s, b) => s + Number(b.totalCost), 0);

  const advance = async (id: string, status: string) => {
    setActionId(id);
    try {
      const updated = await bookingsApi.updateStatus(id, status);
      setAllBookings(prev => prev.map(b => b.id === id ? updated : b));
      toast.success(`Booking ${status === 'CANCELLED' ? 'rejected' : 'advanced'}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update booking');
    } finally {
      setActionId(null);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Good morning, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500">{user?.businessName ?? 'Your Business'} • {user?.category}</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Pending Requests" value={pending.length}   subLabel="Awaiting response"  icon={Clock}        accentColor="amber"  />
        <KPICard label="Confirmed Revenue" value={`₹${(totalRevenue/100000).toFixed(1)}L`} subLabel="Confirmed + completed" icon={DollarSign} accentColor="green" />
        <KPICard label="Confirmed Bookings" value={confirmed.length} subLabel="Active bookings"  icon={CheckCircle2} accentColor="green"  />
        <KPICard label="Total Bookings"    value={allBookings.length} subLabel="All time"        icon={Calendar}     accentColor="purple" />
      </div>

      {/* Pending requests */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Pending Requests ⚡
        </h2>
        {pending.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No pending requests right now
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pending.map(req => (
              <motion.div key={req.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-md p-6 transition-all duration-300">
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  {req.event?.name ?? 'Event'}
                </h3>
                {req.event?.startDate && (
                  <p className="text-sm text-gray-600 mb-1">Date: {fmtDate(req.event.startDate)}</p>
                )}
                <p className="text-sm text-gray-600 mb-1">
                  Items: {req.items?.length ?? 0}
                </p>
                <p className="text-lg font-mono font-bold text-[#49225B] mb-4">
                  ₹{Number(req.totalCost).toLocaleString('en-IN')}
                </p>
                {req.notes && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-3 italic">"{req.notes}"</p>
                )}
                <div className="flex gap-2">
                  <Link to={`/bookings/${req.id}`}
                    className="flex-1 text-center border border-[#A56ABD] text-[#6E3482] px-4 py-2 rounded-lg font-semibold hover:bg-[#F3E8FF] transition-all text-sm">
                    View Details
                  </Link>
                  <button
                    onClick={() => advance(req.id, 'MEETING_PHASE_1')}
                    disabled={actionId === req.id}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1 text-sm">
                    {actionId === req.id ? <Loader2 size={14} className="animate-spin" /> : null}
                    Schedule Meeting
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming bookings + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Upcoming Bookings</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming bookings</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <Link key={b.id} to={`/bookings/${b.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#F3E8FF] transition-colors">
                  <div>
                    <p className="font-semibold text-sm">{b.event?.name ?? 'Event'}</p>
                    {b.event?.startDate && (
                      <p className="text-xs text-gray-500">{fmtDate(b.event.startDate)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#49225B]">
                      ₹{Number(b.totalCost).toLocaleString('en-IN')}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <Link to="/vendor/portfolio"
            className="flex items-center justify-between p-4 gradient-purple-primary text-white rounded-xl hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <Briefcase size={20} />
              <span className="font-semibold">Manage Portfolio</span>
            </div>
          </Link>
          <Link to="/vendor/inventory"
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all">
            <span className="font-semibold text-gray-700">Manage Inventory</span>
          </Link>
          <Link to="/vendor/staff"
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all">
            <span className="font-semibold text-gray-700">Manage Staff</span>
          </Link>
          <Link to="/bookings"
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all">
            <span className="font-semibold text-gray-700">All Bookings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
