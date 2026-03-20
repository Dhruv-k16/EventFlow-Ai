import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, FileText, DollarSign, CheckCircle2 } from 'lucide-react';

export const ClientBookVendor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const plannerId = searchParams.get('plannerId');
  const vendorId = searchParams.get('vendorId');
  const isPlanner = !!plannerId;

  const [formData, setFormData] = useState({
    eventDate: '',
    duration: '',
    budget: '',
    requirements: '',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data
  const itemName = isPlanner ? 'Dream Events by Priya' : 'Elegant Decor Co.';
  const itemType = isPlanner ? 'Wedding Planner' : 'Decor Vendor';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Redirect after success
    setTimeout(() => {
      navigate('/client/dashboard');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-md p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Booking Request Sent!
          </h2>
          <p className="text-gray-600 mb-6">
            Your booking request has been sent to {itemName}. They will review and respond within 24 hours.
          </p>
          <button
            onClick={() => navigate('/client/dashboard')}
            className="px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Book {itemName}
          </h1>
          <p className="text-gray-500">{itemType}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {isPlanner ? 'Event Duration / Planning Period *' : 'Service Duration *'}
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
            >
              <option value="">Select duration</option>
              {isPlanner ? (
                <>
                  <option value="1-month">1 Month Planning</option>
                  <option value="3-months">3 Months Planning</option>
                  <option value="6-months">6 Months Planning</option>
                  <option value="12-months">12 Months Planning</option>
                </>
              ) : (
                <>
                  <option value="half-day">Half Day (4-6 hours)</option>
                  <option value="full-day">Full Day (8-12 hours)</option>
                  <option value="multi-day">Multiple Days</option>
                </>
              )}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Budget *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                placeholder="e.g., ₹2,00,000"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {isPlanner ? 'Event Requirements *' : 'Service Requirements *'}
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                rows={4}
                placeholder={isPlanner 
                  ? 'Describe your event needs, expected guest count, venue preferences, etc.' 
                  : 'Describe what you need (e.g., stage decor, floral arrangements, theme requirements)'}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows={3}
              placeholder="Any special requests or additional information..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">What happens next?</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• {itemName} will review your request</li>
                  <li>• They'll contact you within 24 hours</li>
                  <li>• You can discuss details and finalize the booking</li>
                  <li>• Payment terms will be agreed upon directly</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
