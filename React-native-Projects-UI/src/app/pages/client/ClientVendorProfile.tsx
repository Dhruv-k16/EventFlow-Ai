import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Star, MapPin, DollarSign, Calendar, CheckCircle2, Award } from 'lucide-react';

export const ClientVendorProfile: React.FC = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  
  const isPlanner = type === 'planner';

  // Mock data - in real app, fetch based on id
  const profile = isPlanner ? {
    id: id,
    name: 'Dream Events by Priya',
    category: 'Wedding Planner',
    rating: 4.9,
    reviews: 156,
    location: 'Mumbai, Maharashtra',
    priceRange: '₹2L - ₹10L',
    initials: 'DE',
    about: 'Dream Events specializes in creating unforgettable wedding experiences. With over 10 years of experience in the industry, we handle everything from intimate gatherings to grand destination weddings.',
    specialties: ['Weddings', 'Luxury Events', 'Destination Planning', 'Theme Decor', 'Vendor Coordination'],
    eventsManaged: 200,
    yearsExperience: 10,
    portfolio: [
      { id: 1, title: 'Royal Palace Wedding', guests: 800 },
      { id: 2, title: 'Beach Destination Wedding', guests: 300 },
      { id: 3, title: 'Garden Anniversary Celebration', guests: 150 },
    ]
  } : {
    id: id,
    name: 'Elegant Decor Co.',
    category: 'Decor',
    rating: 4.8,
    reviews: 124,
    location: 'Mumbai, Maharashtra',
    priceRange: '₹50k - ₹2L',
    initials: 'ED',
    about: 'Elegant Decor Co. transforms venues into magical spaces. We specialize in contemporary and traditional decor themes, bringing your vision to life with creativity and attention to detail.',
    services: ['Stage Decoration', 'Floral Arrangements', 'Lighting Setup', 'Theme Decor', 'Entrance Arch'],
    completedEvents: 450,
    yearsExperience: 8,
    portfolio: [
      { id: 1, title: 'Modern Minimalist Wedding', type: 'Wedding' },
      { id: 2, title: 'Traditional South Indian Decor', type: 'Wedding' },
      { id: 3, title: 'Corporate Gala Setup', type: 'Corporate' },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link 
          to={`/client/marketplace?type=${type}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {profile.name}
          </h1>
          <p className="text-gray-500">{profile.category}</p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md overflow-hidden"
      >
        <div className="h-48 gradient-purple-accent relative">
          <div className="absolute bottom-0 left-8 translate-y-1/2">
            <div className="w-28 h-28 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg">
              {profile.initials}
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  {profile.name}
                </h2>
                <div className="flex flex-wrap gap-3 items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="fill-yellow-400 text-yellow-400" size={18} />
                    <span className="font-bold">{profile.rating}</span>
                    <span className="text-gray-400">({profile.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar size={16} />
                    <span>{profile.yearsExperience} years experience</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign size={20} className="text-[#6E3482]" />
                <span className="font-mono font-semibold">{profile.priceRange}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to={`/client/bookings/new?${type}Id=${id}`}
                className="px-8 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-5 text-center"
        >
          <div className="text-3xl font-bold text-[#6E3482] font-mono">
            {isPlanner ? profile.eventsManaged : profile.completedEvents}
          </div>
          <div className="text-sm text-gray-600 mt-1">Events Completed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl shadow-md p-5 text-center"
        >
          <div className="text-3xl font-bold text-[#6E3482]">{profile.rating}</div>
          <div className="text-sm text-gray-600 mt-1">Rating</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-5 text-center"
        >
          <div className="text-3xl font-bold text-[#6E3482]">{profile.reviews}</div>
          <div className="text-sm text-gray-600 mt-1">Reviews</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl shadow-md p-5 text-center"
        >
          <div className="text-3xl font-bold text-[#6E3482]">{profile.yearsExperience}+</div>
          <div className="text-sm text-gray-600 mt-1">Years Exp</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 space-y-6"
        >
          <div>
            <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>About</h3>
            <p className="text-gray-700 leading-relaxed">{profile.about}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {isPlanner ? 'Specialties' : 'Services Offered'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(isPlanner ? profile.specialties : profile.services).map((item, idx) => (
                <span key={idx} className="px-4 py-2 bg-[#F3E8FF] text-[#6E3482] rounded-lg text-sm font-semibold">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>Portfolio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.portfolio.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#A56ABD] transition-colors">
                  <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3" />
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {isPlanner && 'guests' in item ? `${item.guests} guests` : 'type' in item && item.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Quick Info */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
                <span className="text-gray-700">Verified {isPlanner ? 'Planner' : 'Vendor'}</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
                <span className="text-gray-700">Response time: &lt; 2 hours</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
                <span className="text-gray-700">Available for bookings</span>
              </div>
              <div className="flex items-start gap-3">
                <Award size={18} className="text-[#6E3482] mt-0.5" />
                <span className="text-gray-700">Top rated on platform</span>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="gradient-purple-primary rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Ready to book?</h3>
            <p className="text-sm text-white/90 mb-4">
              {isPlanner 
                ? 'Get started with a professional event planner today' 
                : 'Secure this vendor for your event'}
            </p>
            <Link
              to={`/client/bookings/new?${type}Id=${id}`}
              className="block w-full px-6 py-3 bg-white text-[#6E3482] rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors"
            >
              Book Now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
