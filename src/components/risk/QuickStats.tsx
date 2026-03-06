'use client';
// src/components/risk/QuickStats.tsx

import { getScoreColor } from '@/lib/design-tokens';

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  alert?: boolean;
  color?: string;
}

interface Props {
  role: 'PLANNER' | 'CLIENT' | 'VENDOR';
  data: {
    bookingSummary?: { total: number; confirmed: number; unconfirmed: number; cancelled: number };
    liveStatus?: { isActive: boolean; totalTasks: number; delayedTasks: number; openIncidents: number; criticalIncidents: number; changeRequestCount: number };
    financialAnalysis?: { totalBudget: number; currentSpend: number; profitMargin: number; highExposure: boolean };
    riskAnalysis?: { overallScore: number };
  };
}

function Stat({ label, value, sub, alert, color }: StatCard) {
  const c = color ?? 'var(--text-primary)';
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${alert ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
      borderRadius: 12,
      padding: '14px 16px',
      flex: 1,
      minWidth: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {alert && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #EF4444, #F97316)',
        }} />
      )}
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 11,
        color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: '0.08em', marginBottom: 6,
      }}>{label}</p>
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 22, color: c, lineHeight: 1,
      }}>{value}</p>
      {sub && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>
      )}
    </div>
  );
}

export default function QuickStats({ role, data }: Props) {
  const { bookingSummary: bs, liveStatus: ls, financialAnalysis: fa } = data;

  if (role === 'PLANNER') {
    const unconfirmedRate = bs ? ((bs.unconfirmed / Math.max(bs.total, 1)) * 100).toFixed(0) : '0';
    return (
      <div style={{ display: 'flex', gap: 12, flex: 1 }}>
        <Stat
          label="Vendors Confirmed"
          value={bs ? `${bs.confirmed}/${bs.total}` : '—'}
          sub={`${unconfirmedRate}% unconfirmed`}
          alert={(bs?.unconfirmed ?? 0) > 0}
          color={(bs?.unconfirmed ?? 0) > 0 ? '#F97316' : '#22C55E'}
        />
        <Stat
          label="Open Incidents"
          value={ls?.openIncidents ?? 0}
          sub={ls?.criticalIncidents ? `${ls.criticalIncidents} critical` : 'All clear'}
          alert={(ls?.openIncidents ?? 0) > 0}
          color={(ls?.openIncidents ?? 0) > 0 ? '#EF4444' : '#22C55E'}
        />
        <Stat
          label="Delayed Tasks"
          value={ls ? `${ls.delayedTasks}/${ls.totalTasks}` : '—'}
          sub={ls && ls.totalTasks > 0 ? `${((ls.delayedTasks / ls.totalTasks) * 100).toFixed(0)}% delayed` : 'No tasks'}
          alert={(ls?.delayedTasks ?? 0) > 0}
          color={(ls?.delayedTasks ?? 0) > 0 ? '#EAB308' : '#22C55E'}
        />
      </div>
    );
  }

  if (role === 'CLIENT') {
    const budgetUsed = fa && fa.totalBudget > 0 ? ((fa.currentSpend / fa.totalBudget) * 100).toFixed(0) : '0';
    const overrun    = fa ? Math.max(0, fa.currentSpend - fa.totalBudget) : 0;
    return (
      <div style={{ display: 'flex', gap: 12, flex: 1 }}>
        <Stat
          label="Budget Used"
          value={`${budgetUsed}%`}
          sub={fa ? `₹${fa.currentSpend.toLocaleString('en-IN')} spent` : '—'}
          color={Number(budgetUsed) > 90 ? '#EF4444' : Number(budgetUsed) > 70 ? '#EAB308' : '#22C55E'}
        />
        <Stat
          label="Budget Overrun"
          value={overrun > 0 ? `₹${overrun.toLocaleString('en-IN')}` : 'None'}
          sub={overrun > 0 ? 'Over budget' : 'Within budget'}
          alert={overrun > 0}
          color={overrun > 0 ? '#EF4444' : '#22C55E'}
        />
        <Stat
          label="Vendors Confirmed"
          value={bs ? `${bs.confirmed}/${bs.total}` : '—'}
          sub={(bs?.unconfirmed ?? 0) > 0 ? `${bs?.unconfirmed} pending` : 'All confirmed'}
          alert={(bs?.unconfirmed ?? 0) > 0}
          color={(bs?.unconfirmed ?? 0) > 0 ? '#F97316' : '#22C55E'}
        />
      </div>
    );
  }

  // VENDOR
  const margin = fa?.profitMargin ?? 0;
  return (
    <div style={{ display: 'flex', gap: 12, flex: 1 }}>
      <Stat
        label="Profit Margin"
        value={`${margin.toFixed(1)}%`}
        sub={margin < 10 ? 'Below target' : margin < 20 ? 'Acceptable' : 'Healthy'}
        color={margin < 10 ? '#EF4444' : margin < 20 ? '#EAB308' : '#22C55E'}
        alert={margin < 10}
      />
      <Stat
        label="Open Incidents"
        value={ls?.openIncidents ?? 0}
        sub={ls?.criticalIncidents ? `${ls.criticalIncidents} critical` : 'All clear'}
        alert={(ls?.openIncidents ?? 0) > 0}
        color={(ls?.openIncidents ?? 0) > 0 ? '#EF4444' : '#22C55E'}
      />
      <Stat
        label="Change Requests"
        value={ls?.changeRequestCount ?? 0}
        sub="Stakeholder pressure"
        color={(ls?.changeRequestCount ?? 0) > 3 ? '#F97316' : 'var(--text-primary)'}
      />
    </div>
  );
}
