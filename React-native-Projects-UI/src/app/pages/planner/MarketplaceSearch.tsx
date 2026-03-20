// src/app/pages/planner/MarketplaceSearch.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Search, Star } from 'lucide-react';
import { marketplace, type Vendor } from '../../../lib/api';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Decor', 'Catering', 'AV', 'Venue', 'Transport', 'Photography', 'Lighting'];

export const MarketplaceSearch: React.FC = () => {
  const [searchTerm, setSearchTerm]       = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vendors, setVendors]             = useState<Vendor[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    let mounted = true;
    marketplace.search()
      .then(res => { if (mounted) setVendors(res.vendors); })
      .catch(() => { if (mounted) toast.error('Failed to load vendors'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = vendors.filter(v => {
    const matchCat  = activeCategory === 'All' || v.category === activeCategory;
    const matchSearch = v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (v.location ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Marketplace
        </h1>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search vendors, services, categories..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all text-[15px]" />
        </div>
      </motion.div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? 'gradient-purple-primary text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-[#A56ABD]'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500">{filtered.length} vendor{filtered.length !== 1 ? 's' : ''} found</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-3">No vendors found</p>
          <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
            className="text-[#6E3482] font-semibold hover:underline text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v, idx) => (
            <motion.div key={v.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }} whileHover={{ y: -4 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              {/* Cover */}
              <div className="h-36 relative" style={{ background: v.coverImageUrl ? `url(${v.coverImageUrl}) center/cover` : undefined }}>
                {!v.coverImageUrl && <div className="absolute inset-0 gradient-purple-accent" />}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  {v.avatarUrl ? (
                    <img src={v.avatarUrl} alt={v.businessName}
                      className="w-16 h-16 rounded-full border-4 border-white object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-xl border-4 border-white">
                      {initials(v.businessName)}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 pt-10 space-y-3">
                <div>
                  <h3 className="font-bold text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>{v.businessName}</h3>
                  <div className="flex justify-center mt-1">
                    <span className="px-3 py-1 bg-[#F3E8FF] text-[#6E3482] text-xs font-semibold rounded-full">{v.category}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold">{Number(v.rating).toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({v.totalReviews} reviews)</span>
                </div>
                {v.location && <p className="text-sm text-gray-600 text-center">{v.location}</p>}
                {v.priceRange && <p className="text-sm font-mono font-semibold text-[#6E3482] text-center">{v.priceRange}</p>}
                {v.tagline && <p className="text-xs text-gray-500 text-center italic">"{v.tagline}"</p>}
                <Link to={`/marketplace/vendor/${v.id}`}
                  className="block w-full text-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-[#F3E8FF] hover:border-[#A56ABD] transition-colors font-semibold text-sm">
                  View Profile →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
