// src/app/pages/client/ClientEvents.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { events as eventsApi, type Event } from '../../../lib/api';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { toast } from 'sonner';

const FILTERS = ['All', 'Upcoming', 'Past'];

export const ClientEvents: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading]           = useState(true);
  const [allEvents, setAllEvents]       = useState<Event[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    eventsApi.list({ clientId: user.id })
      .then(res => setAllEvents(res.events))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const now = new Date();
  const filtered = allEvents.filter(e => {
    if (activeFilter === 'Upcoming') return e.startDate && new Date(e.startDate) >= now;
    if (activeFilter === 'Past')     return e.startDate && new Date(e.startDate) < now;
    return true;
  });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>My Events</h1>
          <p className="text-gray-500 mt-1">{allEvents.length} total event{allEvents.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/client/create-event"
          className="flex items-center gap-2 px-5 py-2.5 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all">
          <Plus size={18} /> New Event
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
              activeFilter === f ? 'gradient-purple-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-[#A56ABD]'
            }`}>
            {f}
            <span className="ml-1.5 text-xs opacity-70">
              ({f === 'All' ? allEvents.length
                : f === 'Upcoming' ? allEvents.filter(e => e.startDate && new Date(e.startDate) >= now).length
                : allEvents.filter(e => e.startDate && new Date(e.startDate) < now).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">
            {activeFilter === 'All' ? 'No events yet' : `No ${activeFilter.toLowerCase()} events`}
          </p>
          {activeFilter === 'All' && (
            <Link to="/client/create-event"
              className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus size={18} /> Create your first event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((event, index) => (
            <motion.div key={event.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }} whileHover={{ y: -4 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <div className="h-40 gradient-purple-accent relative">
                {event.startDate && new Date(event.startDate) < now && (
                  <div className="absolute top-3 left-3 bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Past
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>{event.name}</h3>
                {event.eventType && (
                  <span className="inline-block px-2 py-0.5 bg-[#F3E8FF] text-[#6E3482] rounded-full text-xs font-semibold">
                    {event.eventType}
                  </span>
                )}
                <div className="text-sm text-gray-600 space-y-1">
                  {event.startDate  && <p>📅 {fmtDate(event.startDate)}</p>}
                  {event.location   && <p>📍 {event.location}</p>}
                  {event.guestCount && <p>👥 {event.guestCount} guests</p>}
                </div>
                <div className="flex gap-2 pt-2">
                  <Link to={`/client/events/${event.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm font-semibold text-[#6E3482] hover:bg-[#F3E8FF] rounded-lg transition-colors">
                    Details →
                  </Link>
                  {!event.plannerId && (
                    <Link to={`/client/bookings/new?eventId=${event.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm font-semibold gradient-purple-primary text-white rounded-lg transition-all">
                      Book Vendor
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
