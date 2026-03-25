// src/app/pages/vendor/StaffManagement.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Phone, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { vendor as vendorApi } from '../../../lib/api';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-500',
  ON_SITE:   'bg-blue-500',
  ON_LEAVE:  'bg-gray-400',
};
const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Available',
  ON_SITE:   'On Site',
  ON_LEAVE:  'On Leave',
};

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const StaffManagement: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [staff, setStaff]             = useState<any[]>([]);
  const [formData, setFormData]       = useState({ name: '', role: '', phone: '', status: 'AVAILABLE' });

  const vendorId = user?.vendorId;

  useEffect(() => {
    if (!vendorId) return;
    vendorApi.getStaff(vendorId)
      .then(res => setStaff(Array.isArray(res) ? res : (res?.staff ?? [])))
      .catch(() => toast.error('Failed to load staff'))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    if (!formData.name.trim()) { toast.error('Name is required'); return; }
    if (!formData.role.trim()) { toast.error('Role is required'); return; }
    setSaving(true);
    try {
      const created = await vendorApi.addStaff(vendorId, {
        name:   formData.name.trim(),
        role:   formData.role.trim(),
        phone:  formData.phone || undefined,
        status: formData.status,
      });
      setStaff(prev => [...prev, created]);
      setIsModalOpen(false);
      setFormData({ name: '', role: '', phone: '', status: 'AVAILABLE' });
      toast.success(`${created.name} added`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add staff');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (staffId: string, status: string) => {
    if (!vendorId) return;
    try {
      const updated = await vendorApi.updateStaff(vendorId, staffId, { status });
      setStaff(prev => prev.map(s => s.id === staffId ? updated : s));
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (staffId: string, name: string) => {
    if (!vendorId || !confirm(`Remove ${name}?`)) return;
    try {
      await vendorApi.deleteStaff(vendorId, staffId);
      setStaff(prev => prev.filter(s => s.id !== staffId));
      toast.success(`${name} removed`);
    } catch { toast.error('Failed to remove staff'); }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Staff</h1>
          <p className="text-gray-500 mt-1">{staff.length} team member{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2">
          <Plus size={20} /> Add Staff Member
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No staff members yet</p>
          <button onClick={() => setIsModalOpen(true)}
            className="gradient-purple-primary text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
            <Plus size={16} /> Add first member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map((member, idx) => (
            <motion.div key={member.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-lg">
                  {initials(member.name)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[member.status] ?? 'bg-gray-400'}`} />
                  <select value={member.status} onChange={e => handleStatusChange(member.id, e.target.value)}
                    className="text-xs text-gray-600 border-0 outline-none bg-transparent cursor-pointer">
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_SITE">On Site</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{member.name}</h3>
              <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#6E3482] text-xs font-semibold rounded-full mb-4">
                {member.role}
              </span>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Phone size={13} className="text-gray-400" /><span>{member.phone}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button onClick={() => handleDelete(member.id, member.name)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Add Staff Member</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                  <input type="text" required value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    placeholder="e.g., Lead Decorator, Driver, Technician" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] outline-none transition-all">
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_SITE">On Site</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : null} Add Member
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
