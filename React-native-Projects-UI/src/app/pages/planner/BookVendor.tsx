// src/app/pages/planner/BookVendor.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Search, Calendar, DollarSign, CheckCircle, ChevronRight, ChevronLeft,
  FileText, Star, Check, Package, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { events as eventsApi, marketplace, bookings as bookingsApi, vendor as vendorApi, type Event, type Vendor } from '../../../lib/api';

export const BookVendor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting]   = useState(false);

  // Data
  const [myEvents, setMyEvents]         = useState<Event[]>([]);
  const [vendors, setVendors]           = useState<Vendor[]>([]);
  const [vendorDetail, setVendorDetail] = useState<Vendor | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(false);

  // Selections
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notes, setNotes]                     = useState('');

  // Inventory selections: { [itemId]: quantity }
  const [itemSelections, setItemSelections] = useState<Record<string, number>>({});

  const categories = ['All', 'Catering', 'Decor', 'AV', 'Venue', 'Transport', 'Photography'];

  // Load events + vendors on mount
  useEffect(() => {
    if (!user?.plannerId) return;
    eventsApi.list({ plannerId: user.plannerId }).then(r => setMyEvents(r.events)).catch(() => {});
    marketplace.search().then(r => setVendors(r.vendors)).catch(() => {});
  }, [user?.plannerId]);

  // Pre-select vendor if coming from vendor profile
  useEffect(() => {
    const preId = searchParams.get('vendorId');
    if (preId && vendors.length > 0) {
      const found = vendors.find(v => v.id === preId);
      if (found) { setSelectedVendor(found); setCurrentStep(2); }
    }
  }, [vendors, searchParams]);

  // Load full vendor detail (with inventory) when vendor is selected
  useEffect(() => {
    if (!selectedVendor) return;
    setLoadingVendor(true);
    vendorApi.get(selectedVendor.id)
      .then(d => setVendorDetail(d))
      .catch(() => {})
      .finally(() => setLoadingVendor(false));
  }, [selectedVendor?.id]);

  const filteredVendors = vendors.filter(v => {
    const matchSearch = v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All' || v.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const selectedEvent = myEvents.find(e => e.id === selectedEventId);

  const handleNext = () => {
    if (currentStep === 1 && !selectedVendor) { toast.error('Please select a vendor'); return; }
    if (currentStep === 2 && !selectedEventId) { toast.error('Please select an event'); return; }
    if (currentStep === 3 && Object.values(itemSelections).every(q => q === 0)) {
      toast.error('Please select at least one item'); return;
    }
    setCurrentStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!selectedVendor || !selectedEventId) return;
    const items = Object.entries(itemSelections)
      .filter(([, qty]) => qty > 0)
      .map(([inventoryItemId, quantity]) => ({ inventoryItemId, quantity }));

    if (items.length === 0) { toast.error('Select at least one item'); return; }

    setSubmitting(true);
    try {
      await bookingsApi.create({ eventId: selectedEventId, vendorId: selectedVendor.id, items, notes: notes || undefined });
      toast.success('Booking request sent!');
      navigate('/bookings');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCost = vendorDetail?.inventory?.reduce((sum, item) => {
    const qty = itemSelections[item.id] ?? 0;
    return sum + qty * Number(item.basePrice);
  }, 0) ?? 0;

  const steps = [
    { number: 1, name: 'Select Vendor', icon: Search },
    { number: 2, name: 'Select Event', icon: Calendar },
    { number: 3, name: 'Choose Items', icon: Package },
    { number: 4, name: 'Review', icon: FileText },
  ];

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Step header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.number ? 'gradient-purple-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > step.number ? <Check size={22} /> : <step.icon size={20} />}
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-semibold ${currentStep >= step.number ? 'text-[#6E3482]' : 'text-gray-400'}`}>Step {step.number}</p>
                  <p className={`text-xs ${currentStep >= step.number ? 'text-gray-700' : 'text-gray-400'}`}>{step.name}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${currentStep > step.number ? 'gradient-purple-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Vendor */}
        {currentStep === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#49225B] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Select a Vendor</h2>
              <p className="text-gray-500">Choose from available vendors</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search vendors..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" />
              </div>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all bg-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map(v => (
                <motion.div key={v.id} whileHover={{ y: -3 }} onClick={() => setSelectedVendor(v)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                    selectedVendor?.id === v.id ? 'ring-2 ring-[#6E3482] shadow-lg' : 'border border-gray-200 hover:shadow-md'
                  }`}>
                  {selectedVendor?.id === v.id && (
                    <div className="absolute top-3 right-3 z-10 w-7 h-7 bg-[#6E3482] rounded-full flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                  <div className="h-32 gradient-purple-accent relative">
                    {v.coverImageUrl && <img src={v.coverImageUrl} alt="" className="w-full h-full object-cover absolute inset-0" />}
                    <div className="absolute bottom-3 left-4">
                      <div className="w-10 h-10 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                        {initials(v.businessName)}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm">{v.businessName}</h3>
                    <p className="text-xs text-gray-500">{v.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{Number(v.rating).toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({v.totalReviews})</span>
                      </div>
                      {v.priceRange && <span className="text-xs font-mono font-semibold text-[#6E3482]">{v.priceRange}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Event */}
        {currentStep === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#49225B] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Select Event</h2>
              <p className="text-gray-500">Which event is this booking for?</p>
            </div>
            {/* Selected vendor recap */}
            {selectedVendor && (
              <div className="bg-[#F3E8FF] rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-sm">
                  {initials(selectedVendor.businessName)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedVendor.businessName}</p>
                  <p className="text-xs text-gray-500">{selectedVendor.category}</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{Number(selectedVendor.rating).toFixed(1)}</span>
                </div>
              </div>
            )}
            {myEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">No events found. Create an event first.</p>
                <a href="/events/new" className="text-[#6E3482] font-semibold hover:underline">Create Event →</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEvents.map(ev => (
                  <div key={ev.id} onClick={() => setSelectedEventId(ev.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedEventId === ev.id ? 'border-[#6E3482] bg-[#F3E8FF]' : 'border-gray-200 hover:border-[#A56ABD]'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{ev.name}</p>
                        <p className="text-sm text-gray-500">{ev.eventType ?? 'Event'}</p>
                        {ev.startDate && <p className="text-xs text-gray-400 mt-1">{new Date(ev.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                        {ev.location && <p className="text-xs text-gray-400">{ev.location}</p>}
                      </div>
                      {selectedEventId === ev.id && (
                        <div className="w-6 h-6 bg-[#6E3482] rounded-full flex items-center justify-center shrink-0">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes for vendor (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all"
                placeholder="Special requirements, preferences, questions..." />
            </div>
          </motion.div>
        )}

        {/* Step 3: Choose Items */}
        {currentStep === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#49225B] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Choose Items</h2>
                <p className="text-gray-500">Select what you need from {selectedVendor?.businessName}</p>
              </div>
              {totalCost > 0 && (
                <div className="bg-[#F3E8FF] rounded-xl px-4 py-2 text-right">
                  <p className="text-xs text-gray-500">Estimated</p>
                  <p className="font-bold font-mono text-[#49225B]">₹{totalCost.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
            {loadingVendor ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-[#6E3482]" />
              </div>
            ) : !vendorDetail?.inventory || vendorDetail.inventory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>This vendor has no inventory listed.</p>
                <p className="text-sm mt-1">You can still send a booking request — just proceed to review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendorDetail.inventory.map(item => {
                  const qty = itemSelections[item.id] ?? 0;
                  return (
                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${qty > 0 ? 'border-[#6E3482] bg-[#F3E8FF]' : 'border-gray-200'}`}>
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-200">
                        <Package size={18} className="text-[#6E3482]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">₹{Number(item.basePrice).toLocaleString('en-IN')} / {item.unit} · Max: {item.totalQuantity}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setItemSelections(p => ({ ...p, [item.id]: Math.max(0, (p[item.id] ?? 0) - 1) }))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold transition-colors">
                          −
                        </button>
                        <span className="w-8 text-center font-bold font-mono">{qty}</span>
                        <button onClick={() => setItemSelections(p => ({ ...p, [item.id]: Math.min(item.totalQuantity, (p[item.id] ?? 0) + 1) }))}
                          className="w-8 h-8 rounded-full border border-[#6E3482] text-[#6E3482] flex items-center justify-center font-bold hover:bg-[#F3E8FF] transition-colors">
                          +
                        </button>
                        {qty > 0 && (
                          <span className="text-xs font-mono font-semibold text-[#49225B] ml-1 min-w-[60px] text-right">
                            ₹{(qty * Number(item.basePrice)).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#49225B] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Review Booking</h2>
              <p className="text-gray-500">Confirm your booking details before submitting</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-2 font-semibold">Vendor</p>
                <p className="font-bold">{selectedVendor?.businessName}</p>
                <p className="text-sm text-gray-500">{selectedVendor?.category}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-2 font-semibold">Event</p>
                <p className="font-bold">{selectedEvent?.name}</p>
                {selectedEvent?.startDate && <p className="text-sm text-gray-500">{new Date(selectedEvent.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                {selectedEvent?.location && <p className="text-sm text-gray-500">{selectedEvent.location}</p>}
              </div>
            </div>

            {/* Selected items */}
            {vendorDetail?.inventory && Object.values(itemSelections).some(q => q > 0) && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-3 font-semibold">Items Selected</p>
                <div className="space-y-2">
                  {vendorDetail.inventory.filter(i => (itemSelections[i.id] ?? 0) > 0).map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-[#F3E8FF] rounded-lg px-4 py-2.5">
                      <div>
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="text-gray-500 text-xs ml-2">× {itemSelections[item.id]}</span>
                      </div>
                      <span className="font-mono font-bold text-[#49225B] text-sm">
                        ₹{(itemSelections[item.id] * Number(item.basePrice)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-[#49225B] rounded-lg px-4 py-3 mt-2">
                    <span className="text-white font-semibold">Estimated Total</span>
                    <span className="font-mono font-bold text-white text-lg">₹{totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}

            {notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-1 font-semibold">Notes</p>
                <p className="text-sm text-gray-700">{notes}</p>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-800">📋 This will send a <strong>booking request</strong> to the vendor. They'll review it and schedule a meeting with you before confirming.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
        <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
          <ChevronLeft size={20} /> Back
        </button>
        {currentStep < 4 ? (
          <button onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all">
            Next <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
            {submitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : <><CheckCircle size={20} /> Submit Booking Request</>}
          </button>
        )}
      </motion.div>
    </div>
  );
};
