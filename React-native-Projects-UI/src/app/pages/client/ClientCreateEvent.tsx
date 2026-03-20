import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, FileText, ArrowRight, ArrowLeft, Plus, Trash2, DollarSign, Sparkles, Check } from 'lucide-react';

interface EventFunction {
  id: string;
  name: string;
  date: string;
  venue: string;
  guests: string;
  budgetAllocation: string;
}

export const ClientCreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Basic Details
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    description: ''
  });

  // Step 2: Event Structure Type
  const [eventStructure, setEventStructure] = useState<'single' | 'multi' | null>(null);

  // Step 3: Functions (for multi-function events)
  const [functions, setFunctions] = useState<EventFunction[]>([
    { id: '1', name: '', date: '', venue: '', guests: '', budgetAllocation: '' }
  ]);

  // Step 4: Date/Venue (for single events or overall event)
  const [eventDetails, setEventDetails] = useState({
    date: '',
    location: '',
    guests: ''
  });

  // Step 5: Budget
  const [budget, setBudget] = useState('');

  const eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday Party',
    'Anniversary',
    'Conference',
    'Product Launch',
    'Festival',
    'Other'
  ];

  const handleBasicDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEventDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
  };

  const addFunction = () => {
    setFunctions([...functions, { id: Date.now().toString(), name: '', date: '', venue: '', guests: '', budgetAllocation: '' }]);
  };

  const removeFunction = (id: string) => {
    if (functions.length > 1) {
      setFunctions(functions.filter(f => f.id !== id));
    }
  };

  const updateFunction = (id: string, field: keyof EventFunction, value: string) => {
    setFunctions(functions.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleNext = () => {
    if (currentStep === 1 && (!formData.eventName || !formData.eventType)) {
      alert('Please fill in all required fields');
      return;
    }
    if (currentStep === 2 && !eventStructure) {
      alert('Please select an event structure');
      return;
    }
    if (currentStep === 3 && eventStructure === 'multi') {
      const hasEmptyNames = functions.some(f => !f.name.trim());
      if (hasEmptyNames) {
        alert('Please provide a name for all functions');
        return;
      }
    }
    if (currentStep === 4 && eventStructure === 'single' && (!eventDetails.date || !eventDetails.location || !eventDetails.guests)) {
      alert('Please fill in all event details');
      return;
    }
    
    // Skip step 3 if single event
    if (currentStep === 2 && eventStructure === 'single') {
      setCurrentStep(4);
    } else if (currentStep === 3 && eventStructure === 'multi') {
      setCurrentStep(5);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 4 && eventStructure === 'single') {
      setCurrentStep(2);
    } else if (currentStep === 5 && eventStructure === 'multi') {
      setCurrentStep(3);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const eventData = {
      ...formData,
      eventStructure,
      functions: eventStructure === 'multi' ? functions : null,
      eventDetails: eventStructure === 'single' ? eventDetails : null,
      budget
    };
    
    sessionStorage.setItem('newEventData', JSON.stringify(eventData));
    navigate('/client/create-event/select-type');
  };

  const steps = eventStructure === 'single' 
    ? ['Basic Details', 'Event Structure', 'Event Details', 'Budget', 'Review']
    : eventStructure === 'multi'
    ? ['Basic Details', 'Event Structure', 'Functions', 'Budget', 'Review']
    : ['Basic Details', 'Event Structure', 'Details', 'Budget', 'Review'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Create New Event
        </h1>
        <p className="text-gray-500">Tell us about your event and we'll help you make it amazing</p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep > index + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index + 1 
                    ? 'gradient-purple-primary text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > index + 1 ? <Check size={20} /> : index + 1}
                </div>
                <p className={`text-xs mt-2 font-semibold ${currentStep === index + 1 ? 'text-[#6E3482]' : 'text-gray-400'}`}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step 1: Basic Details */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Basic Event Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name *
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleBasicDetailsChange}
                  placeholder="e.g., Sharma Wedding"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleBasicDetailsChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              >
                <option value="">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleBasicDetailsChange}
                rows={4}
                placeholder="Tell us more about your event..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Event Structure Selection */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Does this event have multiple functions or ceremonies?
          </h2>
          <p className="text-gray-500 mb-6">Choose the structure that best fits your event</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ y: -4 }}
              onClick={() => setEventStructure('single')}
              className={`p-6 border-2 rounded-2xl text-left transition-all ${
                eventStructure === 'single'
                  ? 'border-[#6E3482] bg-[#F3E8FF]'
                  : 'border-gray-200 hover:border-[#A56ABD]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Single Event
              </h3>
              <p className="text-sm text-gray-600">
                One event with a single date and venue
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Best for: Birthday parties, corporate events, simple ceremonies
              </p>
            </motion.button>

            <motion.button
              whileHover={{ y: -4 }}
              onClick={() => setEventStructure('multi')}
              className={`p-6 border-2 rounded-2xl text-left transition-all ${
                eventStructure === 'multi'
                  ? 'border-[#6E3482] bg-[#F3E8FF]'
                  : 'border-gray-200 hover:border-[#A56ABD]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                <Sparkles className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Multi-Function Event
              </h3>
              <p className="text-sm text-gray-600">
                One main event with multiple functions or ceremonies
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Best for: Weddings (Haldi, Sangeet, Reception), multi-day conferences
              </p>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Functions Management (Multi-Function Only) */}
      {currentStep === 3 && eventStructure === 'multi' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Configure Event Functions
              </h2>
              <p className="text-gray-500 text-sm">Add details for each function or ceremony</p>
            </div>
            <button
              onClick={addFunction}
              className="flex items-center gap-2 px-4 py-2 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Function
            </button>
          </div>

          <div className="space-y-6">
            {functions.map((func, index) => (
              <div key={func.id} className="border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Function {index + 1}</h3>
                  {functions.length > 1 && (
                    <button
                      onClick={() => removeFunction(func.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Function Name *
                    </label>
                    <input
                      type="text"
                      value={func.name}
                      onChange={(e) => updateFunction(func.id, 'name', e.target.value)}
                      placeholder="e.g., Haldi Ceremony, Sangeet Night, Reception"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={func.date}
                      onChange={(e) => updateFunction(func.id, 'date', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Guests (Optional)
                    </label>
                    <input
                      type="number"
                      value={func.guests}
                      onChange={(e) => updateFunction(func.id, 'guests', e.target.value)}
                      placeholder="e.g., 200"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Venue (Optional)
                    </label>
                    <input
                      type="text"
                      value={func.venue}
                      onChange={(e) => updateFunction(func.id, 'venue', e.target.value)}
                      placeholder="e.g., Garden Area, Main Hall"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-[#F3E8FF] to-[#E9D5FF] rounded-xl">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> You can add more functions later or edit these details from your event dashboard
            </p>
          </div>
        </motion.div>
      )}

      {/* Step 4: Event Details (Single Event Only) */}
      {currentStep === 4 && eventStructure === 'single' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Event Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  name="date"
                  value={eventDetails.date}
                  onChange={handleEventDetailsChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="location"
                  value={eventDetails.location}
                  onChange={handleEventDetailsChange}
                  placeholder="e.g., Mumbai, India"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expected Guests *
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="guests"
                  value={eventDetails.guests}
                  onChange={handleEventDetailsChange}
                  placeholder="e.g., 500"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 5: Budget */}
      {currentStep === 5 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Budget Planning
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Event Budget (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., ₹10,00,000"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                />
              </div>
            </div>

            {eventStructure === 'multi' && budget && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Allocate Budget to Functions (Optional)</h3>
                <div className="space-y-4">
                  {functions.map((func, index) => (
                    <div key={func.id}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {func.name || `Function ${index + 1}`}
                      </label>
                      <input
                        type="text"
                        value={func.budgetAllocation}
                        onChange={(e) => updateFunction(func.id, 'budgetAllocation', e.target.value)}
                        placeholder="e.g., ₹2,00,000"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-900">
                💰 <strong>Budget Tip:</strong> You can update your budget and allocations anytime from your event dashboard
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 6: Review */}
      {currentStep === 6 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Review Your Event
          </h2>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-700 mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Event Name</p>
                  <p className="font-semibold">{formData.eventName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event Type</p>
                  <p className="font-semibold">{formData.eventType}</p>
                </div>
                {formData.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-semibold">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Structure */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-700 mb-3">Event Structure</h3>
              <p className="font-semibold capitalize">{eventStructure} Event</p>
            </div>

            {/* Functions or Single Event Details */}
            {eventStructure === 'multi' ? (
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-bold text-gray-700 mb-3">Functions ({functions.length})</h3>
                <div className="space-y-3">
                  {functions.map((func, index) => (
                    <div key={func.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-900">{func.name}</p>
                      {func.date && <p className="text-sm text-gray-600">Date: {func.date}</p>}
                      {func.venue && <p className="text-sm text-gray-600">Venue: {func.venue}</p>}
                      {func.guests && <p className="text-sm text-gray-600">Guests: {func.guests}</p>}
                      {func.budgetAllocation && <p className="text-sm text-gray-600">Budget: {func.budgetAllocation}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-bold text-gray-700 mb-3">Event Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold">{eventDetails.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold">{eventDetails.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Guests</p>
                    <p className="font-semibold">{eventDetails.guests}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Budget */}
            {budget && (
              <div>
                <h3 className="font-bold text-gray-700 mb-3">Budget</h3>
                <p className="font-semibold text-lg">{budget}</p>
              </div>
            )}

            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-900">
                ✅ <strong>Almost there!</strong> Click "Create Event" to proceed with selecting your planning approach
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        )}
        
        <div className="flex-1" />
        
        {currentStep < 6 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Continue
            <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Create Event
            <Check size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
