// src/app/pages/client/ClientFinancials.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/LoadingSpinner';
import { DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { bookings as bookingsApi, type Booking } from '../../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const CATEGORY_COLORS = ['#49225B','#6E3482','#A56ABD','#C185D7','#D8B4E2','#E8D5F0'];

export const ClientFinancials: React.FC = () => {
  const { user }  = useAuth();
  const [loading, setLoading]   = useState(true);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  useEffect(() => {
    bookingsApi.list()
      .then(data => setAllBookings(data))
      .catch(() => toast.error('Failed to load financials'))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = allBookings.filter(b => ['CONFIRMED','COMPLETED'].includes(b.status));
  const pending   = allBookings.filter(b => ['REQUESTED','MEETING_PHASE_1','CONFIRMATION_PENDING','MEETING_PHASE_2'].includes(b.status));

  const totalCommitted = confirmed.reduce((s, b) => s + Number(b.totalCost), 0);
  const totalPending   = pending.reduce((s, b) => s + Number(b.totalCost), 0);

  // Category breakdown for pie chart
  const catMap = new Map<string, number>();
  confirmed.forEach(b => {
    const cat = b.vendor?.category ?? 'Other';
    catMap.set(cat, (catMap.get(cat) ?? 0) + Number(b.totalCost));
  });
  const categoryData = [...catMap.entries()].map(([name, value], i) => ({
    name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
  }));

  // Vendor spending for bar chart
  const vendorData = confirmed.map(b => ({
    vendor: (b.vendor?.businessName ?? 'Unknown').split(' ').slice(0, 2).join(' '),
    amount: Number(b.totalCost),
  })).sort((a, b) => b.amount - a.amount).slice(0, 6);

  const fmtInr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-5">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      <SkeletonCard />
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>My Commitments</h1>
        <p className="text-gray-500 mt-1">What you've agreed to pay across all your events</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KPICard label="Total Committed"  value={fmtInr(totalCommitted)} subLabel="Confirmed bookings"    icon={DollarSign}  accentColor="purple" />
        <KPICard label="Active Bookings"  value={confirmed.length}        subLabel="Confirmed vendors"     icon={CheckCircle2} accentColor="green"  />
        <KPICard label="Pending Spend"    value={fmtInr(totalPending)}   subLabel="Awaiting confirmation" icon={Clock}        accentColor="amber"  />
      </div>

      {/* Charts */}
      {confirmed.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Spending by Category</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [fmtInr(v), 'Amount']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Spend by Vendor</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendorData} margin={{ top: 5, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="vendor" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tickFormatter={(v: number) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [fmtInr(v), 'Amount']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="amount" fill="#6E3482" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bookings table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Booking Breakdown</h2>
        {allBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allBookings.map(b => (
                  <tr key={b.id} className="hover:bg-[#F3E8FF] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{b.vendor?.businessName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{b.vendor?.category ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{b.event?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-[#49225B]">
                      {fmtInr(Number(b.totalCost))}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className="px-4 py-3 text-sm text-right">Confirmed Total</td>
                  <td className="px-4 py-3 text-sm font-mono text-[#49225B]">{fmtInr(totalCommitted)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
