'use client';
// src/components/risk/SmallWidgets.tsx

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getScoreColor } from '@/lib/design-tokens';

// ── W7 Weather ────────────────────────────────────────────────────

interface WeatherData {
  condition: string; precipitationProbability: number;
  maxWindSpeed: number; riskScore: number; riskLevel: string; geocoded: boolean;
}

export function WeatherWidget({ weather }: { weather: WeatherData | null }) {
  if (!weather) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px', height: '100%',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
          🌤 Weather Risk
        </p>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 28, opacity: 0.4 }}>🗓</span>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Weather data unavailable — event date too far ahead or location not found
          </p>
        </div>
      </div>
    );
  }

  const color      = getScoreColor(weather.riskScore);
  const condIcons: Record<string, string> = {
    'Clear sky': '☀️', 'Partly cloudy': '⛅', 'Overcast': '☁️',
    'Rain': '🌧', 'Drizzle': '🌦', 'Thunderstorm': '⛈', 'Snow': '❄️', 'Fog': '🌫',
  };
  const icon = Object.entries(condIcons).find(([k]) => weather.condition.includes(k))?.[1] ?? '🌡';

  return (
    <div style={{
      border: `1px solid ${color}40`,
      borderRadius: 12, padding: '16px', height: '100%',
      background: `linear-gradient(135deg, var(--bg-card) 0%, ${color}10 100%)`,
    } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
            🌤 Weather Risk
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-soft)' }}>{weather.condition}</p>
        </div>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color }}>
            {weather.riskScore}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Risk Score</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
            {weather.precipitationProbability}%
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rain Chance</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
            {weather.maxWindSpeed}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>km/h Wind</p>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <span className={`risk-badge risk-badge-${weather.riskLevel.toLowerCase()}`}>{weather.riskLevel} WEATHER RISK</span>
      </div>
    </div>
  );
}

// ── W8 Booking Summary ────────────────────────────────────────────

interface BookingSummary { total: number; confirmed: number; unconfirmed: number; cancelled: number; }

export function BookingSummaryWidget({ bookingSummary }: { bookingSummary: BookingSummary }) {
  const data = [
    { name: 'Confirmed',   value: bookingSummary.confirmed,   color: '#22C55E' },
    { name: 'Unconfirmed', value: bookingSummary.unconfirmed, color: '#F97316' },
    { name: 'Cancelled',   value: bookingSummary.cancelled,   color: '#EF4444' },
  ].filter(d => d.value > 0);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px', height: '100%',
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
        📋 Booking Summary
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
        {bookingSummary.total} total vendors
      </p>

      {bookingSummary.unconfirmed > 0 && (
        <div style={{
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 6, padding: '6px 10px', marginBottom: 10,
          fontFamily: 'var(--font-body)', fontSize: 11, color: '#F97316',
        }}>
          ⚠ {bookingSummary.unconfirmed} vendor{bookingSummary.unconfirmed > 1 ? 's' : ''} not yet confirmed
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 80, height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.length ? data : [{ name: 'Empty', value: 1, color: '#2B124C' }]}
                dataKey="value" innerRadius={24} outerRadius={38} paddingAngle={2} startAngle={90} endAngle={450}>
                {(data.length ? data : [{ color: '#2B124C' }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: 'Confirmed',   val: bookingSummary.confirmed,   c: '#22C55E' },
            { label: 'Unconfirmed', val: bookingSummary.unconfirmed, c: '#F97316' },
            { label: 'Cancelled',   val: bookingSummary.cancelled,   c: '#EF4444' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.c }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{r.label}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: r.c }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── W9 Live Event Status ──────────────────────────────────────────

interface LiveStatus {
  isActive: boolean; totalTasks: number; delayedTasks: number;
  openIncidents: number; criticalIncidents: number; changeRequestCount: number;
}

export function LiveStatusWidget({ liveStatus }: { liveStatus: LiveStatus | undefined }) {
  if (!liveStatus) return null;
  const delayRate = liveStatus.totalTasks > 0
    ? ((liveStatus.delayedTasks / liveStatus.totalTasks) * 100).toFixed(0)
    : '0';

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px', height: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
          ⚡ Live Event Status
        </p>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
          padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.08em',
          background: liveStatus.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(133,79,108,0.15)',
          color: liveStatus.isActive ? '#22C55E' : 'var(--text-muted)',
          border: `1px solid ${liveStatus.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(133,79,108,0.3)'}`,
        }}>
          {liveStatus.isActive ? '● Live' : 'Not Started'}
        </span>
      </div>

      {liveStatus.criticalIncidents > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 6, padding: '6px 10px', marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <span style={{ fontSize: 12 }}>🚨</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#EF4444' }}>
            {liveStatus.criticalIncidents} critical incident{liveStatus.criticalIncidents > 1 ? 's' : ''} active
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Tasks', value: `${liveStatus.delayedTasks}/${liveStatus.totalTasks} delayed (${delayRate}%)`, warn: Number(delayRate) > 30 },
          { label: 'Open Incidents', value: liveStatus.openIncidents, warn: liveStatus.openIncidents > 0 },
          { label: 'Change Requests', value: liveStatus.changeRequestCount, warn: liveStatus.changeRequestCount > 3 },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>{r.label}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: r.warn ? '#F97316' : 'var(--text-primary)' }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── W10 Alerts Banner ─────────────────────────────────────────────

export function AlertsBanner({ alerts }: { alerts: string[] }) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const visible = alerts.filter((_, i) => !dismissed.has(i));
  if (!visible.length) return null;

  return (
    <div style={{
      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 12, padding: '12px 16px',
    }}>
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
        color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
      }}>🚨 Active Alerts</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.map((alert, i) => {
          if (dismissed.has(i)) return null;
          const isCrit = alert.toLowerCase().includes('critical');
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
              background: isCrit ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
              borderLeft: `3px solid ${isCrit ? '#EF4444' : '#F97316'}`,
              borderRadius: '0 8px 8px 0',
            }}>
              <p style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6 }}>
                {alert.replace(/\*\*/g, '')}
              </p>
              <button onClick={() => setDismissed(prev => new Set([...prev, i]))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}>
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
