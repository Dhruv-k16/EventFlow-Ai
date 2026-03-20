import React from 'react';
import { motion } from 'motion/react';
import { KPICard } from '../../components/shared/KPICard';
import { DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const ClientFinancials: React.FC = () => {
  const bookings = [
    { vendor: 'Elegant Decor Co.', category: 'Decor', date: 'Mar 25, 2026', amount: '₹1,50,000', status: 'CONFIRMED' as const, numAmount: 150000 },
    { vendor: 'Gourmet Catering', category: 'Catering', date: 'Mar 25, 2026', amount: '₹3,20,000', status: 'CONFIRMED' as const, numAmount: 320000 },
    { vendor: 'Sound Masters AV', category: 'AV', date: 'Mar 25, 2026', amount: '₹45,000', status: 'CONFIRMED' as const, numAmount: 45000 },
  ];

  const total = '₹5,15,000';

  // Category breakdown for pie chart
  const categoryData = [
    { name: 'Catering', value: 320000, color: '#6E3482' },
    { name: 'Decor', value: 150000, color: '#A56ABD' },
    { name: 'AV', value: 45000, color: '#C185D7' },
  ];

  // Vendor spending for bar chart
  const vendorSpending = bookings.map(b => ({
    vendor: b.vendor,
    amount: b.numAmount
  }));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>My Commitments</h1>
        <p className="text-gray-500 mt-2">What you've agreed to pay for your events</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KPICard label="Total Committed" value={total} subLabel="Confirmed bookings" icon={DollarSign} accentColor="purple" />
        <KPICard label="Active Bookings" value={bookings.length} subLabel="Confirmed vendors" icon={CheckCircle2} accentColor="green" />
        <KPICard label="Upcoming Payments" value={2} subLabel="Due soon" icon={Clock} accentColor="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown - Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`client-category-${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                key="client-financials-pie-tooltip"
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`₹${(value / 1000).toFixed(0)}k`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor Spending - Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Spending by Vendor</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendorSpending}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" key="client-financials-grid" />
              <XAxis 
                key="client-financials-xaxis"
                dataKey="vendor" 
                tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                tickLine={false} 
                axisLine={false}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                key="client-financials-yaxis"
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                key="client-financials-bar-tooltip"
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`₹${(value / 1000).toFixed(0)}k`, 'Amount']}
              />
              <Bar 
                dataKey="amount" 
                fill="#6E3482" 
                radius={[8, 8, 0, 0]} 
                barSize={50}
                key="client-vendor-spending-bar"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Committed by Vendor</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Committed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking, idx) => (
                <tr key={idx} className="hover:bg-[#F3E8FF] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{booking.vendor}</td>
                  <td className="px-6 py-4 text-sm">{booking.category}</td>
                  <td className="px-6 py-4 text-sm">{booking.date}</td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-[#49225B]">{booking.amount}</td>
                  <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="px-6 py-4 text-sm text-right">Total</td>
                <td className="px-6 py-4 text-sm font-mono text-[#49225B]">{total}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};