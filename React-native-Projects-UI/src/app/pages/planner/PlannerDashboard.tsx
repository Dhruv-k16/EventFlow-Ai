// src/app/pages/planner/PlannerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { Calendar, DollarSign, CheckCircle2, Clock, Plus, ShoppingBag, FileText, AlertTriangle, MapPin, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { events as eventsApi, bookings as bookingsApi, type Event, type Booking } from '../../../lib/api';
import { toast } from 'sonner';

export const PlannerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading]           = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user?.plannerId) return;
    let mounted = true;

    const load = async () => {
      try {
        const [eventsRes, bookingsRes] = await Promise.all([
          eventsApi.list({ plannerId: user.plannerId! }),
          bookingsApi.list(),
        ]);
        if (!mounted) return;
        // Show only upcoming events (not completed)
        const upcoming = eventsRes.events
          .filter(e => !e.startDate || new Date(e.startDate) >= new Date(Date.now() - 86400000))
          .slice(0, 3);
        setUpcomingEvents(upcoming);
        setRecentBookings(bookingsRes.slice(0, 5));
      } catch (err: any) {
        if (mounted) toast.error('Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user?.plannerId]);

  // Derived KPI values
  const totalEvents    = upcomingEvents.length;
  const confirmedCount = recentBookings.filter(b => b.status === 'CONFIRMED').length;
  const totalBudget    = upcomingEvents.reduce((s, e) => s + Number(e.totalBudget ?? 0), 0);
  const upcoming30     = upcomingEvents.filter(e => {
    if (!e.startDate) return false;
    const diff = new Date(e.startDate).getTime() - Date.now();
    return diff > 0 && diff < 30 * 86400000;
  }).length;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const fmtCurrency = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Good morning, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {upcomingEvents.length} events coming up
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Total Events"    value={totalEvents}              subLabel="All time"            icon={Calendar}      accentColor="purple" />
        <KPICard label="Active Bookings" value={confirmedCount}           subLabel="Confirmed vendors"   icon={CheckCircle2}  accentColor="green"  />
        <KPICard label="Total Budget"    value={fmtCurrency(totalBudget)} subLabel="Across all events"  icon={DollarSign}    accentColor="purple" />
        <KPICard label="Upcoming (30d)"  value={upcoming30}               subLabel="In the next 30 days" icon={Clock}        accentColor="amber"  />
      </div>

      {/* Upcoming Events + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No upcoming events</p>
              <Link to="/events/new" className="gradient-purple-primary text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
                <Plus size={16} /> Create your first event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_6px_rgba(73,34,91,0.08)] hover:shadow-[0_20px_40px_rgba(73,34,91,0.14)] transition-all duration-300"
                >
                  <div className="h-24 gradient-purple-accent relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#A56ABD]/80 to-[#ec4899]/80 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{event.type === 'MULTI_FUNCTION' ? `${event._count?.functions ?? 0} Functions` : event.eventType ?? 'Event'}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>{event.name}</h3>
                    {event.startDate && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={12} /><span>{fmtDate(event.startDate)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={12} /><span className="truncate">{event.location}</span>
                      </div>
                    )}
                    {event.guestCount && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={12} /><span>{event.guestCount} guests</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Link to={`/events/${event.id}`} className="flex-1 text-center px-2 py-1.5 text-xs font-semibold text-[#6E3482] hover:bg-[#F3E8FF] rounded-lg transition-colors">View</Link>
                      <Link to={`/risk/${event.id}`}   className="flex-1 text-center px-2 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">Risk</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/events/new" className="flex items-center gap-3 p-4 gradient-purple-primary text-white rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 active:scale-95">
              <Plus size={20} /><span className="font-semibold">Create Event</span>
            </Link>
            <Link to="/marketplace" className="flex items-center gap-3 p-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all duration-200">
              <ShoppingBag size={20} /><span className="font-semibold">Browse Marketplace</span>
            </Link>
            <Link to="/bookings" className="flex items-center gap-3 p-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all duration-200">
              <FileText size={20} /><span className="font-semibold">View All Bookings</span>
            </Link>
            <Link to="/financials" className="flex items-center gap-3 p-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all duration-200">
              <AlertTriangle size={20} /><span className="font-semibold">View Financials</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Recent Bookings</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No bookings yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-[#F3E8FF] transition-colors duration-150 cursor-pointer"
                          onClick={() => window.location.href = `/bookings/${booking.id}`}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.vendor?.businessName ?? '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{booking.event?.name ?? '—'}</td>
                        <td className="px-6 py-4 text-sm font-mono font-bold text-[#49225B]">₹{Number(booking.totalCost).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4"><StatusBadge status={booking.status as any} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Risk Overview */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Risk Overview</h2>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="transform -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#10B981" strokeWidth="12"
                    strokeDasharray={`${0.35 * 314} 314`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-[#10B981]" style={{ fontFamily: 'JetBrains Mono' }}>35</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <StatusBadge status={'LOW' as any} />
              <p className="text-sm text-gray-600 mt-2">All events on track</p>
            </div>
            {upcomingEvents[0] && (
              <Link to={`/risk/${upcomingEvents[0].id}`} className="block text-center text-sm font-semibold text-[#6E3482] hover:text-[#49225B] mt-4">
                View Full Analysis →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* AI Briefing */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="gradient-purple-primary rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤖</span>
              <span className="text-xs uppercase tracking-wider font-semibold">AI Daily Briefing</span>
            </div>
            <p className="text-white/90 leading-relaxed">
              {upcomingEvents.length > 0
                ? `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length > 1 ? 's' : ''}. ${confirmedCount} booking${confirmedCount !== 1 ? 's' : ''} confirmed. Review your risk dashboard for detailed analysis.`
                : 'No upcoming events. Create your first event to get started with AI-powered risk analysis.'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">gemini-2.5-flash</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
