import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Calendar, MapPin, Users, Clock, AlertTriangle, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';

interface EventFunction {
  id: string;
  name: string;
  date: string;
  venue: string;
  guests: string;
  budgetAllocation: string;
}

export const ClientEventDetail: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddFunction, setShowAddFunction] = useState(false);
  const [editingFunction, setEditingFunction] = useState<string | null>(null);

  // Mock data - in real app, this would come from API/state
  const [isMultiFunction, setIsMultiFunction] = useState(true); // This would be from event data
  const [functions, setFunctions] = useState<EventFunction[]>([
    {
      id: '1',
      name: 'Haldi Ceremony',
      date: '2026-03-23',
      venue: 'Garden Area, Grand Palace',
      guests: '150',
      budgetAllocation: '₹2,00,000'
    },
    {
      id: '2',
      name: 'Sangeet Night',
      date: '2026-03-24',
      venue: 'Main Hall, Grand Palace',
      guests: '400',
      budgetAllocation: '₹5,00,000'
    },
    {
      id: '3',
      name: 'Wedding Ceremony',
      date: '2026-03-25',
      venue: 'Lawn, Grand Palace',
      guests: '500',
      budgetAllocation: '₹8,00,000'
    }
  ]);

  const [newFunction, setNewFunction] = useState<EventFunction>({
    id: '',
    name: '',
    date: '',
    venue: '',
    guests: '',
    budgetAllocation: ''
  });

  const tabs = isMultiFunction 
    ? ['Overview', 'Functions', 'Bookings', 'Risk']
    : ['Overview', 'Bookings', 'Risk'];

  const handleAddFunction = () => {
    if (!newFunction.name.trim()) {
      alert('Please provide a function name');
      return;
    }
    setFunctions([...functions, { ...newFunction, id: Date.now().toString() }]);
    setNewFunction({ id: '', name: '', date: '', venue: '', guests: '', budgetAllocation: '' });
    setShowAddFunction(false);
  };

  const handleDeleteFunction = (funcId: string) => {
    if (confirm('Are you sure you want to delete this function?')) {
      setFunctions(functions.filter(f => f.id !== funcId));
    }
  };

  const handleUpdateFunction = (funcId: string, field: keyof EventFunction, value: string) => {
    setFunctions(functions.map(f => f.id === funcId ? { ...f, [field]: value } : f));
  };

  const convertToMultiFunction = () => {
    if (confirm('Convert this event to a multi-function event? You can add multiple ceremonies or functions.')) {
      setIsMultiFunction(true);
      setActiveTab('functions');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Sharma Wedding
              </h1>
              {isMultiFunction && (
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-xs font-bold">
                  <Sparkles size={12} />
                  Multi-Function
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center gap-2"><Calendar size={18} /><span>March 25, 2026</span></div>
              <div className="flex items-center gap-2"><Clock size={18} /><span>6:00 PM</span></div>
              <div className="flex items-center gap-2"><MapPin size={18} /><span>Grand Palace, Mumbai</span></div>
              <div className="flex items-center gap-2"><Users size={18} /><span>500 guests</span></div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status="CONFIRMED" />
            <Link to={`/risk/${id}`} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <AlertTriangle size={16} />
              View Risk Analysis →
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl shadow-md sticky top-16 z-20">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-6 py-4 font-semibold text-sm transition-all ${
                activeTab === tab.toLowerCase() ? 'gradient-purple-primary text-white' : 'text-gray-600 hover:bg-[#F3E8FF]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 space-y-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex"><span className="w-32 text-gray-500">Type:</span><span className="font-semibold">Wedding</span></div>
                <div className="flex"><span className="w-32 text-gray-500">Structure:</span><span className="font-semibold">{isMultiFunction ? 'Multi-Function Event' : 'Single Event'}</span></div>
                <div className="flex"><span className="w-32 text-gray-500">Theme:</span><span className="font-semibold">Royal Elegance</span></div>
                <div className="flex"><span className="w-32 text-gray-500">Description:</span><span className="text-gray-700">A grand wedding celebration with traditional and modern elements.</span></div>
                {isMultiFunction && (
                  <div className="flex"><span className="w-32 text-gray-500">Functions:</span><span className="font-semibold">{functions.length} ceremonies</span></div>
                )}
              </div>
              
              {!isMultiFunction && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={convertToMultiFunction}
                    className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-[#6E3482] text-[#6E3482] rounded-lg hover:bg-[#F3E8FF] transition-all font-semibold"
                  >
                    <Sparkles size={16} />
                    Convert to Multi-Function Event
                  </button>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">This is a read-only view. Contact your planner to make changes.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold mb-4">Vendor Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confirmed</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending</span>
                  <span className="font-bold text-amber-600">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'functions' && isMultiFunction && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Functions</h2>
                  <p className="text-sm text-gray-500">Manage all ceremonies and functions for this event</p>
                </div>
                <button
                  onClick={() => setShowAddFunction(true)}
                  className="flex items-center gap-2 px-4 py-2 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Plus size={20} />
                  Add Function
                </button>
              </div>

              {/* Add New Function Form */}
              {showAddFunction && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-6 border-2 border-[#6E3482] rounded-xl bg-[#F3E8FF]"
                >
                  <h3 className="font-bold text-gray-900 mb-4">Add New Function</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Function Name *
                      </label>
                      <input
                        type="text"
                        value={newFunction.name}
                        onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })}
                        placeholder="e.g., Reception, Mehndi Ceremony"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newFunction.date}
                        onChange={(e) => setNewFunction({ ...newFunction, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expected Guests
                      </label>
                      <input
                        type="number"
                        value={newFunction.guests}
                        onChange={(e) => setNewFunction({ ...newFunction, guests: e.target.value })}
                        placeholder="e.g., 200"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={newFunction.venue}
                        onChange={(e) => setNewFunction({ ...newFunction, venue: e.target.value })}
                        placeholder="e.g., Banquet Hall"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Budget Allocation
                      </label>
                      <input
                        type="text"
                        value={newFunction.budgetAllocation}
                        onChange={(e) => setNewFunction({ ...newFunction, budgetAllocation: e.target.value })}
                        placeholder="e.g., ₹3,00,000"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAddFunction}
                      className="px-6 py-2 gradient-purple-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Add Function
                    </button>
                    <button
                      onClick={() => {
                        setShowAddFunction(false);
                        setNewFunction({ id: '', name: '', date: '', venue: '', guests: '', budgetAllocation: '' });
                      }}
                      className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Functions List */}
              <div className="space-y-4">
                {functions.map((func, index) => (
                  <motion.div
                    key={func.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    {editingFunction === func.id ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-900">Edit Function</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingFunction(null)}
                              className="px-4 py-2 gradient-success text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingFunction(null)}
                              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                            <input
                              type="text"
                              value={func.name}
                              onChange={(e) => handleUpdateFunction(func.id, 'name', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                            <input
                              type="date"
                              value={func.date}
                              onChange={(e) => handleUpdateFunction(func.id, 'date', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                            <input
                              type="number"
                              value={func.guests}
                              onChange={(e) => handleUpdateFunction(func.id, 'guests', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Venue</label>
                            <input
                              type="text"
                              value={func.venue}
                              onChange={(e) => handleUpdateFunction(func.id, 'venue', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Budget</label>
                            <input
                              type="text"
                              value={func.budgetAllocation}
                              onChange={(e) => handleUpdateFunction(func.id, 'budgetAllocation', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                              {func.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-mono text-xs">
                                Function {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingFunction(func.id)}
                              className="p-2 text-[#6E3482] hover:bg-[#F3E8FF] rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteFunction(func.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {func.date && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Date</p>
                              <p className="font-semibold text-sm">{new Date(func.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          )}
                          {func.venue && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Venue</p>
                              <p className="font-semibold text-sm">{func.venue}</p>
                            </div>
                          )}
                          {func.guests && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Guests</p>
                              <p className="font-semibold text-sm">{func.guests}</p>
                            </div>
                          )}
                          {func.budgetAllocation && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Budget</p>
                              <p className="font-semibold text-sm font-mono">{func.budgetAllocation}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}

                {functions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Sparkles className="mx-auto mb-3 text-gray-300" size={64} />
                    <p>No functions added yet. Click "Add Function" to get started!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#F3E8FF] to-[#E9D5FF] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💡</div>
                <div>
                  <h3 className="font-bold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    Function Management Tips
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Add all your ceremonies and functions to manage them separately</li>
                    <li>• Allocate budgets to each function to track spending accurately</li>
                    <li>• Update guest counts for better vendor planning</li>
                    <li>• You can edit or remove functions anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Vendor Bookings</h2>
            <p className="text-sm text-gray-500 mb-4 text-center">Contact your planner to make changes to bookings.</p>
            <div className="space-y-2">
              {['Elegant Decor Co.', 'Gourmet Catering', 'Sound Masters AV'].map((vendor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">{vendor}</span>
                  <StatusBadge status="CONFIRMED" />
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'risk' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600">Risk analysis embedded here or redirects to full risk page.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
