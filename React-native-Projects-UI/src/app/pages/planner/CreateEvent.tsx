// src/app/pages/planner/CreateEvent.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Check, Loader2, Calendar, DollarSign, Sparkles, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { events as eventsApi } from '../../../lib/api';

interface EventFunction {
  id: string; name: string; date: string;
  venue: string; guests: string; budgetAllocation: string;
}

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep]       = useState(1);
  const [loading, setLoading]               = useState(false);
  const [eventStructure, setEventStructure] = useState<'single' | 'multi' | null>(null);
  const [formData, setFormData] = useState({
    name: '', type: '', description: '',
    startDate: '', endDate: '', venueName: '', location: '', guests: '', budget: '',
  });
  const [functions, setFunctions] = useState<EventFunction[]>([
    { id: '1', name: '', date: '', venue: '', guests: '', budgetAllocation: '' },
  ]);

  const addFunction = () =>
    setFunctions(p => [...p, { id: Date.now().toString(), name: '', date: '', venue: '', guests: '', budgetAllocation: '' }]);
  const removeFunction = (id: string) =>
    setFunctions(p => p.length > 1 ? p.filter(f => f.id !== id) : p);
  const updateFunction = (id: string, field: keyof EventFunction, value: string) =>
    setFunctions(p => p.map(f => f.id === id ? { ...f, [field]: value } : f));

  const steps = eventStructure === 'multi'
    ? ['Event Basics', 'Structure', 'Functions', 'Budget & Review']
    : ['Event Basics', 'Structure', 'Date & Venue', 'Budget & Review'];

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) { toast.error('Event name is required'); return; }
    if (currentStep === 2 && !eventStructure)        { toast.error('Please select an event structure'); return; }
    if (currentStep === 3 && eventStructure === 'multi' && functions.some(f => !f.name.trim())) {
      toast.error('Every function needs a name'); return;
    }
    if (currentStep === 3 && eventStructure === 'single' && !formData.startDate) {
      toast.error('Start date is required'); return;
    }
    setCurrentStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!user?.id) { toast.error('Not authenticated'); return; }
    setLoading(true);
    try {
      const created = await eventsApi.create({
        name:        formData.name.trim(),
        eventType:   formData.type        || undefined,
        description: formData.description || undefined,
        type:        eventStructure === 'multi' ? 'MULTI_FUNCTION' : 'SINGLE',
        date:        formData.startDate   || undefined,
        endDate:     formData.endDate     || formData.startDate || undefined,
        venueName:   formData.venueName   || undefined,
        location:    formData.location    || undefined,
        guestCount:  formData.guests  ? parseInt(formData.guests)   : undefined,
        totalBudget: formData.budget  ? parseFloat(formData.budget) : undefined,
        clientId:    user.id,
        plannerId:   user.plannerId ?? undefined,
        functions: eventStructure === 'multi'
          ? functions.filter(f => f.name.trim()).map(f => ({
              name:            f.name.trim(),
              date:            f.date   || undefined,
              location:        f.venue  || undefined,
              guestCount:      f.guests ? parseInt(f.guests)            : undefined,
              allocatedBudget: f.budgetAllocation ? parseFloat(f.budgetAllocation) : undefined,
            }))
          : undefined,
      });
      toast.success('Event created!');
      navigate(`/events/${created.id}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const upd = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Create New Event</h1>
        <p className="text-gray-500">Set up your event — single or multi-function</p>
      </motion.div>

      {/* Step indicator */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep > idx + 1 ? 'bg-green-500 text-white' :
                  currentStep === idx + 1 ? 'gradient-purple-primary text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > idx + 1 ? <Check size={18} /> : idx + 1}
                </div>
                <p className={`text-xs mt-2 font-semibold text-center ${currentStep === idx + 1 ? 'text-[#6E3482]' : 'text-gray-400'}`}>{step}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${currentStep > idx + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basics */}
      {currentStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-5">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Basics</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
            <input type="text" value={formData.name} onChange={e => upd('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              placeholder="e.g., Sharma Wedding" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
            <select value={formData.type} onChange={e => upd('type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all">
              <option value="">Select type...</option>
              {['Wedding','Corporate','Birthday','Concert','Conference','Festival','Other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea value={formData.description} onChange={e => upd('description', e.target.value)} rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              placeholder="Describe the event..." />
          </div>
        </motion.div>
      )}

      {/* Step 2: Single vs Multi */}
      {currentStep === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Does this event have multiple functions?</h2>
          <p className="text-gray-500 mb-6">Choose the structure that best fits your event</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button whileHover={{ y: -4 }} onClick={() => setEventStructure('single')}
              className={`p-6 border-2 rounded-2xl text-left transition-all ${eventStructure === 'single' ? 'border-[#6E3482] bg-[#F3E8FF]' : 'border-gray-200 hover:border-[#A56ABD]'}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Single Event</h3>
              <p className="text-sm text-gray-600">One date, one venue, one flow</p>
              <p className="text-xs text-gray-400 mt-2">Birthday, conference, corporate gala</p>
              {eventStructure === 'single' && <div className="mt-3 flex items-center gap-1 text-[#6E3482] text-sm font-semibold"><Check size={16} /> Selected</div>}
            </motion.button>
            <motion.button whileHover={{ y: -4 }} onClick={() => setEventStructure('multi')}
              className={`p-6 border-2 rounded-2xl text-left transition-all ${eventStructure === 'multi' ? 'border-[#6E3482] bg-[#F3E8FF]' : 'border-gray-200 hover:border-[#A56ABD]'}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                <Sparkles className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Multi-Function Event</h3>
              <p className="text-sm text-gray-600">Multiple ceremonies within one occasion</p>
              <p className="text-xs text-gray-400 mt-2">Wedding (Haldi, Sangeet, Reception)</p>
              {eventStructure === 'multi' && <div className="mt-3 flex items-center gap-1 text-[#6E3482] text-sm font-semibold"><Check size={16} /> Selected</div>}
            </motion.button>
          </div>
          <div className="mt-4 p-4 bg-[#F3E8FF] rounded-xl">
            <p className="text-sm text-gray-700">💡 You can always add functions later from the event detail page.</p>
          </div>
        </motion.div>
      )}

      {/* Step 3a: Functions (multi) */}
      {currentStep === 3 && eventStructure === 'multi' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Add your functions</h2>
              <p className="text-sm text-gray-500 mt-1">Each function can have its own date, venue, and vendors.</p>
            </div>
            <button onClick={addFunction}
              className="flex items-center gap-2 px-4 py-2 gradient-purple-primary text-white rounded-xl font-semibold text-sm hover:opacity-90">
              <Plus size={16} /> Add Function
            </button>
          </div>

          {/* Quick-add pills for weddings */}
          {(formData.type === 'Wedding' || !formData.type) && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {['Haldi', 'Mehendi', 'Sangeet', 'Ring Ceremony', 'Reception'].map(name => {
                  const added = functions.some(f => f.name === name);
                  return (
                    <button key={name} onClick={() => {
                      if (!added) setFunctions(p => [...p.filter(f => f.name.trim()), { id: Date.now().toString(), name, date: '', venue: '', guests: '', budgetAllocation: '' }]);
                      else setFunctions(p => p.filter(f => f.name !== name));
                    }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${added ? 'bg-[#6E3482] text-white border-[#6E3482]' : 'border-dashed border-[#A56ABD] text-[#6E3482] hover:bg-[#F3E8FF]'}`}>
                      {added ? '✓ ' : '+ '}{name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {functions.map((fn, idx) => (
              <div key={fn.id} className="border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Function {idx + 1}</span>
                  {functions.length > 1 && (
                    <button onClick={() => removeFunction(fn.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Function Name *</label>
                    <input type="text" value={fn.name} onChange={e => updateFunction(fn.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      placeholder="e.g., Haldi Ceremony, Sangeet Night" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input type="date" value={fn.date} onChange={e => updateFunction(fn.id, 'date', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Guests</label>
                    <input type="number" value={fn.guests} onChange={e => updateFunction(fn.id, 'guests', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" placeholder="e.g., 200" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Venue</label>
                    <input type="text" value={fn.venue} onChange={e => updateFunction(fn.id, 'venue', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" placeholder="e.g., Grand Hyatt Mumbai" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 3b: Date & Venue (single) */}
      {currentStep === 3 && eventStructure === 'single' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-5">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Date & Venue</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
              <input type="date" value={formData.startDate} onChange={e => upd('startDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => upd('endDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Venue Name</label>
            <input type="text" value={formData.venueName} onChange={e => upd('venueName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" placeholder="e.g., Grand Palace" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location / City</label>
            <input type="text" value={formData.location} onChange={e => upd('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" placeholder="e.g., Mumbai" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Count</label>
            <input type="number" value={formData.guests} onChange={e => upd('guests', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" placeholder="e.g., 500" />
          </div>
        </motion.div>
      )}

      {/* Step 4: Budget & Review */}
      {currentStep === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Budget & Review</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Budget (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="number" value={formData.budget} onChange={e => upd('budget', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all font-mono" placeholder="e.g., 2000000" />
            </div>
          </div>
          {eventStructure === 'multi' && formData.budget && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Allocate budget to functions (optional)</h3>
              <div className="space-y-3">
                {functions.map((fn, idx) => (
                  <div key={fn.id} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 w-40 truncate">{fn.name || `Function ${idx + 1}`}</span>
                    <input type="number" value={fn.budgetAllocation} onChange={e => updateFunction(fn.id, 'budgetAllocation', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none font-mono text-sm" placeholder="₹ amount" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-[#F3E8FF] rounded-xl p-6 space-y-3">
            <h3 className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-semibold">{formData.name}</span></div>
              <div><span className="text-gray-500">Type:</span> <span className="font-semibold">{formData.type || '—'}</span></div>
              <div><span className="text-gray-500">Structure:</span> <span className="font-semibold capitalize">{eventStructure} event</span></div>
              {eventStructure === 'single' && <>
                <div><span className="text-gray-500">Date:</span> <span className="font-semibold">{formData.startDate || '—'}</span></div>
                <div><span className="text-gray-500">Guests:</span> <span className="font-semibold">{formData.guests || '—'}</span></div>
              </>}
              {eventStructure === 'multi' && (
                <div className="col-span-2"><span className="text-gray-500">Functions:</span> <span className="font-semibold">{functions.filter(f => f.name).map(f => f.name).join(', ')}</span></div>
              )}
              {formData.budget && <div><span className="text-gray-500">Budget:</span> <span className="font-semibold font-mono">₹{Number(formData.budget).toLocaleString('en-IN')}</span></div>}
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        {currentStep > 1 && (
          <button onClick={() => setCurrentStep(s => s - 1)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        )}
        <div className="flex-1" />
        {currentStep < 4 ? (
          <button onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all">
            Continue <ArrowRight size={20} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
            {loading ? <><Loader2 size={20} className="animate-spin" /> Creating...</> : <><Check size={20} /> Create Event</>}
          </button>
        )}
      </div>
    </div>
  );
};
