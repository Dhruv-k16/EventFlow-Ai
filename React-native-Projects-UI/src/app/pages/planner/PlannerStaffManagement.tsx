// src/app/pages/planner/PlannerStaffManagement.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Mail, Phone, Calendar, Loader2, Trash2, ClipboardList, MapPin, Check } from 'lucide-react';
import { plannerStaff as staffApi, events as eventsApi, staffAssignments as assignApi, type PlannerStaff, type Event, type StaffAssignment } from '../../../lib/api';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  Available: 'bg-green-500',
  Busy:      'bg-amber-500',
  'On Leave':'bg-gray-400',
};

// ── Assign Modal ──────────────────────────────────────────────────────────────
const AssignModal: React.FC<{
  member:   PlannerStaff;
  events:   Event[];
  onClose:  () => void;
  onAssign: (staffId: string) => void;
}> = ({ member, events, onClose, onAssign }) => {
  const [assignments, setAssignments]       = useState<StaffAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [task, setTask]                     = useState('');
  const [notes, setNotes]                   = useState('');
  const [saving, setSaving]                 = useState(false);
  const [removingId, setRemovingId]         = useState<string | null>(null);

  useEffect(() => {
    assignApi.list(member.id)
      .then(res => setAssignments(res.assignments))
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoadingAssignments(false));
  }, [member.id]);

  const assignedEventIds = new Set(assignments.map(a => a.event.id));
  const availableEvents  = events.filter(e => !assignedEventIds.has(e.id));

  const handleAssign = async () => {
    if (!selectedEventId) { toast.error('Select an event'); return; }
    setSaving(true);
    try {
      const created = await assignApi.assign(member.id, {
        eventId: selectedEventId,
        task:    task || undefined,
        notes:   notes || undefined,
      });
      setAssignments(prev => [...prev, created]);
      setSelectedEventId(''); setTask(''); setNotes('');
      toast.success('Assigned successfully');
      onAssign(member.id);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to assign');
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async (assignmentId: string, eventName: string) => {
    if (!confirm(`Remove from "${eventName}"?`)) return;
    setRemovingId(assignmentId);
    try {
      await assignApi.unassign(member.id, assignmentId);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast.success('Removed from event');
      onAssign(member.id);
    } catch {
      toast.error('Failed to remove assignment');
    } finally {
      setRemovingId(null);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-sm">
              {member.initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>{member.name}</h2>
              <p className="text-xs text-gray-500">{member.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current assignments */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ClipboardList size={16} className="text-[#6E3482]" />
              Current Assignments ({assignments.length})
            </h3>
            {loadingAssignments ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={24} className="animate-spin text-[#6E3482]" />
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
                Not assigned to any events yet
              </p>
            ) : (
              <div className="space-y-2">
                {assignments.map(a => (
                  <div key={a.id} className="flex items-start gap-3 bg-[#F3E8FF] rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{a.event.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 mt-0.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={11} /> {fmtDate(a.event.startDate)}
                        </span>
                        {a.event.location && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={11} /> {a.event.location}
                          </span>
                        )}
                      </div>
                      {a.task && (
                        <p className="text-xs text-[#6E3482] font-medium mt-1">
                          Task: {a.task}
                        </p>
                      )}
                      {a.notes && (
                        <p className="text-xs text-gray-500 mt-0.5 italic">{a.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnassign(a.id, a.event.name)}
                      disabled={removingId === a.id}
                      className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                      {removingId === a.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assign to new event */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#6E3482]" />
              Assign to Event
            </h3>
            {availableEvents.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
                {events.length === 0 ? 'No events found. Create an event first.' : 'Already assigned to all available events.'}
              </p>
            ) : (
              <div className="space-y-3">
                {/* Event selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Event *</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {availableEvents.map(ev => (
                      <div key={ev.id} onClick={() => setSelectedEventId(ev.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedEventId === ev.id ? 'border-[#6E3482] bg-[#F3E8FF]' : 'border-gray-200 hover:border-[#A56ABD]'
                        }`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedEventId === ev.id ? 'border-[#6E3482] bg-[#6E3482]' : 'border-gray-300'
                        }`}>
                          {selectedEventId === ev.id && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{ev.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {ev.startDate && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar size={10} /> {fmtDate(ev.startDate)}
                              </span>
                            )}
                            {ev.location && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin size={10} /> {ev.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Task / Responsibility</label>
                  <input type="text" value={task} onChange={e => setTask(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all text-sm"
                    placeholder="e.g., Coordinate catering, Manage AV setup, Client liaison" />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all text-sm resize-none"
                    placeholder="Any additional notes..." />
                </div>

                <button onClick={handleAssign} disabled={saving || !selectedEventId}
                  className="w-full gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Assign to Event
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const STATUS_COLORS_DOT: Record<string, string> = {
  Available: 'bg-green-500', Busy: 'bg-amber-500', 'On Leave': 'bg-gray-400',
};

export const PlannerStaffManagement: React.FC = () => {
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen]     = useState(false);
  const [assignTarget, setAssignTarget] = useState<PlannerStaff | null>(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [staff, setStaff]             = useState<PlannerStaff[]>([]);
  const [events, setEvents]           = useState<Event[]>([]);
  const [summary, setSummary]         = useState({ available: 0, busy: 0, onLeave: 0 });

  const [formData, setFormData] = useState({
    name: '', role: '', email: '', phone: '',
    status: 'Available' as 'Available' | 'Busy' | 'On Leave',
  });

  const load = async () => {
    try {
      const [staffRes, eventsRes] = await Promise.all([
        staffApi.list(),
        user?.plannerId ? eventsApi.list({ plannerId: user.plannerId }) : Promise.resolve({ events: [] }),
      ]);
      setStaff(staffRes.staff);
      setSummary({ available: staffRes.summary.available, busy: staffRes.summary.busy, onLeave: staffRes.summary.onLeave });
      setEvents(eventsRes.events);
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.plannerId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Name is required'); return; }
    if (!formData.role)        { toast.error('Role is required'); return; }
    setSaving(true);
    try {
      const created = await staffApi.add({
        name: formData.name.trim(), role: formData.role,
        email: formData.email || undefined, phone: formData.phone || undefined,
        status: formData.status,
      });
      setStaff(prev => [...prev, created]);
      setSummary(s => ({
        ...s,
        available: s.available + (created.status === 'Available' ? 1 : 0),
        busy:      s.busy      + (created.status === 'Busy'      ? 1 : 0),
        onLeave:   s.onLeave   + (created.status === 'On Leave'  ? 1 : 0),
      }));
      setIsAddOpen(false);
      setFormData({ name: '', role: '', email: '', phone: '', status: 'Available' });
      toast.success(`${created.name} added`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (staffId: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await staffApi.delete(staffId);
      setStaff(prev => prev.filter(s => s.id !== staffId));
      toast.success(`${name} removed`);
    } catch { toast.error('Failed to remove'); }
  };

  const handleStatusChange = async (staffId: string, newStatus: string) => {
    try {
      const updated = await staffApi.update(staffId, { status: newStatus as any });
      setStaff(prev => prev.map(s => s.id === staffId ? updated : s));
    } catch { toast.error('Failed to update status'); }
  };

  // Refresh a single staff member's assignedEvents count after assignment change
  const refreshStaff = async (staffId: string) => {
    const res = await staffApi.list();
    setStaff(res.staff);
    setSummary({ available: res.summary.available, busy: res.summary.busy, onLeave: res.summary.onLeave });
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Team Management</h1>
          <p className="text-gray-500 mt-1">{staff.length} team member{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setIsAddOpen(true)}
          className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
          <Plus size={20} /> Add Team Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Available', count: summary.available, dot: 'bg-green-500', bg: 'bg-green-100' },
          { label: 'Busy',      count: summary.busy,      dot: 'bg-amber-500', bg: 'bg-amber-100' },
          { label: 'On Leave',  count: summary.onLeave,   dot: 'bg-gray-400',  bg: 'bg-gray-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>{s.count}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center`}>
                <div className={`w-3 h-3 rounded-full ${s.dot}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty */}
      {staff.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No team members yet</p>
          <button onClick={() => setIsAddOpen(true)}
            className="gradient-purple-primary text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
            <Plus size={16} /> Add first member
          </button>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map((member, idx) => (
          <motion.div key={member.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-lg">
                {member.initials}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS_DOT[member.status] ?? 'bg-gray-400'}`} />
                <select value={member.status} onChange={e => handleStatusChange(member.id, e.target.value)}
                  className="text-xs text-gray-600 border-0 outline-none bg-transparent cursor-pointer">
                  <option>Available</option>
                  <option>Busy</option>
                  <option>On Leave</option>
                </select>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{member.name}</h3>
            <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#6E3482] text-xs font-semibold rounded-full mb-4">
              {member.role}
            </span>

            <div className="space-y-1.5 mb-4">
              {member.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={13} className="text-gray-400" /><span className="truncate">{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={13} className="text-gray-400" /><span>{member.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar size={13} className="text-gray-400" />
                  <span>{member.assignedEvents} event{member.assignedEvents !== 1 ? 's' : ''} assigned</span>
                </div>
                <button onClick={() => handleDelete(member.id, member.name)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Assign button */}
              <button onClick={() => setAssignTarget(member)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#A56ABD] text-[#6E3482] rounded-xl text-sm font-semibold hover:bg-[#F3E8FF] hover:border-[#6E3482] transition-all">
                <ClipboardList size={15} />
                Assign Event / Task
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {assignTarget && (
          <AssignModal
            member={assignTarget}
            events={events}
            onClose={() => setAssignTarget(null)}
            onAssign={refreshStaff}
          />
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsAddOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Add Team Member</h2>
                <button onClick={() => setIsAddOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={24} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                {[
                  { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Enter full name', required: true },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'email@eventflow.ai' },
                  { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 98765 00001' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                    <input type={f.type} required={f.required} value={(formData as any)[f.key]}
                      onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      placeholder={f.placeholder} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                  <select required value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all">
                    <option value="">Select role...</option>
                    {['Event Coordinator','Logistics Manager','Client Relations','Technical Lead','Marketing Specialist','Operations Manager'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all">
                    <option>Available</option><option>Busy</option><option>On Leave</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : null} Add Member
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
