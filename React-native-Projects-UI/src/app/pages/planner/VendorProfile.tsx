// src/app/pages/planner/VendorProfile.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, MapPin, Phone, Mail, Globe, Package, Plus } from 'lucide-react';
import { vendor as vendorApi, type Vendor } from '../../../lib/api';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { toast } from 'sonner';

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const VendorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);
  const [v, setV]                 = useState<Vendor | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    vendorApi.get(id)
      .then(data => { if (mounted) setV(data); })
      .catch(() => { if (mounted) toast.error('Failed to load vendor'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="space-y-6"><SkeletonCard /><SkeletonCard /></div>;
  if (!v) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-md">
      <p className="text-gray-500 mb-4">Vendor not found</p>
      <Link to="/marketplace" className="text-[#6E3482] font-semibold">← Back to Marketplace</Link>
    </div>
  );

  const tabs = ['overview', 'inventory', 'portfolio'];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden shadow-md">
        <div className="h-48 relative"
          style={v.coverImageUrl ? { backgroundImage: `url(${v.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {!v.coverImageUrl && <div className="absolute inset-0 gradient-purple-primary" />}
          <div className="absolute bottom-0 left-8 translate-y-1/2">
            {v.avatarUrl ? (
              <img src={v.avatarUrl} alt={v.businessName}
                className="w-24 h-24 rounded-full border-4 border-white object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full gradient-purple-accent flex items-center justify-center text-white font-bold text-3xl border-4 border-white">
                {initials(v.businessName)}
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Link to={`/bookings/new?vendorId=${v.id}`}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors">
              Book Now
            </Link>
          </div>
        </div>

        <div className="pt-16 pb-6 px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {v.businessName}
          </h1>
          {v.tagline && <p className="text-gray-500 italic mb-3">"{v.tagline}"</p>}
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-3 py-1 bg-[#F3E8FF] text-[#6E3482] text-sm font-semibold rounded-full">{v.category}</span>
            <div className="flex items-center gap-1.5">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="font-bold">{Number(v.rating).toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({v.totalReviews} reviews)</span>
            </div>
            {v.yearsInBusiness && (
              <span className="text-sm text-gray-500">{v.yearsInBusiness} yrs in business</span>
            )}
            {v.priceRange && (
              <span className="text-sm font-mono font-semibold text-[#6E3482]">{v.priceRange}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
            {v.location  && <div className="flex items-center gap-1.5"><MapPin size={14} /><span>{v.location}</span></div>}
            {v.phone     && <div className="flex items-center gap-1.5"><Phone size={14} /><span>{v.phone}</span></div>}
            {v.email     && <div className="flex items-center gap-1.5"><Mail size={14} /><span>{v.email}</span></div>}
            {v.website   && <a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#6E3482] hover:underline"><Globe size={14} /><span>Website</span></a>}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-100 flex">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold text-sm capitalize transition-all ${
                activeTab === tab ? 'gradient-purple-primary text-white' : 'text-gray-600 hover:bg-[#F3E8FF]'
              }`}>
              {tab === 'inventory' ? `Inventory (${v.inventory?.length ?? 0})` :
               tab === 'portfolio' ? `Portfolio (${v.portfolioItems?.length ?? 0})` : 'Overview'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {v.description && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600 leading-relaxed">{v.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#F3E8FF] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-mono text-[#49225B]">{v._count?.bookings ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Bookings</p>
                </div>
                <div className="bg-[#D1FAE5] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-mono text-green-700">{v.confirmedBookings ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Confirmed</p>
                </div>
                <div className="bg-[#DBEAFE] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-mono text-blue-700">{v.completedBookings ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Completed</p>
                </div>
              </div>
              {v.services?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {v.services.map((s, i) => <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">{s}</span>)}
                  </div>
                </div>
              )}
              {v.specialties?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {v.specialties.map((s, i) => <span key={i} className="px-3 py-1.5 bg-[#F3E8FF] text-[#6E3482] rounded-lg text-sm font-medium">{s}</span>)}
                  </div>
                </div>
              )}
              <div className="pt-4">
                <Link to={`/bookings/new?vendorId=${v.id}`}
                  className="inline-flex items-center gap-2 gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
                  <Plus size={18} /> Book This Vendor
                </Link>
              </div>
            </div>
          )}

          {/* Inventory */}
          {activeTab === 'inventory' && (
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Available Items</h3>
              {!v.inventory || v.inventory.length === 0 ? (
                <p className="text-gray-500">No inventory listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {v.inventory.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] flex items-center justify-center shrink-0">
                        <Package size={20} className="text-[#6E3482]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-mono font-bold text-[#49225B]">
                            ₹{Number(item.basePrice).toLocaleString('en-IN')}
                            <span className="text-xs text-gray-400 font-normal"> / {item.unit}</span>
                          </span>
                          <span className="text-xs text-gray-400">Qty: {item.totalQuantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Portfolio */}
          {activeTab === 'portfolio' && (
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Portfolio</h3>
              {!v.portfolioItems || v.portfolioItems.length === 0 ? (
                <p className="text-gray-500">No portfolio items added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {v.portfolioItems.map(item => (
                    <div key={item.id} className="rounded-xl overflow-hidden border border-gray-200">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 gradient-purple-accent flex items-center justify-center">
                          <span className="text-white font-bold">{item.title[0]}</span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-semibold text-sm">{item.title}</p>
                        {item.eventType && <p className="text-xs text-gray-500">{item.eventType}</p>}
                        {item.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((t, i) => <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
