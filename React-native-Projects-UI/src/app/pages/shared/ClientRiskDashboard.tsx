import React from 'react';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KPICard } from '../../components/shared/KPICard';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

interface ClientRiskDashboardProps {
  eventId?: string;
}

export const ClientRiskDashboard: React.FC<ClientRiskDashboardProps> = ({ eventId }) => {
  const riskScore = 25;
  const riskLevel = 'LOW' as const;
  const riskColor = '#10B981';

  // Vendor confirmation status data
  const vendorStatusData = [
    { status: 'Confirmed', count: 8, color: '#10B981' },
    { status: 'Pending', count: 2, color: '#F59E0B' },
    { status: 'Declined', count: 0, color: '#EF4444' },
  ];

  // Budget tracking by category
  const budgetByCategory = [
    { category: 'Catering', committed: 320000, percentage: 62 },
    { category: 'Decor', committed: 150000, percentage: 29 },
    { category: 'AV/Tech', committed: 45000, percentage: 9 },
  ];

  // Event readiness factors
  const readinessFactors = [
    { factor: 'Vendor Confirmation', score: 80 },
    { factor: 'Budget Commitment', score: 95 },
    { factor: 'Timeline Progress', score: 70 },
    { factor: 'Weather Forecast', score: 85 },
    { factor: 'Guest RSVP', score: 60 },
  ];

  // Timeline data
  const timelineData = [
    { week: 'Week 1', readiness: 30 },
    { week: 'Week 2', readiness: 45 },
    { week: 'Week 3', readiness: 60 },
    { week: 'Week 4', readiness: 75 },
    { week: 'Week 5', readiness: 80 },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-16 z-20 bg-white shadow-sm rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-[#6E3482]" />
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Risk Overview</h2>
            <p className="text-sm text-gray-500">
              Sharma Wedding • <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">CLIENT</span>
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} />
          <span className="text-sm">Last updated: 5 min ago</span>
        </button>
      </div>

      {/* Row 1: Risk Score + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Risk Score Arc Dial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center"
        >
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <defs>
                <filter id="client-risk-glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur" key="client-risk-blur"/>
                    <feMergeNode in="SourceGraphic" key="client-risk-graphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="16"
                strokeLinecap="round"
                key="client-risk-background"
              />
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke={riskColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(riskScore / 100) * 220} 220`}
                filter="url(#client-risk-glow)"
                style={{ opacity: 0.2 }}
                key="client-risk-glow"
              />
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke={riskColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(riskScore / 100) * 220} 220`}
                key="client-risk-arc"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
              <span className="text-5xl font-extrabold font-mono" style={{ fontFamily: 'JetBrains Mono', color: riskColor }}>
                {riskScore}
              </span>
              <span className="text-sm text-gray-400">/100</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <StatusBadge status={riskLevel} />
            <p className="text-sm text-gray-600 mt-2">Your event is on track</p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5">
          <KPICard label="Vendors Confirmed" value="8/10" subLabel="2 pending response" icon={CheckCircle2} accentColor="green" />
          <KPICard label="Budget Committed" value="₹5.15L" subLabel="Out of ₹6.5L budget" icon={TrendingDown} accentColor="purple" />
          <KPICard label="Days Until Event" value={42} subLabel="Plenty of time" icon={Clock} accentColor="amber" />
        </div>
      </div>

      {/* Row 2: Vendor Status & Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Confirmation Status - Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Vendor Confirmation Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vendorStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {vendorStatusData.map((entry, index) => (
                  <Cell key={`client-vendor-status-${entry.status}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                key="client-vendor-tooltip"
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`${value} vendor(s)`, 'Count']}
              />
              <Legend 
                key="client-vendor-legend"
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>2 vendor(s)</strong> still pending confirmation. Your planner is following up.
            </p>
          </div>
        </div>

        {/* Budget Commitment by Category - Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Budget Commitment by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetByCategory}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" key="client-budget-grid" />
              <XAxis 
                key="client-budget-xaxis"
                dataKey="category" 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                key="client-budget-yaxis"
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                key="client-budget-tooltip"
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`₹${(value / 1000).toFixed(0)}k`, 'Committed']}
              />
              <Bar 
                dataKey="committed" 
                fill="#6E3482" 
                radius={[8, 8, 0, 0]} 
                barSize={60}
                key="client-budget-bar"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            {budgetByCategory.map((cat, idx) => (
              <div key={idx}>
                <span className="text-gray-400 block text-xs">{cat.category}</span>
                <span className="font-mono font-bold">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Event Readiness Factors */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Readiness Factors</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={readinessFactors} layout="vertical">
            <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" horizontal={false} key="client-readiness-grid" />
            <XAxis 
              key="client-readiness-xaxis"
              type="number"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }} 
              tickLine={false} 
              axisLine={false}
              domain={[0, 100]}
            />
            <YAxis 
              key="client-readiness-yaxis"
              type="category"
              dataKey="factor" 
              tick={{ fontSize: 12, fill: '#9CA3AF' }} 
              tickLine={false} 
              axisLine={false}
              width={150}
            />
            <Tooltip
              key="client-readiness-tooltip"
              contentStyle={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #E5E7EB', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                fontFamily: 'Inter'
              }}
              formatter={(value: number) => [`${value}%`, 'Readiness']}
            />
            <Bar 
              dataKey="score" 
              fill="#10B981" 
              radius={[0, 8, 8, 0]} 
              barSize={30}
              key="client-readiness-bar"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 4: Timeline Progress & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Readiness Timeline - Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Event Readiness Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <defs>
                <linearGradient id="clientTimelineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} key="client-gradient-start"/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} key="client-gradient-end"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" key="client-timeline-grid" />
              <XAxis 
                key="client-timeline-xaxis"
                dataKey="week" 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                key="client-timeline-yaxis"
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                key="client-timeline-tooltip"
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter'
                }}
                formatter={(value: number) => [`${value}%`, 'Readiness']}
              />
              <Line 
                type="monotone" 
                dataKey="readiness" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5 }}
                activeDot={{ r: 7 }}
                fill="url(#clientTimelineGradient)"
                key="client-timeline-line"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Your event is <span className="font-bold text-green-600">80% ready</span> with 42 days to go</p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>What to Keep in Mind</h3>
          <div className="space-y-3">
            {[
              { icon: '☀️', text: 'Weather forecast is favorable for your outdoor event' },
              { icon: '✅', text: '80% of vendors have confirmed - great progress!' },
              { icon: '💰', text: 'Budget utilization is healthy at 79%' },
              { icon: '👥', text: 'Continue monitoring guest RSVP responses' },
              { icon: '📋', text: 'Your planner is managing all vendor coordination' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-[#F3E8FF] rounded-lg p-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <p className="text-sm text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Financial Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase mb-1">Total Budget</p>
            <p className="font-mono font-bold text-xl text-[#49225B]">₹6.50L</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase mb-1">Committed</p>
            <p className="font-mono font-bold text-xl text-amber-600">₹5.15L</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase mb-1">Remaining</p>
            <p className="font-mono font-bold text-xl text-green-600">₹1.35L</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase mb-1">Utilization</p>
            <p className="font-mono font-bold text-xl">79%</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Budget Progress</span>
            <span className="font-mono font-bold text-sm">79%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '79%' }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#6E3482] to-[#A56ABD] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="gradient-purple-primary rounded-2xl p-6 text-white">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-lg">AI EVENT ANALYSIS</h3>
          <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">gemini-2.5-flash</span>
        </div>
        <p className="text-white/90 mb-4">
          Your Sharma Wedding is progressing excellently! With 80% vendor confirmation and 79% budget committed, you're well on track. 
          The weather forecast looks favorable, and all major arrangements are falling into place. Your planner is actively managing 
          the 2 pending vendor confirmations. Continue monitoring guest RSVPs, and you'll be all set for a memorable celebration.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold mb-1">✅ On Track</p>
            <p className="text-white/80 text-xs">Vendor coordination, budget management</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold mb-1">👀 Monitor</p>
            <p className="text-white/80 text-xs">Guest RSVP responses</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold mb-1">📅 Next Up</p>
            <p className="text-white/80 text-xs">Final vendor confirmations</p>
          </div>
        </div>
      </div>
    </div>
  );
};