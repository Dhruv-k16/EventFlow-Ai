// src/app/pages/client/ClientDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { Calendar, CheckCircle2, Clock, Plus } from 'lucide-react';
import { events as eventsApi, bookings as bookingsApi, type Event, type Booking } from '../../../lib/api';
import { toast } from 'sonner';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading]       = useState(true);
  const [events, setEvents]         = useState<Event[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      eventsApi.list({ clientId: user.id }),
      bookingsApi.list(),
    ]).then(([evRes, bkRes]) => {
      setEvents(evRes.events);
      setRecentBookings(bkRes.slice(0, 5));
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const now = new Date();
  const upcoming = events.filter(e => e.startDate && new Date(e.startDate) >= now);
  const past     = events.filter(e => e.startDate && new Date(e.startDate) < now);
  const confirmedBookings = recentBookings.filter(b => b.status === 'CONFIRMED');

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Good to see you, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500">Here's your event overview</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="My Events"       value={events.length}            subLabel="Total events"      icon={Calendar}     accentColor="purple" />
        <KPICard label="Active Bookings" value={confirmedBookings.length} subLabel="Confirmed vendors" icon={CheckCircle2}  accentColor="green"  />
        <KPICard label="Upcoming Events" value={upcoming.length}          subLabel="Not yet happened"  icon={Clock}         accentColor="amber"  />
        <KPICard label="Past Events"     value={past.length}              subLabel="Completed"         icon={Calendar}      accentColor="blue"   />
      </div>

      {/* Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>My Events</h2>
          <div className="flex items-center gap-3">
            <Link to="/client/create-event"
              className="flex items-center gap-2 px-4 py-2 gradient-purple-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              <Plus size={20} /> Create New Event
            </Link>
            <Link to="/client/events" className="text-sm font-semibold text-[#6E3482] hover:text-[#49225B]">View all →</Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">No events yet</p>
            <Link to="/client/create-event"
              className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus size={18} /> Create your first event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.slice(0, 6).map((event, index) => (
              <motion.div key={event.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }} whileHover={{ y: -4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <div className="h-36 gradient-purple-accent" />
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>{event.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {event.startDate && <p>📅 {fmtDate(event.startDate)}</p>}
                    {event.location  && <p>📍 {event.location}</p>}
                    {event.guestCount && <p>👥 {event.guestCount} guests</p>}
                  </div>
                  {event.eventType && (
                    <span className="inline-block px-2 py-0.5 bg-[#F3E8FF] text-[#6E3482] rounded-full text-xs font-semibold">
                      {event.eventType}
                    </span>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Link to={`/client/events/${event.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm font-semibold text-[#6E3482] hover:bg-[#F3E8FF] rounded-lg transition-colors">
                      Details →
                    </Link>
                    <Link to={`/client/marketplace?type=vendor&eventId=${event.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm font-semibold gradient-purple-primary text-white rounded-lg transition-all">
                      Book Vendors
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Recent Bookings</h2>
          <Link to="/bookings" className="text-sm font-semibold text-[#6E3482] hover:text-[#49225B]">View all →</Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No bookings yet</p>
        ) : (
          <div className="space-y-3">
            {recentBookings.map(b => (
              <Link key={b.id} to={`/bookings/${b.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#F3E8FF] transition-colors">
                <div>
                  <p className="font-semibold text-sm">{b.vendor?.businessName ?? '—'}</p>
                  <p className="text-xs text-gray-500">{b.event?.name ?? '—'}</p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
