'use client';
// src/components/risk/FactorBarChart.tsx

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getScoreColor } from '@/lib/design-tokens';

interface Props {
  factors: Record<string, number>;
}

const FACTOR_LABELS: Record<string, string> = {
  vendorReliability:    'Vendor Reliability',
  openIncidents:        'Open Incidents',
  taskDelays:           'Task Delays',
  staffIssues:          'Staff Issues',
  weatherRisk:          'Weather Risk',
  stakeholderPressure:  'Stakeholder Pressure',
  inventoryStrain:      'Inventory Strain',
  paymentDelays:        'Payment Delays',
  staffOverload:        'Staff Overload',
  transportRisk:        'Transport Risk',
  lastMinuteChanges:    'Last-Minute Changes',
  vendorCancellation:   'Vendor Cancellation',
  budgetOverrun:        'Budget Overrun',
  guestOverload:        'Guest Overload',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { name: string } }[] }) => {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const color = getScoreColor(score);
  const level = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-body)',
    }}>
      <p style={{ color: 'var(--text-soft)', fontSize: 11, marginBottom: 4 }}>{payload[0].payload.name}</p>
      <p style={{ color, fontWeight: 700, fontSize: 16 }}>{score}<span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>/100</span></p>
      <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{level}</p>
    </div>
  );
};

export default function FactorBarChart({ factors }: Props) {
  const data = Object.entries(factors).map(([key, value]) => ({
    name: FACTOR_LABELS[key] ?? key,
    score: Math.round(value),
  })).sort((a, b) => b.score - a.score);

  return (
    <div style={{ width: '100%', height: Math.max(220, data.length * 44) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
          barSize={18}
        >
          <CartesianGrid horizontal={false} stroke="#2B124C" />
          <XAxis
            type="number" domain={[0, 100]} tickCount={5}
            tick={{ fill: '#854F6C', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: '#522B5B' }} tickLine={false}
          />
          <YAxis
            type="category" dataKey="name" width={140}
            tick={{ fill: '#DFB6B2', fontSize: 11, fontFamily: 'var(--font-body)' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(82,43,91,0.3)' }} />
          <Bar dataKey="score" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getScoreColor(entry.score)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
