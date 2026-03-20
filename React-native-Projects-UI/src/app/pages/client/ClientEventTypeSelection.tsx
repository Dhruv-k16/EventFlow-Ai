import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { UserCheck, ShoppingBag, ArrowRight } from 'lucide-react';

export const ClientEventTypeSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleSelection = (type: 'planner' | 'vendor') => {
    // Store the selection type
    sessionStorage.setItem('clientSelectionType', type);
    // Navigate to marketplace with type filter
    navigate(`/client/marketplace?type=${type}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          How would you like to plan?
        </h1>
        <p className="text-gray-500">Choose the option that works best for you</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Choose a Planner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <div className="h-32 gradient-purple-primary relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <UserCheck size={64} className="text-white opacity-80" />
            </div>
          </div>
          <div className="p-8 space-y-4">
            <h2 className="text-2xl font-bold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Hire a Planner
            </h2>
            <p className="text-gray-600 text-[15px] leading-relaxed">
              Work with an experienced event planner who will handle everything for you. They'll coordinate with vendors, 
              manage timelines, and ensure your event is perfect.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">Professional coordination & management</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">Access to exclusive vendor network</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">End-to-end event execution</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">Risk mitigation & backup planning</span>
              </div>
            </div>
            <button
              onClick={() => handleSelection('planner')}
              className="w-full mt-6 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Browse Planners
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Option 2: Choose Vendors Directly */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <div className="h-32 gradient-purple-accent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag size={64} className="text-[#6E3482] opacity-80" />
            </div>
          </div>
          <div className="p-8 space-y-4">
            <h2 className="text-2xl font-bold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Book Vendors Yourself
            </h2>
            <p className="text-gray-600 text-[15px] leading-relaxed">
              Take control of your event by selecting and booking individual vendors yourself. Browse our marketplace 
              and build your perfect team.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">Direct vendor communication</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">Full control over your choices</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">Browse by category & ratings</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">Compare prices & reviews</span>
              </div>
            </div>
            <button
              onClick={() => handleSelection('vendor')}
              className="w-full mt-6 px-6 py-3 bg-white border-2 border-[#6E3482] text-[#6E3482] rounded-xl font-semibold hover:bg-[#F3E8FF] transition-all flex items-center justify-center gap-2"
            >
              Browse Vendors
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-[#F3E8FF] to-[#E9D5FF] rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-[#49225B] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Not sure which option to choose?
            </h3>
            <p className="text-gray-700 text-sm">
              Hiring a planner is recommended for larger events (200+ guests) or if you want a stress-free experience. 
              Booking vendors yourself works well for smaller events or if you enjoy hands-on planning. You can always 
              change your approach later!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
