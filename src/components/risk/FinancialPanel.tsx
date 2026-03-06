'use client';
// src/components/risk/FinancialPanel.tsx

interface Props {
  role: 'PLANNER' | 'CLIENT' | 'VENDOR';
  data: Record<string, number | boolean | string | null>;
}

function Row({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid var(--border-soft)',
    }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
        color: warn ? '#EF4444' : highlight ? '#22C55E' : 'var(--text-primary)',
      }}>{value}</span>
    </div>
  );
}

const fmt = (n: number | null | undefined) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';
const pct = (n: number | null | undefined) =>
  n != null ? `${Number(n).toFixed(1)}%` : '—';

export default function FinancialPanel({ role, data }: Props) {
  const margin = Number(data.profitMargin ?? 0);
  const marginColor = margin < 10 ? '#EF4444' : margin < 20 ? '#EAB308' : '#22C55E';
  const highExposure = Boolean(data.highExposure);

  return (
    <div>
      {highExposure && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#EF4444' }}>
            High financial exposure detected
          </span>
        </div>
      )}

      {role === 'PLANNER' && (
        <div>
          <Row label="Total Budget"         value={fmt(data.totalBudget as number)} />
          <Row label="Current Spend"        value={fmt(data.currentSpend as number)} />
          <Row label="Balance Due"          value={fmt(data.balanceDue as number)} />
          <Row label="Contingency Reserve"  value={fmt(data.contingencyReserve as number)} />
          <Row label="Predicted Final Spend" value={fmt(data.predictedFinalSpend as number)} />
          <Row label="Variance"             value={fmt(data.variance as number)}
            highlight={(data.variance as number) > 0} warn={(data.variance as number) < 0} />
          <Row label="Revenue"              value={fmt(data.revenue as number)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Profit Margin</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
              color: marginColor,
              textShadow: `0 0 12px ${marginColor}60`,
            }}>{pct(margin)}</span>
          </div>
        </div>
      )}

      {role === 'CLIENT' && (
        <div>
          <Row label="Total Budget"      value={fmt(data.totalBudget as number)} />
          <Row label="Actual Spend"      value={fmt(data.currentSpend as number)} />
          <Row label="Balance Due"       value={fmt(data.balanceDue as number)} />
          <Row label="Overrun Amount"    value={data.overrun ? fmt(data.overrun as number) : 'None'}
            warn={Boolean(data.overrun && (data.overrun as number) > 0)} />
          <Row label="Budget Utilisation" value={pct(data.budgetUtilisation as number)} />
          <Row label="Refund Exposure"   value={fmt(data.refundExposure as number)} warn />
          <Row label="Variance"          value={fmt(data.variance as number)}
            highlight={(data.variance as number) > 0} warn={(data.variance as number) < 0} />
        </div>
      )}

      {role === 'VENDOR' && (
        <div>
          <Row label="Wage Cost"      value={fmt(data.wageCost as number)} />
          <Row label="Logistics Cost" value={fmt(data.logisticsCost as number)} />
          <Row label="Material Cost"  value={fmt(data.materialCost as number)} />
          <Row label="Contingency"    value={fmt(data.contingency as number)} />
          <Row label="Total Cost"     value={fmt(data.totalCost as number)} />
          <Row label="Revenue"        value={fmt(data.revenue as number)} highlight />
          <Row label="Profit"         value={fmt(data.profit as number)}
            highlight={(data.profit as number) > 0} warn={(data.profit as number) < 0} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Profit Margin</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
              color: marginColor, textShadow: `0 0 12px ${marginColor}60`,
            }}>{pct(margin)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
