import React from 'react';
import { useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export const BookingDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const booking = {
    id,
    vendor: 'Elegant Decor Co.',
    client: 'Sarah Johnson',
    event: 'Sharma Wedding',
    date: 'March 25, 2026',
    amount: '₹1,50,000',
    status: 'REQUESTED' as const,
    items: [
      { name: 'Stage Decoration', quantity: 1, unitPrice: '₹80,000', subtotal: '₹80,000' },
      { name: 'Table Centerpieces', quantity: 50, unitPrice: '₹1,000', subtotal: '₹50,000' },
      { name: 'Entrance Arch', quantity: 1, unitPrice: '₹20,000', subtotal: '₹20,000' },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-mono text-gray-400 mb-2">Booking ID: {id}</p>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {booking.event}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'PLANNER' ? `Vendor: ${booking.vendor}` : `Client: ${booking.client}`}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="bg-[#F3E8FF] rounded-xl p-6 mb-6">
          <p className="text-5xl font-bold text-[#49225B] font-mono mb-2" style={{ fontFamily: 'JetBrains Mono' }}>
            {booking.amount}
          </p>
          <p className="text-sm text-gray-600">Total Amount</p>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Booking Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Service Date:</span> <span className="font-semibold">{booking.date}</span></div>
            <div><span className="text-gray-500">Status:</span> <StatusBadge status={booking.status} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Items</h2>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {booking.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm font-mono">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm font-mono">{item.unitPrice}</td>
                    <td className="px-4 py-3 text-sm font-mono font-bold">{item.subtotal}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 text-sm font-bold text-right">Total</td>
                  <td className="px-4 py-3 text-sm font-mono font-bold text-[#49225B]">{booking.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {user?.role === 'VENDOR' && booking.status === 'REQUESTED' && (
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <button className="flex-1 gradient-success text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
              Confirm Booking
            </button>
            <button className="flex-1 border border-red-200 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all">
              Reject
            </button>
          </div>
        )}

        {user?.role === 'PLANNER' && booking.status === 'CONFIRMED' && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button className="border border-red-200 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all">
              Cancel Booking
            </button>
          </div>
        )}

        {user?.role === 'CLIENT' && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">Contact your planner to make changes to this booking.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
