// src/app/pages/planner/EventsList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { Calendar, MapPin, Users, Search, Plus, Filter } from 'lucide-react';
import { events as eventsApi, type Event } from '../../../lib/api';
import { toast } from 'sonner';

export const EventsList: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading]       = useState(true);
  const [allEvents, setAllEvents]   = useState<Event[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user?.plannerId) return;
    let mounted = true;

    eventsApi.list({ plannerId: user.plannerId })
      .then(res => { if (mounted) setAllEvents(res.events); })
      .catch(() => { if (mounted) toast.error('Failed to load events'); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [user?.plannerId]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const fmtBudget = (n: string | null) =>
    n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  const filteredEvents = allEvents.filter(event => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = event.name.toLowerCase().includes(q) ||
      (event.eventType ?? '').toLowerCase().includes(q) ||
      (event.location ?? '').toLowerCase().includes(q);
    // Events don't have a status field — filter by type instead
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'multi' && event.type === 'MULTI_FUNCTION') ||
      (filterStatus === 'single' && event.type === 'SINGLE');
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>All Events</h1>
          <p className="text-gray-600 mt-1">{allEvents.length} event{allEvents.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/events/new" className="inline-flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 active:scale-95">
          <Plus size={20} /> Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events, types, locations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A56ABD] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A56ABD] focus:border-transparent transition-all bg-white"
            >
              <option value="all">All Types</option>
              <option value="single">Single Events</option>
              <option value="multi">Multi-Function</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-gray-500">Quick filters:</span>
          {['all', 'single', 'multi'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${filterStatus === f ? 'bg-[#6E3482] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'all' ? `All (${allEvents.length})` : f === 'single' ? `Single (${allEvents.filter(e => e.type === 'SINGLE').length})` : `Multi-Function (${allEvents.filter(e => e.type === 'MULTI_FUNCTION').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-6">
            {allEvents.length === 0 ? 'Create your first event to get started' : 'Try adjusting your search or filters'}
          </p>
          {allEvents.length === 0 ? (
            <Link to="/events/new" className="gradient-purple-primary text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus size={16} /> Create Event
            </Link>
          ) : (
            <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="text-[#6E3482] font-semibold hover:text-[#49225B] transition-colors">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div key={event.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>{event.name}</h3>
                    {event.type === 'MULTI_FUNCTION' && (
                      <span className="text-xs bg-[#F3E8FF] text-[#6E3482] px-2 py-0.5 rounded-full font-semibold">
                        {event._count?.functions ?? 0} Functions
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{event.eventType ?? 'Event'}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {event.startDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{fmtDate(event.startDate)}{event.endDate && event.endDate !== event.startDate ? ` – ${fmtDate(event.endDate)}` : ''}</span>
                  </div>
                )}
                {(event.venueName || event.location) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{[event.venueName, event.location].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {event.guestCount && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} className="text-gray-400" />
                    <span>{event.guestCount} guests</span>
                  </div>
                )}
              </div>

              {/* Budget */}
              <div className="flex items-center justify-between py-3 px-4 bg-[#F5EBFA] rounded-xl mb-4">
                <span className="text-sm font-medium text-gray-600">Budget</span>
                <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono' }}>
                  {fmtBudget(event.totalBudget)}
                </span>
              </div>

              {/* Bookings count */}
              {event._count?.bookings > 0 && (
                <p className="text-xs text-gray-500 mb-3">{event._count.bookings} booking{event._count.bookings !== 1 ? 's' : ''}</p>
              )}

              <div className="flex gap-2">
                <Link to={`/events/${event.id}`} className="flex-1 text-center px-4 py-2.5 gradient-purple-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 active:scale-95">
                  View Details
                </Link>
                <Link to={`/risk/${event.id}`} className="px-4 py-2.5 border border-[#A56ABD] text-[#6E3482] font-semibold rounded-xl hover:bg-[#F5EBFA] transition-all duration-200 active:scale-95">
                  Risk
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
