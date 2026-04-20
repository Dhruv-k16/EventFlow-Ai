// src/app/pages/client/ClientCreateEvent.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, FileText, ArrowRight, ArrowLeft, Plus, Trash2, DollarSign, Sparkles, Check, Loader2 } from 'lucide-react';
import { events as eventsApi } from '../../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface EventFunction {
  id: string; name: string; date: string;
  venue: string; guests: string; budgetAllocation: string;
}

export const ClientCreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting]   = useState(false);

  const [formData, setFormData] = useState({ eventName: '', eventType: '', description: '' });
  const [eventStructure, setEventStructure] = useState<'single' | 'multi' | null>(null);
  const [functions, setFunctions] = useState<EventFunction[]>([
    { id: '1', name: '', date: '', venue: '', guests: '', budgetAllocation: '' }
  ]);
  const [eventDetails, setEventDetails] = useState({ date: '', location: '', guests: '' });
  const [budget, setBudget] = useState('');

  const eventTypes = ['Wedding','Corporate Event','Birthday Party','Anniversary','Conference','Product Launch','Festival','Other'];

  const addFunction    = () => setFunctions(prev => [...prev, { id: Date.now().toString(), name: '', date: '', venue: '', guests: '', budgetAllocation: '' }]);
  const removeFunction = (id: string) => { if (functions.length > 1) setFunctions(prev => prev.filter(f => f.id !== id)); };
  const updateFunction = (id: string, field: keyof EventFunction, value: string) =>
    setFunctions(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));

  const handleNext = () => {
    if (currentStep === 1 && (!formData.eventName || !formData.eventType)) { toast.error('Please fill in all required fields'); return; }
    if (currentStep === 2 && !eventStructure) { toast.error('Please select an event structure'); return; }
    if (currentStep === 3 && eventStructure === 'multi' && functions.some(f => !f.name.trim())) { toast.error('Please name all functions'); return; }
    if (currentStep === 4 && eventStructure === 'single' && (!eventDetails.date || !eventDetails.location)) { toast.error('Please fill in date and location'); return; }

    if (currentStep === 2 && eventStructure === 'single') setCurrentStep(4);
    else if (currentStep === 3 && eventStructure === 'multi') setCurrentStep(5);
    else setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    if (currentStep === 4 && eventStructure === 'single') setCurrentStep(2);
    else if (currentStep === 5 && eventStructure === 'multi') setCurrentStep(3);
    else setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!user?.id) { toast.error('Not authenticated'); return; }
    setSubmitting(true);
    try {
      const budgetNum = budget ? parseFloat(budget.replace(/[^0-9.]/g, '')) : undefined;

      const created = await eventsApi.create({
        name:        formData.eventName.trim(),
        eventType:   formData.eventType,
        description: formData.description || undefined,
        clientId:    user.id,
        type:        eventStructure === 'multi' ? 'MULTI_FUNCTION' : 'SINGLE',
        // Single event fields
        date:        eventStructure === 'single' ? eventDetails.date : (functions[0]?.date || new Date().toISOString().split('T')[0]),
        endDate:     eventStructure === 'single' ? eventDetails.date : undefined,
        location:    eventStructure === 'single' ? eventDetails.location : undefined,
        guestCount:  eventStructure === 'single' && eventDetails.guests ? parseInt(eventDetails.guests) : undefined,
        totalBudget: budgetNum,
        // Multi-function sub-events
        functions:   eventStructure === 'multi' ? functions.filter(f => f.name.trim()).map(f => ({
          name:       f.name.trim(),
          date:       f.date || undefined,
          venueName:  f.venue || undefined,
          guestCount: f.guests ? parseInt(f.guests) : undefined,
          allocatedBudget: f.budgetAllocation ? parseFloat(f.budgetAllocation.replace(/[^0-9.]/g, '')) : undefined,
        })) : undefined,
      });

      toast.success('Event created!');
      // Store event ID for the type selection page
      sessionStorage.setItem('newEventId', created.id);
      navigate('/client/create-event/select-type');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = eventStructure === 'single'
    ? ['Basic Details', 'Structure', 'Event Details', 'Budget', 'Review']
    : eventStructure === 'multi'
    ? ['Basic Details', 'Structure', 'Functions', 'Budget', 'Review']
    : ['Basic Details', 'Structure', 'Details', 'Budget', 'Review'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Create New Event
        </h1>
        <p className="text-gray-500">Tell us about your event</p>
      </motion.div>

      {/* Progress */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep > index + 1 ? 'bg-green-500 text-white' :
                  currentStep === index + 1 ? 'gradient-purple-primary text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > index + 1 ? <Check size={18} /> : index + 1}
                </div>
                <p className={`text-xs mt-1.5 font-semibold hidden md:block ${currentStep === index + 1 ? 'text-[#6E3482]' : 'text-gray-400'}`}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Details */}
      {currentStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Basic Event Details</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={formData.eventName}
                onChange={e => setFormData(p => ({ ...p, eventName: e.target.value }))}
                placeholder="e.g., Sharma Wedding"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
            <select value={formData.eventType} onChange={e => setFormData(p => ({ ...p, eventType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all">
              <option value="">Select event type</option>
              {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
            <textarea value={formData.description} rows={3}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell us more about your event..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all resize-none" />
          </div>
        </motion.div>
      )}

      {/* Step 2: Structure */}
      {currentStep === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'single', icon: Calendar, gradient: 'from-blue-500 to-blue-600', title: 'Single Event', desc: 'One event with a single date and venue', hint: 'Best for: Birthday parties, corporate events' },
              { key: 'multi',  icon: Sparkles, gradient: 'from-purple-500 to-pink-600', title: 'Multi-Function Event', desc: 'One main event with multiple functions', hint: 'Best for: Weddings (Haldi, Sangeet, Reception)' },
            ].map(opt => (
              <motion.button key={opt.key} whileHover={{ y: -4 }}
                onClick={() => setEventStructure(opt.key as 'single' | 'multi')}
                className={`p-6 border-2 rounded-2xl text-left transition-all ${
                  eventStructure === opt.key ? 'border-[#6E3482] bg-[#F3E8FF]' : 'border-gray-200 hover:border-[#A56ABD]'
                }`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center mb-4`}>
                  <opt.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>{opt.title}</h3>
                <p className="text-sm text-gray-600">{opt.desc}</p>
                <p className="text-xs text-gray-400 mt-2">{opt.hint}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 3: Functions (multi only) */}
      {currentStep === 3 && eventStructure === 'multi' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Configure Functions</h2>
            <button onClick={addFunction}
              className="flex items-center gap-2 px-4 py-2 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              <Plus size={18} /> Add Function
            </button>
          </div>
          <div className="space-y-5">
            {functions.map((func, index) => (
              <div key={func.id} className="border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Function {index + 1}</h3>
                  {functions.length > 1 && (
                    <button onClick={() => removeFunction(func.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Function Name *</label>
                    <input type="text" value={func.name} onChange={e => updateFunction(func.id, 'name', e.target.value)}
                      placeholder="e.g., Haldi Ceremony"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
                    <input type="date" value={func.date} onChange={e => updateFunction(func.id, 'date', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Guests</label>
                    <input type="number" value={func.guests} onChange={e => updateFunction(func.id, 'guests', e.target.value)}
                      placeholder="200"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Venue</label>
                    <input type="text" value={func.venue} onChange={e => updateFunction(func.id, 'venue', e.target.value)}
                      placeholder="e.g., Garden Area, Grand Palace"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 4: Details (single only) */}
      {currentStep === 4 && eventStructure === 'single' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Details</h2>
          {[
            { label: 'Event Date *', name: 'date', type: 'date', icon: Calendar, placeholder: '' },
            { label: 'Location *',   name: 'location', type: 'text', icon: MapPin, placeholder: 'e.g., Mumbai, India' },
            { label: 'Expected Guests', name: 'guests', type: 'number', icon: Users, placeholder: '500' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
              <div className="relative">
                <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type={f.type} value={(eventDetails as any)[f.name]}
                  onChange={e => setEventDetails(p => ({ ...p, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all" />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Step 5: Budget */}
      {(currentStep === 5 || (currentStep === 4 && eventStructure !== 'single')) && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Budget Planning</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Budget (optional)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={budget} onChange={e => setBudget(e.target.value)}
                placeholder="e.g., ₹10,00,000"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all" />
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-900">💰 You can update budget anytime from your event dashboard</p>
          </div>
        </motion.div>
      )}

      {/* Step 6: Review */}
      {currentStep === 6 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-5">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Review Your Event</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Basic Info</p>
            <p><span className="text-gray-500 text-sm">Name:</span> <span className="font-semibold">{formData.eventName}</span></p>
            <p><span className="text-gray-500 text-sm">Type:</span> <span className="font-semibold">{formData.eventType}</span></p>
            <p><span className="text-gray-500 text-sm">Structure:</span> <span className="font-semibold capitalize">{eventStructure} event</span></p>
          </div>
          {eventStructure === 'single' && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Details</p>
              <p><span className="text-gray-500 text-sm">Date:</span> <span className="font-semibold">{eventDetails.date}</span></p>
              <p><span className="text-gray-500 text-sm">Location:</span> <span className="font-semibold">{eventDetails.location}</span></p>
              {eventDetails.guests && <p><span className="text-gray-500 text-sm">Guests:</span> <span className="font-semibold">{eventDetails.guests}</span></p>}
            </div>
          )}
          {eventStructure === 'multi' && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Functions ({functions.filter(f => f.name).length})</p>
              {functions.filter(f => f.name).map(f => (
                <p key={f.id} className="text-sm font-semibold">{f.name} {f.date && `· ${f.date}`}</p>
              ))}
            </div>
          )}
          {budget && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Budget</p>
              <p className="font-bold text-lg">{budget}</p>
            </div>
          )}
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-900">✅ After creating, you'll choose whether to hire a planner or book vendors yourself.</p>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        {currentStep > 1 && (
          <button onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        )}
        <div className="flex-1" />
        {currentStep < 6 ? (
          <button onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Continue <ArrowRight size={20} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        )}
      </div>
    </div>
  );
};
