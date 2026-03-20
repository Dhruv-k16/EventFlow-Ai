// src/app/pages/planner/EventDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { Calendar, MapPin, Users, Clock, AlertTriangle, Plus, ExternalLink, LayoutGrid } from 'lucide-react';
import { events as eventsApi, bookings as bookingsApi, type Event, type Booking } from '../../../lib/api';
import { toast } from 'sonner';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab]           = useState('overview');
  const [loading, setLoading]               = useState(true);
  const [event, setEvent]                   = useState<Event | null>(null);
  const [eventBookings, setEventBookings]   = useState<Booking[]>([]);
  const [functions, setFunctions]           = useState<Event[]>([]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      try {
        const [eventRes, bookingsRes] = await Promise.all([
          eventsApi.get(id),
          bookingsApi.list({ eventId: id }),
        ]);
        if (!mounted) return;
        setEvent(eventRes);
        setEventBookings(bookingsRes);

        // Always try to load functions — even SINGLE events may have had one added
        const fnRes = await eventsApi.getFunctions(id);
        if (mounted) setFunctions(fnRes.functions);
      } catch (err: any) {
        if (mounted) toast.error('Failed to load event');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  // Always show Functions tab — empty state handles SINGLE events
  const tabs = [
    { id: 'overview',   label: 'Overview' },
    { id: 'functions',  label: functions.length > 0 ? `Functions (${functions.length})` : 'Functions' },
    { id: 'bookings',   label: `Bookings (${eventBookings.length})` },
    { id: 'financials', label: 'Financials' },
    { id: 'live',       label: 'Live Event' },
  ];

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtCurrency = (n: string | null | undefined) =>
    n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  const totalSpend = eventBookings.reduce((s, b) => s + Number(b.totalCost), 0);
  const budget     = Number(event?.totalBudget ?? 0);
  const spendPct   = budget > 0 ? Math.min(100, Math.round((totalSpend / budget) * 100)) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-2">Event not found</h2>
        <Link to="/events" className="text-[#6E3482] font-semibold">← Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>{event.name}</h1>
              {event.type === 'MULTI_FUNCTION' && (
                <span className="text-xs bg-[#F3E8FF] text-[#6E3482] px-2.5 py-1 rounded-full font-semibold">
                  {functions.length} Functions
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-gray-600">
              {event.startDate && <div className="flex items-center gap-2"><Calendar size={18} /><span>{fmtDate(event.startDate)}</span></div>}
              {event.time      && <div className="flex items-center gap-2"><Clock size={18} /><span>{event.time}</span></div>}
              {(event.venueName || event.location) && (
                <div className="flex items-center gap-2"><MapPin size={18} /><span>{[event.venueName, event.location].filter(Boolean).join(', ')}</span></div>
              )}
              {event.guestCount && <div className="flex items-center gap-2"><Users size={18} /><span>{event.guestCount} guests</span></div>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-sm font-medium text-gray-500">{event.eventType ?? 'Event'}</span>
            <div className="flex gap-2 flex-wrap">
              <Link to={`/risk/${id}`} className="px-4 py-2 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2">
                <AlertTriangle size={16} /> View Risk
              </Link>
              <Link to="/bookings/new" className="px-4 py-2 gradient-purple-primary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2">
                <Plus size={16} /> Book Vendor
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <div className="bg-white rounded-xl shadow-md sticky top-16 z-20">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id ? 'gradient-purple-primary text-white' : 'text-gray-600 hover:text-[#6E3482] hover:bg-[#F3E8FF]'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Details</h2>
              <div className="space-y-3">
                {event.eventType  && <div className="flex"><span className="w-36 text-gray-500">Type:</span><span className="font-semibold">{event.eventType}</span></div>}
                {event.venueName  && <div className="flex"><span className="w-36 text-gray-500">Venue:</span><span className="font-semibold">{event.venueName}</span></div>}
                {event.location   && <div className="flex"><span className="w-36 text-gray-500">Location:</span><span className="font-semibold">{event.location}</span></div>}
                {event.guestCount && <div className="flex"><span className="w-36 text-gray-500">Guest Count:</span><span className="font-semibold">{event.guestCount}</span></div>}
                {event.totalBudget && <div className="flex"><span className="w-36 text-gray-500">Total Budget:</span><span className="font-semibold font-mono">{fmtCurrency(event.totalBudget)}</span></div>}
                {event.description && <div className="flex"><span className="w-36 text-gray-500 shrink-0">Description:</span><span className="text-gray-700">{event.description}</span></div>}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold mb-4">Budget Overview</h3>
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" className="transform -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#6E3482" strokeWidth="12"
                        strokeDasharray={`${(spendPct / 100) * 314} 314`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold font-mono">{spendPct}%</span>
                      <span className="text-xs text-gray-400">Spent</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">Booked:</span><span className="font-mono font-semibold">₹{totalSpend.toLocaleString('en-IN')}</span></div>
                  {budget > 0 && <div className="flex justify-between"><span className="text-gray-500">Budget:</span><span className="font-mono">{fmtCurrency(event.totalBudget)}</span></div>}
                  {budget > 0 && <div className="flex justify-between"><span className="text-gray-500">Remaining:</span><span className={`font-mono font-semibold ${budget - totalSpend >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{Math.abs(budget - totalSpend).toLocaleString('en-IN')}</span></div>}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold mb-4">Bookings Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Total:</span><span className="font-semibold">{eventBookings.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Confirmed:</span><span className="font-semibold text-green-600">{eventBookings.filter(b => b.status === 'CONFIRMED').length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Pending:</span><span className="font-semibold text-amber-600">{eventBookings.filter(b => !['CONFIRMED','COMPLETED','CANCELLED','REJECTED_CAPACITY'].includes(b.status)).length}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Functions — always shown, empty state for SINGLE events */}
        {activeTab === 'functions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Functions</h2>
              <button className="gradient-purple-primary text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all">
                <Plus size={16} /> Add Function
              </button>
            </div>

            {functions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <LayoutGrid size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No functions yet</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                  {event.type === 'SINGLE'
                    ? 'This is a single event. Add functions to break it into multiple ceremonies or days.'
                    : 'No functions have been added yet.'}
                </p>
                <button className="gradient-purple-primary text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 hover:opacity-90">
                  <Plus size={16} /> Add Function
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {functions.map(fn => (
                  <div key={fn.id} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-[#A56ABD]">
                    <h3 className="font-bold text-lg mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>{fn.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {fn.startDate && <div className="flex items-center gap-2"><Calendar size={14} /><span>{fmtDate(fn.startDate)}</span></div>}
                      {(fn.venueName || fn.location) && <div className="flex items-center gap-2"><MapPin size={14} /><span>{[fn.venueName, fn.location].filter(Boolean).join(', ')}</span></div>}
                      {fn.guestCount && <div className="flex items-center gap-2"><Users size={14} /><span>{fn.guestCount} guests</span></div>}
                    </div>
                    {fn.allocatedBudget && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                        <span className="text-xs text-gray-500">Allocated Budget</span>
                        <span className="text-sm font-mono font-bold text-[#49225B]">{fmtCurrency(fn.allocatedBudget)}</span>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-400">{fn._count?.bookings ?? 0} bookings</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Vendor Bookings</h2>
              <Link to="/bookings/new" className="gradient-purple-primary text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90">
                <Plus size={16} /> New Booking
              </Link>
            </div>
            {eventBookings.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <p className="mb-4">No bookings yet for this event.</p>
                <Link to="/marketplace" className="text-[#6E3482] font-semibold hover:underline">Browse marketplace →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {eventBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-[#F3E8FF] transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 text-sm">{booking.vendor?.businessName ?? '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{booking.vendor?.category ?? '—'}</td>
                        <td className="px-6 py-4 font-mono font-bold text-[#49225B] text-sm">₹{Number(booking.totalCost).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                        <td className="px-6 py-4">
                          <Link to={`/bookings/${booking.id}`} className="text-[#6E3482] hover:underline text-sm flex items-center gap-1">
                            View <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Financials */}
        {activeTab === 'financials' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>Financial Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#F3E8FF] rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                <p className="text-2xl font-bold font-mono text-[#49225B]">{fmtCurrency(event.totalBudget)}</p>
              </div>
              <div className="bg-[#D1FAE5] rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Total Booked</p>
                <p className="text-2xl font-bold font-mono text-green-700">₹{totalSpend.toLocaleString('en-IN')}</p>
              </div>
              <div className={`${budget - totalSpend >= 0 ? 'bg-[#DBEAFE]' : 'bg-[#FEE2E2]'} rounded-xl p-4 text-center`}>
                <p className="text-sm text-gray-500 mb-1">Remaining</p>
                <p className={`text-2xl font-bold font-mono ${budget - totalSpend >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  ₹{Math.abs(budget - totalSpend).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            {eventBookings.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Per Vendor Breakdown</h3>
                {eventBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm">{b.vendor?.businessName}</p>
                      <p className="text-xs text-gray-500">{b.vendor?.category}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <StatusBadge status={b.status} />
                      <p className="font-mono font-bold text-[#49225B]">₹{Number(b.totalCost).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live */}
        {activeTab === 'live' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Live Event Dashboard</h2>
            <p className="text-gray-500">Activate the live event to track tasks and incidents in real time.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
