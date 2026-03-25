// src/app/pages/shared/BookingDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { Calendar, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { bookings as bookingsApi, meetings as meetingsApi, type Booking, type MeetingRecord } from '../../../lib/api';
import { toast } from 'sonner';

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading]       = useState(true);
  const [booking, setBooking]       = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [schedulingMeeting, setSchedulingMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const data = await bookingsApi.get(id);
      setBooking(data);
    } catch {
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const advanceStatus = async (newStatus: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await bookingsApi.updateStatus(id, newStatus);
      setBooking(updated);
      toast.success(`Booking ${newStatus.toLowerCase().replace('_', ' ')}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update booking');
    } finally {
      setActionLoading(false);
    }
  };

  const scheduleMeeting = async (phase: number) => {
    if (!id || !meetingDate) { toast.error('Meeting date is required'); return; }
    setActionLoading(true);
    try {
      const res = await meetingsApi.schedule({
        bookingId: id,
        phase,
        scheduledAt: new Date(meetingDate).toISOString(),
        meetingLink: meetingLink || undefined,
      });
      toast.success(`Meeting scheduled — booking moved to ${res.bookingStatus}`);
      setSchedulingMeeting(false);
      setMeetingDate(''); setMeetingLink('');
      await load();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to schedule meeting');
    } finally {
      setActionLoading(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="max-w-4xl mx-auto space-y-6"><SkeletonCard /><SkeletonCard /></div>;
  if (!booking) return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-12 text-center shadow-md">
      <p className="text-gray-500 mb-4">Booking not found</p>
      <Link to="/bookings" className="text-[#6E3482] font-semibold">← Back to Bookings</Link>
    </div>
  );

  const meetings: MeetingRecord[] = booking.MeetingRecord ?? [];

  // What actions are available per role + status
  const isVendor  = user?.role === 'VENDOR';
  const isPlanner = user?.role === 'PLANNER';

  const canScheduleP1 = (isVendor || isPlanner) && booking.status === 'REQUESTED';
  const canScheduleP2 = (isVendor || isPlanner) && booking.status === 'CONFIRMATION_PENDING';
  const canCancel     = (isPlanner) && !['COMPLETED','CANCELLED','REJECTED_CAPACITY'].includes(booking.status);
  const canReject     = isVendor && booking.status === 'REQUESTED';
  const canVendorCancel = isVendor && ['MEETING_PHASE_1','CONFIRMATION_PENDING','MEETING_PHASE_2','CONFIRMED'].includes(booking.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/bookings" className="inline-flex items-center gap-2 text-[#6E3482] font-semibold hover:underline text-sm">
        <ArrowLeft size={16} /> Back to Bookings
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="text-xs font-mono text-gray-400 mb-2">Booking #{id?.slice(0, 8)}</p>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {booking.event?.name ?? 'Booking'}
            </h1>
            <p className="text-gray-600">
              {isVendor ? `Planner event` : `Vendor: ${booking.vendor?.businessName}`}
              {booking.vendor?.category && <span className="ml-2 text-xs bg-[#F3E8FF] text-[#6E3482] px-2 py-0.5 rounded-full">{booking.vendor.category}</span>}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Amount hero */}
        <div className="bg-[#F3E8FF] rounded-xl p-6 mb-6">
          <p className="text-4xl font-bold text-[#49225B] font-mono mb-1" style={{ fontFamily: 'JetBrains Mono' }}>
            ₹{Number(booking.totalCost).toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-500">Total Booking Value</p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Event</p>
            <p className="font-bold">{booking.event?.name ?? '—'}</p>
            {booking.event?.startDate && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={13} /> {new Date(booking.event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Vendor</p>
            <p className="font-bold">{booking.vendor?.businessName ?? '—'}</p>
            <p className="text-sm text-gray-500">{booking.vendor?.category}</p>
          </div>
          {booking.notes && (
            <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Notes</p>
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Items */}
        {booking.items && booking.items.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Items</h2>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {booking.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm font-medium">{item.inventoryItem?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm font-mono">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm font-mono">₹{Number(item.priceAtBooking).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm font-mono font-bold">
                        ₹{(item.quantity * Number(item.priceAtBooking)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-3 text-sm font-bold text-right">Total</td>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-[#49225B]">
                      ₹{Number(booking.totalCost).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Meetings */}
        {meetings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Meetings</h2>
            <div className="space-y-3">
              {meetings.map(m => (
                <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-semibold text-sm">Phase {m.phase} Meeting</p>
                    <p className="text-xs text-gray-500">{fmtDate(m.scheduledAt)}</p>
                    {m.meetingLink && (
                      <a href={m.meetingLink} target="_blank" rel="noreferrer"
                        className="text-xs text-[#6E3482] flex items-center gap-1 hover:underline mt-0.5">
                        <ExternalLink size={11} /> Join Meeting
                      </a>
                    )}
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking lifecycle info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-800">
          <p className="font-semibold mb-1">Booking Lifecycle</p>
          <p className="text-xs">REQUESTED → Meeting 1 → CONFIRMED → Meeting 2 → COMPLETED</p>
          <p className="text-xs mt-1">Current: <strong>{booking.status}</strong></p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 pt-6 border-t border-gray-100">

          {/* Schedule Phase 1 */}
          {canScheduleP1 && !schedulingMeeting && (
            <button onClick={() => setSchedulingMeeting(true)}
              className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
              Schedule Phase 1 Meeting
            </button>
          )}

          {/* Schedule Phase 2 */}
          {canScheduleP2 && !schedulingMeeting && (
            <button onClick={() => setSchedulingMeeting(true)}
              className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
              Schedule Phase 2 Meeting
            </button>
          )}

          {/* Meeting scheduler form */}
          {schedulingMeeting && (
            <div className="bg-[#F3E8FF] rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm">Schedule Meeting</h3>
              <input type="datetime-local" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all text-sm" />
              <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)}
                placeholder="Meeting link (optional)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all text-sm" />
              <div className="flex gap-3">
                <button onClick={() => setSchedulingMeeting(false)}
                  className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={() => scheduleMeeting(canScheduleP1 ? 1 : 2)}
                  disabled={actionLoading}
                  className="flex-1 gradient-purple-primary text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Confirm Schedule
                </button>
              </div>
            </div>
          )}

          {/* Cancel booking */}
          {canCancel && (
            <button onClick={() => advanceStatus('CANCELLED')} disabled={actionLoading}
              className="border border-red-200 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              Cancel Booking
            </button>
          )}

          {canReject && (
            <button onClick={() => advanceStatus('REJECTED_CAPACITY')} disabled={actionLoading}
              className="border border-red-200 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              Reject Booking
            </button>
          )}

          {canVendorCancel && (
            <button onClick={() => advanceStatus('CANCELLED')} disabled={actionLoading}
              className="border border-red-200 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              Cancel Booking
            </button>
          )}

          {user?.role === 'CLIENT' && (
            <p className="text-sm text-gray-500 text-center">Contact your planner to make changes to this booking.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
