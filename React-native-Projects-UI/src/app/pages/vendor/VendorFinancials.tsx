import React from 'react';
import { motion } from 'motion/react';
import { KPICard } from '../../components/shared/KPICard';
import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';

export const VendorFinancials: React.FC = () => {
  // Monthly revenue and cost data
  const monthlyData = [
    { month: 'Jan', revenue: 380000, cost: 240000, profit: 140000 },
    { month: 'Feb', revenue: 450000, cost: 290000, profit: 160000 },
    { month: 'Mar', revenue: 520000, cost: 310000, profit: 210000 },
    { month: 'Apr', revenue: 480000, cost: 300000, profit: 180000 },
    { month: 'May', revenue: 610000, cost: 380000, profit: 230000 },
    { month: 'Jun', revenue: 560000, cost: 350000, profit: 210000 },
  ];

  // Revenue by service category
  const categoryRevenue = [
    { category: 'Corporate Events', revenue: 1200000 },
    { category: 'Weddings', revenue: 850000 },
    { category: 'Private Parties', revenue: 450000 },
    { category: 'Conferences', revenue: 350000 },
  ];

  // Cost breakdown
  const costBreakdown = [
    { category: 'Labor', amount: 720000 },
    { category: 'Materials', amount: 580000 },
    { category: 'Equipment', amount: 420000 },
    { category: 'Transportation', amount: 180000 },
    { category: 'Overhead', amount: 320000 },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Financials</h1>
        <p className="text-gray-500 mt-2">Your business revenue and costs</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Total Revenue" value="₹28.5L" subLabel="All time" icon={DollarSign} accentColor="green" />
        <KPICard label="Total Cost" value="₹18.2L" subLabel="Operational costs" icon={TrendingDown} accentColor="red" />
        <KPICard label="Net Profit" value="₹10.3L" subLabel="After costs" icon={TrendingUp} accentColor="purple" />
        <KPICard label="Profit Margin" value="36%" subLabel="Healthy" icon={Percent} accentColor="green" />
      </div>

      {/* Revenue, Cost & Profit Trend - Area Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Revenue & Profit Trend</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6E3482" stopOpacity={0.3}/>
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
              formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, '']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
              key="revenue-area"
            />
            <Area 
              type="monotone" 
              dataKey="cost" 
              stroke="#EF4444" 
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorCost)"
              name="Cost"
              key="cost-area"
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#6E3482" 
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorProfit)"
              name="Profit"
              key="profit-area"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category - Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Revenue by Service</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryRevenue}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                tickLine={false} 
                axisLine={false}
                angle={-15}
                textAnchor="end"
                height={80}
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
                formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, 'Revenue']}
              />
              <Bar 
                dataKey="revenue" 
                fill="#10B981" 
                radius={[8, 8, 0, 0]} 
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown - Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Cost Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" horizontal={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
              />
              <YAxis 
                type="category"
                dataKey="category" 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                tickLine={false} 
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, 'Cost']}
              />
              <Bar 
                dataKey="amount" 
                fill="#EF4444" 
                radius={[0, 8, 8, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};