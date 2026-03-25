// src/app/pages/vendor/VendorCreateBooking.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Package, FileText, CheckCircle,
  ChevronLeft, ChevronRight, Loader2, Check,
  Calendar, MapPin, Users, Plus, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch, bookings as bookingsApi, events as eventsApi, vendor as vendorApi, type Vendor } from '../../../lib/api';

interface EventResult {
  id: string; name: string; eventType: string | null;
  startDate: string; endDate: string; location: string | null;
  venueName: string | null; guestCount: number | null;
  plannerName: string; bookingCount: number;
}

type EventMode = 'search' | 'create';

export const VendorCreateBooking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep]             = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [eventMode, setEventMode]   = useState<EventMode | null>(null);

  // Search
  const [query, setQuery]       = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults]   = useState<EventResult[]>([]);

  // Create
  const [newEvent, setNewEvent] = useState({
    name: '', eventType: '', startDate: '', endDate: '',
    venueName: '', location: '', guestCount: '',
  });
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Shared
  const [selectedEvent, setSelectedEvent] = useState<EventResult | null>(null);

  // Step 2
  const [vendorDetail, setVendorDetail]     = useState<Vendor | null>(null);
  const [itemSelections, setItemSelections] = useState<Record<string, number>>({});
  const [notes, setNotes]                   = useState('');

  const vendorId = user?.vendorId;

  useEffect(() => {
    if (step === 2 && vendorId && !vendorDetail) {
      vendorApi.get(vendorId).then(setVendorDetail).catch(() => toast.error('Failed to load inventory'));
    }
  }, [step, vendorId]);

  const search = async () => {
    setSearching(true);
    try {
      const res = await apiFetch<{ events: EventResult[] }>(
        `/api/events/search?q=${encodeURIComponent(query)}&upcoming=true`
      );
      setResults(res.events);
      if (res.events.length === 0) toast.info('No upcoming events found');
    } catch (err: any) { toast.error(err.message ?? 'Search failed'); }
    finally { setSearching(false); }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.name.trim()) { toast.error('Event name is required'); return; }
    if (!newEvent.startDate)   { toast.error('Start date is required'); return; }
    if (!user?.id)             { toast.error('Not authenticated'); return; }
    setCreatingEvent(true);
    try {
      const created = await eventsApi.create({
        name: newEvent.name.trim(), eventType: newEvent.eventType || undefined,
        date: newEvent.startDate, endDate: newEvent.endDate || newEvent.startDate,
        venueName: newEvent.venueName || undefined, location: newEvent.location || undefined,
        guestCount: newEvent.guestCount ? parseInt(newEvent.guestCount) : undefined,
        clientId: user.id, type: 'SINGLE',
      });
      setSelectedEvent({
        id: created.id, name: created.name, eventType: created.eventType ?? null,
        startDate: created.startDate, endDate: created.endDate,
        location: created.location ?? null, venueName: created.venueName ?? null,
        guestCount: created.guestCount ?? null, plannerName: 'You (Vendor)', bookingCount: 0,
      });
      toast.success(`Event "${created.name}" created`);
      setStep(2);
    } catch (err: any) { toast.error(err.message ?? 'Failed to create event'); }
    finally { setCreatingEvent(false); }
  };

  const totalCost = vendorDetail?.inventory?.reduce((s, item) =>
    s + (itemSelections[item.id] ?? 0) * Number(item.basePrice), 0) ?? 0;

  const handleNext = () => {
    if (step === 1) { if (!selectedEvent) { toast.error('Select or create an event'); return; } setStep(2); return; }
    if (step === 2 && Object.values(itemSelections).every(q => q === 0)) { toast.error('Select at least one item'); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!selectedEvent || !vendorId) return;
    const items = Object.entries(itemSelections).filter(([,q]) => q > 0).map(([inventoryItemId, quantity]) => ({ inventoryItemId, quantity }));
    if (items.length === 0) { toast.error('Select at least one item'); return; }
    setSubmitting(true);
    try {
      const booking = await bookingsApi.create({ eventId: selectedEvent.id, vendorId, items, notes: notes || undefined });
      toast.success('Booking created!');
      navigate(`/bookings/${booking.id}`);
    } catch (err: any) { toast.error(err.message ?? 'Failed to create booking'); }
    finally { setSubmitting(false); }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const upd = (k: string, v: string) => setNewEvent(p => ({ ...p, [k]: v }));
  const steps = [{ n: 1, label: 'Event', icon: Calendar }, { n: 2, label: 'Items', icon: Package }, { n: 3, label: 'Review', icon: FileText }];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Create Booking</h1>
        <p className="text-gray-500 mt-1">Book your services for an event</p>
      </motion.div>

      {/* Steps */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'gradient-purple-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                  {step > s.n ? <Check size={22} /> : <s.icon size={20} />}
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-semibold ${step >= s.n ? 'text-[#6E3482]' : 'text-gray-400'}`}>Step {s.n}</p>
                  <p className={`text-xs ${step >= s.n ? 'text-gray-700' : 'text-gray-400'}`}>{s.label}</p>
                </div>
              </div>
              {idx < steps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded-full ${step > s.n ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

            {/* Selected event recap */}
            {selectedEvent && (
              <div className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-semibold uppercase">Selected Event</p>
                    <h3 className="font-bold text-lg text-gray-900">{selectedEvent.name}</h3>
                    <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={13} /> {fmtDate(selectedEvent.startDate)}</span>
                      {(selectedEvent.venueName || selectedEvent.location) && <span className="flex items-center gap-1"><MapPin size={13} /> {[selectedEvent.venueName, selectedEvent.location].filter(Boolean).join(', ')}</span>}
                      {selectedEvent.guestCount && <span className="flex items-center gap-1"><Users size={13} /> {selectedEvent.guestCount} guests</span>}
                    </div>
                  </div>
                  <button onClick={() => { setSelectedEvent(null); setEventMode(null); }}
                    className="text-xs text-[#6E3482] font-semibold border border-[#A56ABD] px-3 py-1.5 rounded-lg hover:bg-[#F3E8FF] transition-all">
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Mode picker */}
            {!selectedEvent && !eventMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button whileHover={{ y: -4 }} onClick={() => setEventMode('search')}
                  className="bg-white rounded-2xl shadow-md p-6 text-left border-2 border-transparent hover:border-[#A56ABD] transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4"><Search className="text-white" size={24} /></div>
                  <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Book an Existing Event</h3>
                  <p className="text-sm text-gray-500">Find an upcoming event on the platform and offer your services to the planner</p>
                </motion.button>
                <motion.button whileHover={{ y: -4 }} onClick={() => setEventMode('create')}
                  className="bg-white rounded-2xl shadow-md p-6 text-left border-2 border-transparent hover:border-[#A56ABD] transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4"><Sparkles className="text-white" size={24} /></div>
                  <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Create a New Event</h3>
                  <p className="text-sm text-gray-500">A client approached you directly — create the event and add your services in one step</p>
                </motion.button>
              </div>
            )}

            {/* Search panel */}
            {eventMode === 'search' && !selectedEvent && (
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Find Existing Event</h2>
                  <button onClick={() => setEventMode(null)} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      placeholder="Search by name, type, or location..." />
                  </div>
                  <button onClick={search} disabled={searching}
                    className="gradient-purple-primary text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                    {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Search
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 self-center">Quick:</span>
                  {['Wedding','Corporate','Birthday','Conference'].map(t => (
                    <button key={t} onClick={() => setQuery(t)} className="px-3 py-1.5 text-xs font-medium border border-dashed border-[#A56ABD] text-[#6E3482] rounded-full hover:bg-[#F3E8FF]">{t}</button>
                  ))}
                  <button onClick={() => { setQuery(''); search(); }} className="px-3 py-1.5 text-xs font-medium bg-[#F3E8FF] text-[#6E3482] rounded-full">All upcoming</button>
                </div>
                {results.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {results.map(ev => (
                      <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                        className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#A56ABD] cursor-pointer transition-all hover:bg-gray-50">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900">{ev.name}</p>
                          {ev.eventType && <span className="text-xs bg-[#F3E8FF] text-[#6E3482] px-2 py-0.5 rounded-full">{ev.eventType}</span>}
                          <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {fmtDate(ev.startDate)}</span>
                            {(ev.venueName || ev.location) && <span className="flex items-center gap-1"><MapPin size={10} /> {[ev.venueName, ev.location].filter(Boolean).join(', ')}</span>}
                            {ev.guestCount && <span className="flex items-center gap-1"><Users size={10} /> {ev.guestCount} guests</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Planner: {ev.plannerName} · {ev.bookingCount} booking{ev.bookingCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !searching && (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <Search size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Search for events above</p>
                  </div>
                )}
              </div>
            )}

            {/* Create panel */}
            {eventMode === 'create' && !selectedEvent && (
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Create New Event</h2>
                  <button onClick={() => setEventMode(null)} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
                  <input type="text" value={newEvent.name} onChange={e => upd('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    placeholder="e.g., Sharma Wedding Reception" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                    <select value={newEvent.eventType} onChange={e => upd('eventType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all">
                      <option value="">Select...</option>
                      {['Wedding','Corporate','Birthday','Concert','Conference','Festival','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Count</label>
                    <input type="number" value={newEvent.guestCount} onChange={e => upd('guestCount', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" placeholder="300" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                    <input type="date" value={newEvent.startDate} onChange={e => upd('startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input type="date" value={newEvent.endDate} onChange={e => upd('endDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Venue Name</label>
                  <input type="text" value={newEvent.venueName} onChange={e => upd('venueName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" placeholder="e.g., Grand Hyatt Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location / City</label>
                  <input type="text" value={newEvent.location} onChange={e => upd('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" placeholder="e.g., Mumbai" />
                </div>
                <button onClick={handleCreateEvent} disabled={creatingEvent || !newEvent.name.trim() || !newEvent.startDate}
                  className="w-full gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {creatingEvent ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  {creatingEvent ? 'Creating Event...' : 'Create Event & Continue'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Items */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-md p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Select Items</h2>
                <p className="text-sm text-gray-500 mt-0.5">For: <span className="font-semibold text-gray-700">{selectedEvent?.name}</span></p>
              </div>
              {totalCost > 0 && (
                <div className="bg-[#F3E8FF] rounded-xl px-4 py-2 text-right shrink-0">
                  <p className="text-xs text-gray-500">Estimated</p>
                  <p className="font-bold font-mono text-[#49225B]">₹{totalCost.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
            {!vendorDetail ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-[#6E3482]" /></div>
            ) : !vendorDetail.inventory?.length ? (
              <div className="text-center py-8 text-gray-500">
                <Package size={40} className="text-gray-300 mx-auto mb-3" />
                <p>No inventory items yet.</p>
                <button onClick={() => navigate('/vendor/inventory')} className="text-[#6E3482] font-semibold text-sm mt-2 hover:underline">Add inventory →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {vendorDetail.inventory.map(item => {
                  const qty = itemSelections[item.id] ?? 0;
                  return (
                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${qty > 0 ? 'border-[#6E3482] bg-[#F3E8FF]' : 'border-gray-200'}`}>
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200 shrink-0">
                        <Package size={18} className="text-[#6E3482]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">₹{Number(item.basePrice).toLocaleString('en-IN')} / {item.unit} · Max: {item.totalQuantity}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setItemSelections(p => ({ ...p, [item.id]: Math.max(0, (p[item.id] ?? 0) - 1) }))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold">−</button>
                        <span className="w-8 text-center font-bold font-mono">{qty}</span>
                        <button onClick={() => setItemSelections(p => ({ ...p, [item.id]: Math.min(item.totalQuantity, (p[item.id] ?? 0) + 1) }))} className="w-8 h-8 rounded-full border border-[#6E3482] text-[#6E3482] flex items-center justify-center font-bold hover:bg-[#F3E8FF]">+</button>
                        {qty > 0 && <span className="text-xs font-mono font-semibold text-[#49225B] ml-1 min-w-[70px] text-right">₹{(qty * Number(item.basePrice)).toLocaleString('en-IN')}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all"
                placeholder="Any details, special conditions, or messages..." />
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-md p-6 space-y-5">
            <h2 className="text-xl font-bold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Review Booking</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Event</p>
              <p className="font-bold text-gray-900">{selectedEvent?.name}</p>
              <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-gray-500">
                {selectedEvent?.startDate && <span className="flex items-center gap-1"><Calendar size={13} /> {fmtDate(selectedEvent.startDate)}</span>}
                {(selectedEvent?.venueName || selectedEvent?.location) && <span className="flex items-center gap-1"><MapPin size={13} /> {[selectedEvent.venueName, selectedEvent.location].filter(Boolean).join(', ')}</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">Planner: {selectedEvent?.plannerName}</p>
            </div>
            {vendorDetail?.inventory && Object.values(itemSelections).some(q => q > 0) && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Items</p>
                <div className="space-y-2">
                  {vendorDetail.inventory.filter(i => (itemSelections[i.id] ?? 0) > 0).map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-[#F3E8FF] rounded-lg px-4 py-2.5">
                      <div><span className="font-medium text-sm">{item.name}</span><span className="text-gray-500 text-xs ml-2">× {itemSelections[item.id]}</span></div>
                      <span className="font-mono font-bold text-[#49225B] text-sm">₹{(itemSelections[item.id] * Number(item.basePrice)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-[#49225B] rounded-lg px-4 py-3">
                    <span className="text-white font-semibold">Total</span>
                    <span className="font-mono font-bold text-white text-lg">₹{totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
            {notes && <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase font-semibold mb-1">Notes</p><p className="text-sm text-gray-700">{notes}</p></div>}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-800">📋 This creates a <strong>REQUESTED</strong> booking. The planner can schedule a meeting and confirm from the booking detail page.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <div className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center">
        <button onClick={() => step === 1 ? navigate('/vendor/dashboard') : setStep(s => s - 1)}
          className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          <ChevronLeft size={20} />{step === 1 ? 'Cancel' : 'Back'}
        </button>
        {step < 3 ? (
          <button onClick={handleNext} disabled={step === 1 && !selectedEvent}
            className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 transition-all">
            Continue <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
            {submitting ? 'Creating...' : 'Create Booking'}
          </button>
        )}
      </div>
    </div>
  );
};
