// src/app/pages/vendor/InventoryManagement.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, ChevronDown, ChevronUp, X, Loader2, Trash2, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { vendor as vendorApi, apiFetch } from '../../../lib/api';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { toast } from 'sonner';

export const InventoryManagement: React.FC = () => {
  const { user } = useAuth();
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [items, setItems]             = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '', description: '', basePrice: '', totalQuantity: '', unit: 'per day',
  });

  const vendorId = user?.vendorId;

  const load = async () => {
    if (!vendorId) return;
    try {
      const res = await vendorApi.get(vendorId);
      setItems(res.inventory ?? []);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [vendorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    if (!formData.name.trim())      { toast.error('Name is required'); return; }
    if (!formData.basePrice)        { toast.error('Base price is required'); return; }
    if (!formData.totalQuantity)    { toast.error('Quantity is required'); return; }
    setSaving(true);
    try {
      const created = await apiFetch<any>(`/api/vendor/${vendorId}/inventory`, {
        method: 'POST',
        body: JSON.stringify({
          name:          formData.name.trim(),
          description:   formData.description || undefined,
          basePrice:     parseFloat(formData.basePrice),
          totalQuantity: parseInt(formData.totalQuantity),
          unit:          formData.unit || 'per day',
        }),
      });
      setItems(prev => [...prev, created]);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', basePrice: '', totalQuantity: '', unit: 'per day' });
      toast.success(`${created.name} added to inventory`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Inventory</h1>
          <p className="text-gray-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2">
          <Plus size={20} /> Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all" />
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{items.length === 0 ? 'No inventory yet' : 'No items match your search'}</p>
          {items.length === 0 && (
            <button onClick={() => setIsModalOpen(true)}
              className="gradient-purple-primary text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus size={16} /> Add first item
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 hover:border-[#E7DBEF] transition-all">
              <div className="p-5 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                {expandedId === item.id
                  ? <ChevronUp size={20} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>{item.name}</h3>
                  {item.description && <p className="text-sm text-gray-500 truncate">{item.description}</p>}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono font-bold text-[#49225B]">
                    ₹{Number(item.basePrice).toLocaleString('en-IN')}
                    <span className="text-xs text-gray-400 font-normal"> / {item.unit}</span>
                  </span>
                  <span className="text-sm text-gray-500">Qty: {item.totalQuantity}</span>
                </div>
              </div>

              {expandedId === item.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="px-5 pb-5 bg-[#F3E8FF]/30">
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Base Price</p>
                        <p className="font-mono font-bold text-[#49225B]">₹{Number(item.basePrice).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Unit</p>
                        <p className="font-semibold">{item.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Total Quantity</p>
                        <p className="font-semibold font-mono">{item.totalQuantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Item ID</p>
                        <p className="font-mono text-xs text-gray-400">{item.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    {item.description && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Description</p>
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Add Inventory Item</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    placeholder="e.g., Gold Tiffany Chair" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all"
                    placeholder="Brief description..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (₹) *</label>
                    <input type="number" required value={formData.basePrice} onChange={e => setFormData(p => ({ ...p, basePrice: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all font-mono"
                      placeholder="350" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                    <input type="number" required value={formData.totalQuantity} onChange={e => setFormData(p => ({ ...p, totalQuantity: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all font-mono"
                      placeholder="500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <select value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all">
                    {['per day','per event','per hour','per piece','per plate','per arch','per table','per chair'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : null} Add Item
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
