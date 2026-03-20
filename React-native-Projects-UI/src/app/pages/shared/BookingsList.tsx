import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Plus } from 'lucide-react';

export const BookingsList: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Requested', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'];

  const bookings = [
    { id: '1', vendor: 'Elegant Decor Co.', client: 'Sarah Johnson', event: 'Sharma Wedding', date: 'Mar 25, 2026', amount: '₹1,50,000', status: 'CONFIRMED' as const },
    { id: '2', vendor: 'Gourmet Catering', client: 'Tech Corp', event: 'Annual Meet', date: 'Apr 10, 2026', amount: '₹3,20,000', status: 'PENDING' as const },
    { id: '3', vendor: 'Sound Masters AV', client: 'Sarah Johnson', event: 'Birthday Party', date: 'Mar 18, 2026', amount: '₹45,000', status: 'CONFIRMED' as const },
    { id: '4', vendor: 'Flora Paradise', client: 'Sarah Johnson', event: 'Sharma Wedding', date: 'Mar 25, 2026', amount: '₹75,000', status: 'REQUESTED' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>My Bookings</h1>
          <p className="text-gray-500 mt-1">{bookings.length} total bookings</p>
        </div>
        {user?.role === 'PLANNER' && (
          <Link to="/bookings/new" className="gradient-purple-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2">
            <Plus size={20} />
            Book Vendor
          </Link>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
              activeFilter === filter
                ? 'gradient-purple-primary text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-[#A56ABD]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {user?.role === 'PLANNER' && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>}
                {user?.role !== 'PLANNER' && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                {user?.role !== 'CLIENT' && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#F3E8FF] transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user?.role === 'PLANNER' ? booking.vendor : booking.client}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.event}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.date}</td>
                  {user?.role !== 'CLIENT' && <td className="px-6 py-4 text-sm font-mono font-bold text-[#49225B]">{booking.amount}</td>}
                  <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                  <td className="px-6 py-4">
                    <Link to={`/bookings/${booking.id}`} className="text-sm font-semibold text-[#6E3482] hover:text-[#49225B]">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
