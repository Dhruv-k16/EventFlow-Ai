import React from 'react';
import { motion } from 'motion/react';
import { KPICard } from '../../components/shared/KPICard';
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

export const PlannerFinancials: React.FC = () => {
  // Budget data by event
  const budgetByEvent = [
    { event: 'Sharma Wedding', budget: 1500000, spent: 1050000, remaining: 450000 },
    { event: 'Tech Conference', budget: 2500000, spent: 1800000, remaining: 700000 },
    { event: 'Birthday Bash', budget: 800000, spent: 600000, remaining: 200000 },
    { event: 'Corporate Gala', budget: 3200000, spent: 2650000, remaining: 550000 },
  ];

  // Monthly spending trend
  const monthlySpending = [
    { month: 'Jan', amount: 580000 },
    { month: 'Feb', amount: 720000 },
    { month: 'Mar', amount: 920000 },
    { month: 'Apr', amount: 850000 },
    { month: 'May', amount: 1050000 },
    { month: 'Jun', amount: 980000 },
  ];

  // Category breakdown
  const categoryBreakdown = [
    { category: 'Catering', value: 1200000, color: '#6E3482' },
    { category: 'Decor', value: 800000, color: '#A56ABD' },
    { category: 'AV/Tech', value: 600000, color: '#C185D7' },
    { category: 'Venue', value: 1500000, color: '#D9B3E6' },
    { category: 'Entertainment', value: 400000, color: '#E8D4F0' },
  ];

  const COLORS = ['#6E3482', '#A56ABD', '#C185D7', '#D9B3E6', '#E8D4F0'];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Financials</h1>
        <p className="text-gray-500 mt-2">Cross-event financial overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Total Budget" value="₹45.8L" subLabel="Across all events" icon={DollarSign} accentColor="purple" />
        <KPICard label="Total Spent" value="₹32.1L" subLabel="Till date" icon={TrendingDown} accentColor="red" />
        <KPICard label="Net Remaining" value="₹13.7L" subLabel="Available" icon={TrendingUp} accentColor="green" />
        <KPICard label="Avg Utilisation" value="70%" subLabel="Budget used" icon={Percent} accentColor="amber" />
      </div>

      {/* Budget by Event - Bar Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Budget Overview by Event</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={budgetByEvent}>
            <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
            <XAxis 
              dataKey="event" 
              tick={{ fontSize: 12, fill: '#9CA3AF' }} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />
            <Tooltip
              contentStyle={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #E5E7EB', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                fontFamily: 'Inter'
              }}
              formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, '']}
              labelStyle={{ fontWeight: 'bold', marginBottom: 8 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="budget" fill="#6E3482" radius={[4, 4, 0, 0]} barSize={40} name="Budget" key="budget-bar" />
            <Bar dataKey="spent" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} name="Spent" key="spent-bar" />
            <Bar dataKey="remaining" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} name="Remaining" key="remaining-bar" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend - Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Monthly Spending Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySpending}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6E3482" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6E3482" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
              />
              <Tooltip
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, 'Spending']}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#6E3482" 
                strokeWidth={3}
                dot={{ fill: '#6E3482', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown - Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`planner-category-${entry.category}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};