import React from 'react';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KPICard } from '../../components/shared/KPICard';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const VendorRiskDashboard: React.FC = () => {
  // Risk factors data
  const riskFactors = [
    { factor: 'Inventory Levels', score: 85 },
    { factor: 'Staff Availability', score: 90 },
    { factor: 'Equipment Status', score: 75 },
    { factor: 'Order Capacity', score: 80 },
    { factor: 'Financial Health', score: 95 },
  ];

  // Monthly risk trend
  const riskTrend = [
    { month: 'Jan', score: 45 },
    { month: 'Feb', score: 42 },
    { month: 'Mar', score: 38 },
    { month: 'Apr', score: 40 },
    { month: 'May', score: 35 },
    { month: 'Jun', score: 40 },
  ];

  // Operational metrics for radar chart
  const operationalMetrics = [
    { metric: 'Staff', value: 90 },
    { metric: 'Inventory', value: 85 },
    { metric: 'Equipment', value: 75 },
    { metric: 'Orders', value: 80 },
    { metric: 'Revenue', value: 95 },
    { metric: 'Quality', value: 88 },
  ];

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20 bg-white shadow-sm rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-[#6E3482]" />
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>Operational Risk Analysis</h2>
            <p className="text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">VENDOR</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="#F3F4F6" strokeWidth="16" strokeLinecap="round" />
              <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeDasharray="88 220" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
              <span className="text-5xl font-extrabold font-mono text-green-500">40</span>
              <span className="text-sm text-gray-400">/100</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <StatusBadge status="LOW" />
            <p className="text-sm text-gray-600 mt-2">OPERATIONAL RISK</p>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5">
          <KPICard label="Active Alerts" value={1} subLabel="Minor issues" icon={AlertTriangle} accentColor="amber" />
          <KPICard label="Confirmed Orders" value={12} subLabel="Active" icon={CheckCircle2} accentColor="green" />
          <KPICard label="Pending Requests" value={2} subLabel="Awaiting response" icon={Clock} accentColor="amber" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Operational Health Scores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskFactors} layout="vertical">
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" horizontal={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
              />
              <YAxis 
                type="category"
                dataKey="factor" 
                tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                tickLine={false} 
                axisLine={false}
                width={130}
              />
              <Tooltip
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`${value}/100`, 'Score']}
              />
              <Bar 
                dataKey="score" 
                fill="#10B981" 
                radius={[0, 8, 8, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Risk Score Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrend}>
              <defs>
                <linearGradient id="vendorRiskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
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
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`${value}/100`, 'Risk Score']}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5 }}
                activeDot={{ r: 7 }}
                fill="url(#vendorRiskGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operational Metrics Radar Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Operational Metrics Overview</h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={operationalMetrics}>
            <PolarGrid stroke="#f3f4f6" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fontSize: 12, fill: '#9CA3AF', fontFamily: 'Inter' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }}
            />
            <Radar 
              name="Performance" 
              dataKey="value" 
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #E5E7EB', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                fontFamily: 'Inter'
              }}
              formatter={(value: number) => [`${value}/100`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Operational Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Confirmed Bookings:</span> <span className="font-bold">12</span></div>
          <div><span className="text-gray-500">Pending:</span> <span className="font-bold">2</span></div>
          <div><span className="text-gray-500">Staff Count:</span> <span className="font-bold">8</span></div>
          <div><span className="text-gray-500">Inventory Items:</span> <span className="font-bold">45</span></div>
          <div><span className="text-gray-500">Confirmed Revenue:</span> <span className="font-bold font-mono text-green-600">₹8.5L</span></div>
        </div>
      </div>

      <div className="gradient-purple-primary rounded-2xl p-6 text-white">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-lg">AI OPERATIONS ANALYSIS</h3>
        </div>
        <p className="text-white/90">Your operations are running smoothly. All confirmed orders are on schedule. Staff availability is good. Inventory levels are healthy. Focus on responding to the 2 pending booking requests to maximize revenue.</p>
      </div>
    </div>
  );
};