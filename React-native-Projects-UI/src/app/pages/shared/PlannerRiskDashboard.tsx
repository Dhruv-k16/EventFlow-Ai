import React from 'react';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KPICard } from '../../components/shared/KPICard';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PlannerRiskDashboardProps {
  eventId?: string;
}

export const PlannerRiskDashboard: React.FC<PlannerRiskDashboardProps> = ({ eventId }) => {
  const riskScore = 35;
  const riskLevel = 'LOW' as const;
  const riskColor = '#10B981';

  const factorsData = [
    { factor: 'Weather Conditions', value: 20, color: '#10B981' },
    { factor: 'Vendor Reliability', value: 15, color: '#10B981' },
    { factor: 'Budget Variance', value: 45, color: '#F59E0B' },
    { factor: 'Guest Count Change', value: 10, color: '#10B981' },
    { factor: 'Timeline Pressure', value: 35, color: '#10B981' },
    { factor: 'External Dependencies', value: 25, color: '#10B981' },
  ];

  const trendData = [
    { date: 'Mar 1', score: 42 },
    { date: 'Mar 3', score: 38 },
    { date: 'Mar 5', score: 40 },
    { date: 'Mar 7', score: 36 },
    { date: 'Mar 9', score: 35 },
  ];

  return (
    <div className="space-y-6">
      {/* Sticky Sub-bar */}
      <div className="sticky top-16 z-20 bg-white shadow-sm rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-[#6E3482]" />
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>⚡ Risk Analysis</h2>
            <p className="text-sm text-gray-500">Sharma Wedding • <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">PLANNER</span></p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} />
          <span className="text-sm">Last updated: 2 min ago</span>
        </button>
      </div>

      {/* Row 1: Arc Dial + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Arc Dial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center"
        >
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <defs>
                <filter id="planner-risk-glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke={riskColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(riskScore / 100) * 220} 220`}
                filter="url(#planner-risk-glow)"
                style={{ opacity: 0.2 }}
              />
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke={riskColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(riskScore / 100) * 220} 220`}
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
            <p className="text-sm text-gray-600 mt-2">All systems operational</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5">
          <KPICard label="Active Alerts" value={2} subLabel="Requires attention" icon={AlertTriangle} accentColor="amber" />
          <KPICard label="Confirmed Vendors" value={12} subLabel="Out of 15" icon={CheckCircle2} accentColor="green" />
          <KPICard label="Unconfirmed" value={3} subLabel="Pending response" icon={Clock} accentColor="amber" />
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Risk Factors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={factorsData} layout="vertical">
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="factor" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={150} />
              <Tooltip
                contentStyle={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontFamily: 'Inter', fontSize: 12 }}
              />
              <Bar dataKey="value" fill="#6E3482" radius={[0, 4, 4, 0]} barSize={24} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Trend */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Risk Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="plannerRiskColorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={riskColor} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={riskColor} stopOpacity={0.03}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="score" stroke={riskColor} strokeWidth={2.5} fill="url(#plannerRiskColorScore)" animationDuration={600} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-3 mt-4 text-center text-sm">
            <div><span className="text-gray-400 block text-xs">Current</span><span className="font-mono font-bold">{riskScore}</span></div>
            <div><span className="text-gray-400 block text-xs">Min</span><span className="font-mono font-bold">35</span></div>
            <div><span className="text-gray-400 block text-xs">Max</span><span className="font-mono font-bold">42</span></div>
            <div><span className="text-gray-400 block text-xs">Avg</span><span className="font-mono font-bold">38</span></div>
          </div>
        </div>
      </div>

      {/* Row 3: Financial + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h3 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Total Budget</span><span className="font-mono font-bold text-lg">₹15,00,000</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Spend</span><span className="font-mono font-bold text-lg text-red-600">₹10,50,000</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Projected Cost</span><span className="font-mono font-bold text-lg">₹14,20,000</span></div>
          </div>
          <div className="pt-4">
            <div className="flex justify-between mb-2"><span className="text-sm font-semibold">Budget Utilisation</span><span className="font-mono font-bold">70%</span></div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#6E3482] to-[#A56ABD] rounded-full"
              />
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>GEMINI AI ANALYSIS</h3>
            <span className="ml-auto text-xs bg-[#F3E8FF] text-[#6E3482] px-2 py-1 rounded-full">gemini-2.5-flash</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Your event is tracking well with minimal risk exposure. All critical vendors are confirmed. Weather forecast is favorable. Budget utilisation is healthy at 70%. Continue monitoring pending vendor confirmations.
          </p>
          <div className="space-y-2">
            {['Monitor weather updates 48 hours before event', 'Follow up with 3 pending vendors', 'Review backup contingency plans'].map((rec, idx) => (
              <div key={idx} className="flex gap-3 bg-[#F3E8FF] rounded-lg p-3">
                <span className="font-mono text-sm text-gray-400">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};