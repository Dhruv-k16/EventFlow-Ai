import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Search, Star, ArrowLeft } from 'lucide-react';

export const ClientMarketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const marketplaceType = searchParams.get('type') || 'vendor'; // 'planner' or 'vendor'
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Categories based on type
  const plannerCategories = ['All', 'Wedding Planner', 'Corporate Event Manager', 'Party Organizer', 'Full-Service Planner'];
  const vendorCategories = ['All', 'Decor', 'Catering', 'AV', 'Venue', 'Transport', 'Florals', 'Photography', 'Lighting'];

  const categories = marketplaceType === 'planner' ? plannerCategories : vendorCategories;

  // Planners data
  const planners = [
    { 
      id: 'p1', 
      name: 'Dream Events by Priya', 
      category: 'Wedding Planner', 
      rating: 4.9, 
      reviews: 156, 
      location: 'Mumbai', 
      priceRange: '₹2L - ₹10L',
      initials: 'DE',
      specialties: ['Weddings', 'Luxury Events', 'Destination Planning'],
      eventsManaged: 200
    },
    { 
      id: 'p2', 
      name: 'Elite Corporate Solutions', 
      category: 'Corporate Event Manager', 
      rating: 4.8, 
      reviews: 98, 
      location: 'Delhi', 
      priceRange: '₹1.5L - ₹8L',
      initials: 'ECS',
      specialties: ['Corporate Events', 'Conferences', 'Product Launches'],
      eventsManaged: 150
    },
    { 
      id: 'p3', 
      name: 'Perfect Parties by Raj', 
      category: 'Party Organizer', 
      rating: 4.7, 
      reviews: 87, 
      location: 'Bangalore', 
      priceRange: '₹50k - ₹3L',
      initials: 'PP',
      specialties: ['Birthday Parties', 'Anniversaries', 'Social Events'],
      eventsManaged: 180
    },
    { 
      id: 'p4', 
      name: 'Grandeur Event Planners', 
      category: 'Full-Service Planner', 
      rating: 4.9, 
      reviews: 142, 
      location: 'Goa', 
      priceRange: '₹3L - ₹15L',
      initials: 'GEP',
      specialties: ['Destination Weddings', 'Large Events', 'Luxury Planning'],
      eventsManaged: 250
    },
    { 
      id: 'p5', 
      name: 'Celebrations by Neha', 
      category: 'Wedding Planner', 
      rating: 4.8, 
      reviews: 119, 
      location: 'Jaipur', 
      priceRange: '₹1L - ₹6L',
      initials: 'CN',
      specialties: ['Traditional Weddings', 'Cultural Events', 'Themed Parties'],
      eventsManaged: 170
    },
    { 
      id: 'p6', 
      name: 'Corporate Excellence Events', 
      category: 'Corporate Event Manager', 
      rating: 4.7, 
      reviews: 76, 
      location: 'Pune', 
      priceRange: '₹1L - ₹5L',
      initials: 'CEE',
      specialties: ['Seminars', 'Team Building', 'Award Ceremonies'],
      eventsManaged: 120
    },
  ];

  // Vendors data
  const vendors = [
    { 
      id: 'v1', 
      name: 'Elegant Decor Co.', 
      category: 'Decor', 
      rating: 4.8, 
      reviews: 124, 
      location: 'Mumbai', 
      priceRange: '₹50k - ₹2L', 
      initials: 'ED',
      type: 'vendor'
    },
    { 
      id: 'v2', 
      name: 'Gourmet Catering', 
      category: 'Catering', 
      rating: 4.9, 
      reviews: 89, 
      location: 'Delhi', 
      priceRange: '₹80k - ₹5L', 
      initials: 'GC',
      type: 'vendor'
    },
    { 
      id: 'v3', 
      name: 'Sound Masters AV', 
      category: 'AV', 
      rating: 4.7, 
      reviews: 56, 
      location: 'Bangalore', 
      priceRange: '₹30k - ₹1.5L', 
      initials: 'SM',
      type: 'vendor'
    },
    { 
      id: 'v4', 
      name: 'Flora Paradise', 
      category: 'Florals', 
      rating: 4.9, 
      reviews: 92, 
      location: 'Mumbai', 
      priceRange: '₹40k - ₹3L', 
      initials: 'FP',
      type: 'vendor'
    },
    { 
      id: 'v5', 
      name: 'Luxury Transport', 
      category: 'Transport', 
      rating: 4.6, 
      reviews: 71, 
      location: 'Delhi', 
      priceRange: '₹20k - ₹1L', 
      initials: 'LT',
      type: 'vendor'
    },
    { 
      id: 'v6', 
      name: 'Grand Venues', 
      category: 'Venue', 
      rating: 4.8, 
      reviews: 103, 
      location: 'Goa', 
      priceRange: '₹1L - ₹10L', 
      initials: 'GV',
      type: 'vendor'
    },
    { 
      id: 'v7', 
      name: 'Lens & Light Photography', 
      category: 'Photography', 
      rating: 4.9, 
      reviews: 134, 
      location: 'Mumbai', 
      priceRange: '₹60k - ₹4L', 
      initials: 'LL',
      type: 'vendor'
    },
    { 
      id: 'v8', 
      name: 'Brilliant Lighting Co.', 
      category: 'Lighting', 
      rating: 4.7, 
      reviews: 67, 
      location: 'Bangalore', 
      priceRange: '₹40k - ₹2L', 
      initials: 'BL',
      type: 'vendor'
    },
  ];

  const items = marketplaceType === 'planner' ? planners : vendors;

  const filteredItems = items.filter(item =>
    (activeCategory === 'All' || item.category === activeCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <Link 
            to="/client/create-event/select-type" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {marketplaceType === 'planner' ? 'Browse Planners' : 'Browse Vendors'}
            </h1>
            <p className="text-gray-500 mt-1">
              {marketplaceType === 'planner' 
                ? 'Find the perfect event planner for your needs' 
                : 'Find the perfect vendors for your event'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={marketplaceType === 'planner' 
              ? 'Search planners, specialties...' 
              : 'Search vendors, services, categories...'}
            className="w-full pl-14 pr-5 py-4 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all text-[15px]"
          />
        </div>
      </motion.div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? 'gradient-purple-primary text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-[#A56ABD]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="h-36 gradient-purple-accent relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="w-16 h-16 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-xl border-4 border-white">
                  {item.initials}
                </div>
              </div>
            </div>
            <div className="pt-10 px-5 pb-5 space-y-3">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  {item.name}
                </h3>
                <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#6E3482] rounded-full text-xs font-semibold">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center justify-center gap-1 text-sm">
                <Star className="fill-yellow-400 text-yellow-400" size={16} />
                <span className="font-bold">{item.rating}</span>
                <span className="text-gray-400">({item.reviews} reviews)</span>
              </div>

              <div className="text-sm text-gray-600 space-y-1.5">
                <p className="flex items-center justify-center gap-2">
                  <span>📍</span>
                  <span>{item.location}</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span>💰</span>
                  <span className="font-mono">{item.priceRange}</span>
                </p>
                {marketplaceType === 'planner' && 'eventsManaged' in item && (
                  <p className="flex items-center justify-center gap-2">
                    <span>🎉</span>
                    <span>{item.eventsManaged}+ events managed</span>
                  </p>
                )}
              </div>

              {marketplaceType === 'planner' && 'specialties' in item && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {item.specialties.slice(0, 3).map((specialty, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Link
                  to={`/client/marketplace/${marketplaceType}/${item.id}`}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-[#6E3482] hover:bg-[#F3E8FF] rounded-lg transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  to={`/client/bookings/new?${marketplaceType}Id=${item.id}`}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold gradient-purple-primary text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No results found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};
