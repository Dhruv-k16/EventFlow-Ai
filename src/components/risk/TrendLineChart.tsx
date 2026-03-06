'use client';
// src/components/risk/TrendLineChart.tsx

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getScoreColor } from '@/lib/design-tokens';

interface TrendPoint { date: string; score: number; timestamp?: string; }
interface Props { trend: TrendPoint[]; currentLevel: string; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const color = getScoreColor(score);
  const level = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-body)',
    }}>
      <p style={{ color: 'var(--text-soft)', fontSize: 11, marginBottom: 4 }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: 16 }}>
        {score}<span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>/100</span>
      </p>
      <span className={`risk-badge risk-badge-${level.toLowerCase()}`} style={{ marginTop: 4 }}>{level}</span>
    </div>
  );
};

export default function TrendLineChart({ trend, currentLevel }: Props) {
  if (!trend?.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          No trend data yet — run more analyses to build history
        </p>
      </div>
    );
  }

  const color   = getScoreColor(trend[trend.length - 1]?.score ?? 0);
  const scores  = trend.map(t => t.score);
  const min     = Math.min(...scores);
  const max     = Math.max(...scores);
  const avg     = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Format date labels
  const data = trend.map(t => ({
    ...t,
    label: new Date(t.timestamp ?? t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2B124C" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#854F6C', fontSize: 10, fontFamily: 'var(--font-body)' }}
              axisLine={{ stroke: '#522B5B' }} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]} tickCount={5}
              tick={{ fill: '#854F6C', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false} tickLine={false} width={28}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={75} stroke="#EF444440" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="#F9731640" strokeDasharray="4 4" />
            <ReferenceLine y={25} stroke="#EAB30840" strokeDasharray="4 4" />
            <Area
              type="monotone" dataKey="score"
              stroke={color} strokeWidth={2.5}
              fill="url(#trendGrad)"
              dot={trend.length <= 10 ? { fill: color, r: 3, strokeWidth: 0 } : false}
              activeDot={{ fill: color, r: 5, strokeWidth: 2, stroke: 'var(--bg-primary)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'flex', gap: 0, marginTop: 12,
        borderTop: '1px solid var(--border)', paddingTop: 12,
      }}>
        {[
          { label: 'Latest', value: trend[trend.length - 1]?.score ?? 0 },
          { label: 'Highest', value: max },
          { label: 'Average', value: avg },
          { label: 'Lowest',  value: min },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center',
            borderRight: i < 3 ? '1px solid var(--border)' : 'none',
          }}>
            <p style={{ color: getScoreColor(s.value), fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{s.value}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
