'use client';
// src/app/dashboard/risk/event/[eventId]/page.tsx

import { useState, useEffect, useCallback } from 'react';
import RiskScoreDial     from '@/components/risk/RiskScoreDial';
import QuickStats        from '@/components/risk/QuickStats';
import FactorBarChart    from '@/components/risk/FactorBarChart';
import TrendLineChart    from '@/components/risk/TrendLineChart';
import FinancialPanel    from '@/components/risk/FinancialPanel';
import AISummary         from '@/components/risk/AISummary';
import {
  WeatherWidget, BookingSummaryWidget,
  LiveStatusWidget, AlertsBanner,
} from '@/components/risk/SmallWidgets';

// ── Types ─────────────────────────────────────────────────────────

type Role = 'PLANNER' | 'CLIENT';

interface RiskData {
  role: string;
  event: { id: string; name: string; startDate: string; location: string; guestCount: number };
  riskAnalysis: { overallScore: number; level: string; breakdown: Record<string, number>; trend: { date: string; score: number }[] };
  weather: { condition: string; precipitationProbability: number; maxWindSpeed: number; riskScore: number; riskLevel: string; geocoded: boolean } | null;
  financialAnalysis: Record<string, number | boolean | string | null>;
  bookingSummary: { total: number; confirmed: number; unconfirmed: number; cancelled: number };
  liveStatus: { isActive: boolean; totalTasks: number; delayedTasks: number; openIncidents: number; criticalIncidents: number; changeRequestCount: number };
  aiSummary: string;
  recommendations: string[];
  alerts: string[];
}

interface TrendPoint { date: string; score: number; timestamp?: string; }

// ── Card wrapper ──────────────────────────────────────────────────

function Card({
  title, subtitle, children, className = '', style = {},
}: { title?: string; subtitle?: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)', ...style,
    }} className={className}>
      {title && (
        <div style={{
          background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{title}</p>
            {subtitle && <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</p>}
          </div>
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 60, borderRadius: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16 }}>
        <div className="skeleton" style={{ width: 200, height: 200, borderRadius: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function RiskDashboardPage({
  params, searchParams,
}: {
  params: { eventId: string };
  searchParams: { role?: string };
}) {
  const eventId     = params.eventId;
  const [role, setRole] = useState<Role>((searchParams.role as Role) ?? 'PLANNER');
  const [data, setData]     = useState<RiskData | null>(null);
  const [trend, setTrend]   = useState<TrendPoint[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') ?? ''
        : '';

      const headers = { Authorization: `Bearer ${token}` };

      const [riskRes, trendRes] = await Promise.all([
        fetch(`/api/risk/event/${eventId}?role=${role}`, { headers }),
        fetch(`/api/risk/trend/${eventId}?type=EVENT&role=${role}`, { headers }),
      ]);

      if (!riskRes.ok) throw new Error(`Risk API error: ${riskRes.status}`);

      const riskData  = await riskRes.json();
      const trendData = trendRes.ok ? await trendRes.json() : { trend: [] };

      setData(riskData);
      setTrend(trendData.trend ?? riskData.riskAnalysis?.trend ?? []);
      setLastRefreshed(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load risk data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId, role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <DashboardSkeleton />;

  if (error) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12, padding: 24,
    }}>
      <span style={{ fontSize: 40 }}>⚠️</span>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>Failed to load dashboard</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>{error}</p>
      <button onClick={() => fetchData()}
        style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 20px', color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer',
        }}>Try again</button>
    </div>
  );

  if (!data) return null;

  const { riskAnalysis: ra, event, weather, financialAnalysis: fa,
          bookingSummary: bs, liveStatus: ls, aiSummary, recommendations, alerts } = data;

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 20% 0%, #2B124C 0%, var(--bg-primary) 50%)`,
      paddingBottom: 48,
    }}>

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(43,18,76,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 16, height: 60,
        }}>
          {/* Logo */}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em', flexShrink: 0 }}>
            EventFlow<span style={{ color: '#854F6C' }}>AI</span>
          </span>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          {/* Event info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {event.name}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
              {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {event.location ? ` · ${event.location}` : ''}
              {event.guestCount ? ` · ${event.guestCount} guests` : ''}
            </p>
          </div>

          {/* Role toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-primary)',
            border: '1px solid var(--border)', borderRadius: 8, padding: 3, gap: 2, flexShrink: 0,
          }}>
            {(['PLANNER', 'CLIENT'] as Role[]).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: role === r ? 'var(--bg-elevated)' : 'transparent',
                color: role === r ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
              }}>{r}</button>
            ))}
          </div>

          {/* Refresh */}
          <button onClick={() => fetchData(true)} disabled={refreshing} style={{
            background: refreshing ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '6px 14px', color: 'var(--text-primary)', cursor: refreshing ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.2s ease', opacity: refreshing ? 0.6 : 1, flexShrink: 0,
          }}>
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>↻</span>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>

          {lastRefreshed && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
              {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 0' }}>

        {/* Row 1 — Hero: Dial + Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 20, marginBottom: 20,
          alignItems: 'stretch',
        }} className="animate-fade-in-up">
          {/* Dial card */}
          <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <RiskScoreDial score={ra.overallScore} level={ra.level} size={180} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                Overall Risk Score
              </p>
            </div>
          </Card>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <QuickStats role={role} data={{ bookingSummary: bs, liveStatus: ls, financialAnalysis: fa as Parameters<typeof QuickStats>[0]['data']['financialAnalysis'] }} />
          </div>
        </div>

        {/* Row 2 — Charts */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 20, marginBottom: 20,
        }} className="animate-fade-in-up stagger-2">
          <Card title="Risk Factor Breakdown" subtitle="Score per factor (0–100)">
            <FactorBarChart factors={ra.breakdown} />
          </Card>
          <Card title="Risk Trend" subtitle="Historical score over last 30 analyses">
            <TrendLineChart trend={trend} currentLevel={ra.level} />
          </Card>
        </div>

        {/* Row 3 — Financial + AI */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 20, marginBottom: 20,
        }} className="animate-fade-in-up stagger-3">
          <Card title="Financial Summary" subtitle={role === 'PLANNER' ? 'Profit & budget analysis' : 'Budget utilisation'}>
            <FinancialPanel role={role} data={fa as Record<string, number | boolean | string | null>} />
          </Card>
          <Card
            title="AI Analysis"
            subtitle="Powered by Gemini 2.5 Flash"
            style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, var(--bg-card) 100%)' }}
          >
            <AISummary summary={aiSummary} recommendations={recommendations} alerts={alerts} />
          </Card>
        </div>

        {/* Row 4 — Small widgets */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 20, marginBottom: 20,
        }} className="animate-fade-in-up stagger-4">
          <WeatherWidget weather={weather} />
          <BookingSummaryWidget bookingSummary={bs} />
          <LiveStatusWidget liveStatus={ls} />
        </div>

        {/* Row 5 — Alerts */}
        {alerts?.length > 0 && (
          <div className="animate-fade-in-up stagger-5">
            <AlertsBanner alerts={alerts} />
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .dashboard-grid-charts { grid-template-columns: 1fr !important; }
          .dashboard-grid-hero   { grid-template-columns: 1fr !important; }
          .dashboard-grid-small  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
