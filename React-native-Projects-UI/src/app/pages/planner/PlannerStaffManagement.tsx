import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Mail, Phone, Calendar } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'Available' | 'Busy' | 'On Leave';
  initials: string;
  assignedEvents: number;
}

export const PlannerStaffManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'Sarah Johnson', role: 'Event Coordinator', email: 'sarah.j@eventflow.ai', phone: '+1 555 0101', status: 'Available', initials: 'SJ', assignedEvents: 3 },
    { id: '2', name: 'Michael Chen', role: 'Logistics Manager', email: 'michael.c@eventflow.ai', phone: '+1 555 0102', status: 'Busy', initials: 'MC', assignedEvents: 5 },
    { id: '3', name: 'Emily Rodriguez', role: 'Client Relations', email: 'emily.r@eventflow.ai', phone: '+1 555 0103', status: 'Available', initials: 'ER', assignedEvents: 2 },
    { id: '4', name: 'David Kim', role: 'Technical Lead', email: 'david.k@eventflow.ai', phone: '+1 555 0104', status: 'Available', initials: 'DK', assignedEvents: 4 },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'Available' as 'Available' | 'Busy' | 'On Leave'
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMember: StaffMember = {
      id: (staff.length + 1).toString(),
      name: formData.name,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      initials: getInitials(formData.name),
      assignedEvents: 0
    };

    setStaff([...staff, newMember]);
    setIsModalOpen(false);
    setFormData({ name: '', role: '', email: '', phone: '', status: 'Available' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'Busy':
        return 'bg-amber-500';
      case 'On Leave':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Team Management</h1>
          <p className="text-gray-500 mt-1">{staff.length} team members</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Team Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Available</p>
              <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono' }}>
                {staff.filter(m => m.status === 'Available').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Busy</p>
              <p className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'JetBrains Mono' }}>
                {staff.filter(m => m.status === 'Busy').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">On Leave</p>
              <p className="text-2xl font-bold text-gray-600" style={{ fontFamily: 'JetBrains Mono' }}>
                {staff.filter(m => m.status === 'On Leave').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Avatar and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-full gradient-purple-primary flex items-center justify-center text-white font-bold text-lg">
                {member.initials}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                <span className="text-xs text-gray-600">{member.status}</span>
              </div>
            </div>

            {/* Name and Role */}
            <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{member.name}</h3>
            <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#6E3482] text-xs font-semibold rounded-full mb-4">
              {member.role}
            </span>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span>{member.phone}</span>
              </div>
            </div>

            {/* Assigned Events */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <span>Assigned Events</span>
                </div>
                <span className="font-bold text-[#49225B]" style={{ fontFamily: 'JetBrains Mono' }}>
                  {member.assignedEvents}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Add Team Member</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                  >
                    <option value="">Select role...</option>
                    <option value="Event Coordinator">Event Coordinator</option>
                    <option value="Logistics Manager">Logistics Manager</option>
                    <option value="Client Relations">Client Relations</option>
                    <option value="Technical Lead">Technical Lead</option>
                    <option value="Marketing Specialist">Marketing Specialist</option>
                    <option value="Operations Manager">Operations Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    placeholder="email@eventflow.ai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                    placeholder="+1 555 0100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Available' | 'Busy' | 'On Leave' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
                  >
                    Add Member
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
