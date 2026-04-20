// src/app/pages/client/ClientEventDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { Calendar, MapPin, Users, ArrowLeft, UserCheck, ShoppingBag, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { events as eventsApi, bookings as bookingsApi, planners, type Event, type Booking } from '../../../lib/api';
import { toast } from 'sonner';

export const ClientEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading]     = useState(true);
  const [event, setEvent]         = useState<Event | null>(null);
  const [eventBookings, setEventBookings] = useState<Booking[]>([]);
  const [hireRequest, setHireRequest]     = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'planner'>('overview');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      eventsApi.get(id),
      bookingsApi.list(),
      planners.getHireRequest(id),
    ]).then(([ev, bkList, hrRes]) => {
      setEvent(ev);
      setEventBookings(bkList.filter((b: Booking) => b.eventId === id));
      setHireRequest(hrRes.request);
    }).catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return <div className="max-w-4xl mx-auto space-y-6"><SkeletonCard /><SkeletonCard /></div>;
  if (!event) return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-12 text-center shadow-md">
      <p className="text-gray-500 mb-4">Event not found</p>
      <Link to="/client/events" className="text-[#6E3482] font-semibold">← My Events</Link>
    </div>
  );

  const isManaged = !!event.plannerId;
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'bookings', label: `Bookings (${eventBookings.length})` },
    { key: 'planner',  label: isManaged ? 'Planner' : 'Planning Mode' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/client/events"
        className="inline-flex items-center gap-2 text-[#6E3482] font-semibold hover:underline text-sm">
        <ArrowLeft size={16} /> My Events
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="h-40 gradient-purple-accent" />
        <div className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {event.name}
              </h1>
              {event.eventType && (
                <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#6E3482] rounded-full text-sm font-semibold">
                  {event.eventType}
                </span>
              )}
            </div>
            {!isManaged && (
              <Link to={`/client/marketplace?type=vendor&eventId=${event.id}`}
                className="gradient-purple-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                <ShoppingBag size={16} /> Book Vendors
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-600">
            {event.startDate && (
              <span className="flex items-center gap-1.5"><Calendar size={15} className="text-[#6E3482]" /> {fmtDate(event.startDate)}</span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5"><MapPin size={15} className="text-[#6E3482]" /> {event.location}</span>
            )}
            {event.guestCount && (
              <span className="flex items-center gap-1.5"><Users size={15} className="text-[#6E3482]" /> {event.guestCount} guests</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.key ? 'bg-white text-[#49225B] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Event Name',   value: event.name },
                { label: 'Type',         value: event.eventType ?? '—' },
                { label: 'Start Date',   value: event.startDate ? fmtDate(event.startDate) : '—' },
                { label: 'End Date',     value: event.endDate   ? fmtDate(event.endDate)   : '—' },
                { label: 'Location',     value: event.location  ?? '—' },
                { label: 'Guest Count',  value: event.guestCount ? String(event.guestCount) : '—' },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-gray-500 text-xs mb-0.5">{row.label}</p>
                  <p className="font-semibold">{row.value}</p>
                </div>
              ))}
            </div>
            {event.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            )}
          </div>

          {/* Sub-events / functions */}
          {event.functions && event.functions.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Functions ({event.functions.length})
              </h2>
              <div className="space-y-3">
                {event.functions.map(fn => (
                  <div key={fn.id} className="bg-[#F3E8FF] rounded-xl p-4">
                    <p className="font-bold text-sm">{fn.name}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-600">
                      {fn.startDate && <span>📅 {fmtDate(fn.startDate)}</span>}
                      {fn.venueName && <span>📍 {fn.venueName}</span>}
                      {fn.guestCount && <span>👥 {fn.guestCount} guests</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bookings tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Bookings for this event
            </h2>
            {!isManaged && (
              <Link to={`/client/bookings/new?eventId=${event.id}`}
                className="gradient-purple-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
                + Add Vendor
              </Link>
            )}
          </div>
          {eventBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <ShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
              <p>No vendors booked yet</p>
              {!isManaged && (
                <Link to={`/client/marketplace?type=vendor`}
                  className="text-[#6E3482] font-semibold text-sm mt-2 block hover:underline">
                  Browse vendors →
                </Link>
              )}
              {isManaged && (
                <p className="text-sm mt-2">Your planner is handling vendor bookings.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {eventBookings.map(b => (
                <Link key={b.id} to={`/bookings/${b.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#F3E8FF] transition-colors">
                  <div>
                    <p className="font-semibold text-sm">{b.vendor?.businessName ?? '—'}</p>
                    <p className="text-xs text-gray-500">{b.vendor?.category} · ₹{Number(b.totalCost).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.status} />
                    <span className="text-xs text-[#6E3482] font-semibold">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Planner tab */}
      {activeTab === 'planner' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          {isManaged ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Planner Linked
              </h3>
              <p className="text-gray-500 text-sm">
                A professional planner is managing this event. They will handle all vendor bookings and coordination.
              </p>
            </div>
          ) : hireRequest ? (
            <div className="space-y-4">
              <h2 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>Planner Hire Request</h2>
              <div className={`rounded-xl p-5 border ${
                hireRequest.status === 'PENDING'  ? 'bg-amber-50  border-amber-200'  :
                hireRequest.status === 'ACCEPTED' ? 'bg-green-50  border-green-200'  :
                                                    'bg-red-50    border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {hireRequest.status === 'PENDING'  && <Clock size={20} className="text-amber-600" />}
                  {hireRequest.status === 'ACCEPTED' && <CheckCircle2 size={20} className="text-green-600" />}
                  {hireRequest.status === 'REJECTED' && <span className="text-red-500 font-bold">✕</span>}
                  <p className="font-semibold">
                    {hireRequest.status === 'PENDING'  ? 'Request sent — waiting for planner to respond'  :
                     hireRequest.status === 'ACCEPTED' ? 'Planner accepted — they are now managing your event' :
                     'Planner declined your request'}
                  </p>
                </div>
                <p className="text-sm text-gray-600">Planner: {hireRequest.planner?.businessName}</p>
              </div>
              {hireRequest.status === 'REJECTED' && (
                <Link to="/client/marketplace?type=planner"
                  className="gradient-purple-primary text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
                  <UserCheck size={16} /> Find Another Planner
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>Choose Planning Mode</h2>
              <p className="text-sm text-gray-500">You're currently managing this event yourself. You can hire a planner to take over.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-[#6E3482] bg-[#F3E8FF] rounded-xl p-5">
                  <ShoppingBag size={28} className="text-[#6E3482] mb-3" />
                  <h3 className="font-bold mb-1">Self Managed</h3>
                  <p className="text-sm text-gray-600">You book vendors directly. Full control over choices.</p>
                  <p className="text-xs text-green-600 font-semibold mt-2">Currently active</p>
                </div>
                <Link to="/client/marketplace?type=planner"
                  className="border-2 border-gray-200 hover:border-[#A56ABD] rounded-xl p-5 transition-all block">
                  <UserCheck size={28} className="text-gray-400 mb-3" />
                  <h3 className="font-bold mb-1">Hire a Planner</h3>
                  <p className="text-sm text-gray-600">Let a professional manage everything for you.</p>
                  <p className="text-xs text-[#6E3482] font-semibold mt-2">Browse planners →</p>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
