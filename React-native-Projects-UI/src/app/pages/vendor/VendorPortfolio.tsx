// src/app/pages/vendor/VendorPortfolio.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, Loader2, Tag, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { vendor as vendorApi, type Vendor, type PortfolioItem } from '../../../lib/api';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { toast } from 'sonner';

export const VendorPortfolio: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [v, setV]                 = useState<Vendor | null>(null);

  const [profileData, setProfileData] = useState({
    tagline: '', location: '', priceRangeMin: '', priceRangeMax: '',
    yearsInBusiness: '', email: '', phone: '', website: '', description: '',
  });
  const [services, setServices]       = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newService, setNewService]   = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [newItem, setNewItem] = useState({ title: '', description: '', eventType: '', imageUrl: '', tags: '' });
  const [addingItem, setAddingItem]   = useState(false);
  const [savingItem, setSavingItem]   = useState(false);

  const vendorId = user?.vendorId;

  useEffect(() => {
    if (!vendorId) return;
    vendorApi.get(vendorId).then(data => {
      setV(data);
      setProfileData({
        tagline:         data.tagline         ?? '',
        location:        data.location        ?? '',
        priceRangeMin:   data.priceRange?.split('-')[0]?.replace(/[^0-9]/g, '') ?? '',
        priceRangeMax:   data.priceRange?.split('-')[1]?.replace(/[^0-9]/g, '') ?? '',
        yearsInBusiness: String(data.yearsInBusiness ?? ''),
        email:           data.email           ?? '',
        phone:           data.phone           ?? '',
        website:         data.website         ?? '',
        description:     data.description     ?? '',
      });
      setServices(data.services ?? []);
      setSpecialties(data.specialties ?? []);
      setPortfolioItems(data.portfolioItems ?? []);
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const handleSaveProfile = async () => {
    if (!vendorId) return;
    setSaving(true);
    try {
      const priceRange = profileData.priceRangeMin && profileData.priceRangeMax
        ? `₹${Number(profileData.priceRangeMin).toLocaleString('en-IN')} - ₹${Number(profileData.priceRangeMax).toLocaleString('en-IN')}`
        : undefined;

      await vendorApi.update(vendorId, {
        tagline:         profileData.tagline         || undefined,
        location:        profileData.location        || undefined,
        priceRange:      priceRange,
        yearsInBusiness: profileData.yearsInBusiness ? parseInt(profileData.yearsInBusiness) : undefined,
        email:           profileData.email           || undefined,
        phone:           profileData.phone           || undefined,
        website:         profileData.website         || undefined,
        description:     profileData.description     || undefined,
        services,
        specialties,
      });
      toast.success('Profile saved!');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addPortfolioItem = async () => {
    if (!vendorId || !newItem.title.trim()) { toast.error('Title is required'); return; }
    setSavingItem(true);
    try {
      const created = await vendorApi.addPortfolioItem(vendorId, {
        title:       newItem.title.trim(),
        description: newItem.description || undefined,
        imageUrl:    newItem.imageUrl    || undefined,
        eventType:   newItem.eventType   || undefined,
        tags:        newItem.tags ? newItem.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      setPortfolioItems(prev => [...prev, created]);
      setNewItem({ title: '', description: '', eventType: '', imageUrl: '', tags: '' });
      setAddingItem(false);
      toast.success('Portfolio item added');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add item');
    } finally {
      setSavingItem(false);
    }
  };

  const deletePortfolioItem = async (portfolioId: string) => {
    if (!vendorId || !confirm('Remove this portfolio item?')) return;
    try {
      await vendorApi.deletePortfolioItem(vendorId, portfolioId);
      setPortfolioItems(prev => prev.filter(p => p.id !== portfolioId));
      toast.success('Item removed');
    } catch { toast.error('Failed to remove item'); }
  };

  if (loading) return <div className="space-y-6"><SkeletonCard /><SkeletonCard /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {v?.businessName ?? 'Your Profile'}
          </h1>
          <p className="text-gray-500 mt-1">{v?.category}</p>
        </div>
        <button onClick={handleSaveProfile} disabled={saving}
          className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Profile
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Business Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Tagline',         key: 'tagline',         placeholder: 'Your catchy tagline' },
            { label: 'Location',        key: 'location',        placeholder: 'Mumbai, MH' },
            { label: 'Email',           key: 'email',           placeholder: 'contact@yourbusiness.com' },
            { label: 'Phone',           key: 'phone',           placeholder: '+91 98765 43210' },
            { label: 'Website',         key: 'website',         placeholder: 'www.yourbusiness.com' },
            { label: 'Years in Business', key: 'yearsInBusiness', placeholder: '8' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
              <input type="text" value={(profileData as any)[f.key]}
                onChange={e => setProfileData(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price (₹)</label>
            <input type="number" value={profileData.priceRangeMin}
              onChange={e => setProfileData(p => ({ ...p, priceRangeMin: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all"
              placeholder="50000" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price (₹)</label>
            <input type="number" value={profileData.priceRangeMax}
              onChange={e => setProfileData(p => ({ ...p, priceRangeMax: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all"
              placeholder="200000" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">About / Description</label>
          <textarea value={profileData.description} rows={3}
            onChange={e => setProfileData(p => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all"
            placeholder="Describe your business..." />
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Services</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {services.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
              {s}
              <button onClick={() => setServices(prev => prev.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newService} onChange={e => setNewService(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newService.trim()) { setServices(p => [...p, newService.trim()]); setNewService(''); } }}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all text-sm"
            placeholder="Add a service, press Enter" />
          <button onClick={() => { if (newService.trim()) { setServices(p => [...p, newService.trim()]); setNewService(''); } }}
            className="gradient-purple-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90">
            Add
          </button>
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Specialties</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {specialties.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3E8FF] text-[#6E3482] rounded-lg text-sm font-medium">
              {s}
              <button onClick={() => setSpecialties(prev => prev.filter((_, j) => j !== i))}
                className="text-[#A56ABD] hover:text-red-500 transition-colors">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newSpecialty.trim()) { setSpecialties(p => [...p, newSpecialty.trim()]); setNewSpecialty(''); } }}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all text-sm"
            placeholder="Add a specialty, press Enter" />
          <button onClick={() => { if (newSpecialty.trim()) { setSpecialties(p => [...p, newSpecialty.trim()]); setNewSpecialty(''); } }}
            className="gradient-purple-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90">
            Add
          </button>
        </div>
      </div>

      {/* Portfolio */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Portfolio ({portfolioItems.length})
          </h2>
          <button onClick={() => setAddingItem(true)}
            className="flex items-center gap-2 gradient-purple-primary text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90">
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Add item form */}
        {addingItem && (
          <div className="bg-[#F3E8FF] rounded-xl p-5 mb-5 space-y-3">
            <h3 className="font-bold text-sm">New Portfolio Item</h3>
            <input type="text" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none text-sm"
              placeholder="Title *" />
            <input type="text" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none text-sm"
              placeholder="Description" />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Image</label>
              <input type="file" accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setNewItem(p => ({ ...p, imageUrl: ev.target?.result as string }));
                  reader.readAsDataURL(file);
                }}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#6E3482] file:text-white hover:file:opacity-90 cursor-pointer border border-gray-200 rounded-xl p-1.5" />
              {newItem.imageUrl && (
                <img src={newItem.imageUrl} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl border border-gray-200" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={newItem.eventType} onChange={e => setNewItem(p => ({ ...p, eventType: e.target.value }))}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none text-sm"
                placeholder="Event type (e.g. Wedding)" />
              <input type="text" value={newItem.tags} onChange={e => setNewItem(p => ({ ...p, tags: e.target.value }))}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none text-sm"
                placeholder="Tags (comma-separated)" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAddingItem(false); setNewItem({ title: '', description: '', eventType: '', imageUrl: '', tags: '' }); }}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={addPortfolioItem} disabled={savingItem}
                className="flex-1 gradient-purple-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {savingItem ? <Loader2 size={16} className="animate-spin" /> : null} Save Item
              </button>
            </div>
          </div>
        )}

        {portfolioItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No portfolio items yet. Add your first work!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioItems.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="border border-gray-200 rounded-xl overflow-hidden group">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 gradient-purple-accent flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">{item.title[0]}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.title}</p>
                      {item.eventType && <p className="text-xs text-gray-500 mt-0.5">{item.eventType}</p>}
                      {item.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>}
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((t, i) => (
                            <span key={i} className="text-xs bg-[#F3E8FF] text-[#6E3482] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Tag size={9} /> {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => deletePortfolioItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 ml-2 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
