'use client';
// src/components/risk/RiskScoreDial.tsx

import { getScoreColor, getRiskBg } from '@/lib/design-tokens';

interface Props {
  score: number;
  level: string;
  size?: number;
}

export default function RiskScoreDial({ score, level, size = 180 }: Props) {
  const color     = getScoreColor(score);
  const bg        = getRiskBg(level);
  const radius    = 70;
  const cx        = size / 2;
  const cy        = size / 2;
  const strokeW   = 10;

  // Arc from 210° to 330° (240° sweep)
  const startAngle = 210;
  const sweepAngle = 240;
  const endAngle   = startAngle + (sweepAngle * score) / 100;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (start: number, end: number, r: number) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)),   y: cy + r * Math.sin(toRad(end))   };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const levelLabel = level?.toUpperCase() ?? 'LOW';
  const badgeClass = `risk-badge risk-badge-${levelLabel.toLowerCase()}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track arc */}
          <path
            d={arcPath(startAngle, startAngle + sweepAngle, radius)}
            fill="none"
            stroke="#2B124C"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />

          {/* Score arc */}
          {score > 0 && (
            <path
              d={arcPath(startAngle, endAngle, radius)}
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{ transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          )}

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map(val => {
            const angle = startAngle + (sweepAngle * val) / 100;
            const inner = radius - 14;
            const outer = radius - 6;
            const x1 = cx + inner * Math.cos(toRad(angle));
            const y1 = cy + inner * Math.sin(toRad(angle));
            const x2 = cx + outer * Math.cos(toRad(angle));
            const y2 = cy + outer * Math.sin(toRad(angle));
            return (
              <line key={val} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#522B5B" strokeWidth={val % 50 === 0 ? 2 : 1} />
            );
          })}
        </svg>

        {/* Centre content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: `radial-gradient(circle at center, ${bg} 0%, transparent 70%)`,
          borderRadius: '50%',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: size * 0.22,
            fontWeight: 800,
            color,
            lineHeight: 1,
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}>
            {score}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: size * 0.07,
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            marginTop: 4,
          }}>
            / 100
          </span>
        </div>
      </div>

      {/* Level badge */}
      <span className={badgeClass}>{levelLabel}</span>
    </div>
  );
}
