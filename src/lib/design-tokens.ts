// src/lib/design-tokens.ts
// ─────────────────────────────────────────────────────────────────
// EventFlow AI — Design System Tokens
// Used by: Web (Tailwind CSS vars) + Mobile (React Native StyleSheet)
// ─────────────────────────────────────────────────────────────────

export const colors = {
  // ── Brand palette (from colour_palette.jpeg) ──────────────────
  bg: {
    primary:  '#190019',   // darkest — page background
    card:     '#2B124C',   // widget card backgrounds
    elevated: '#522B5B',   // card headers, top bar, hover
    muted:    '#854F6C',   // borders, dividers, secondary surfaces
  },
  text: {
    primary: '#FBE4D8',    // headings, primary content
    soft:    '#DFB6B2',    // labels, subtitles, secondary text
    muted:   '#854F6C',    // placeholders, disabled
  },
  border: {
    default: '#522B5B',
    subtle:  '#2B124C',
    strong:  '#854F6C',
  },

  // ── Risk level colours (standard — for charts & badges) ───────
  risk: {
    low:      '#22C55E',   // green
    medium:   '#EAB308',   // yellow
    high:     '#F97316',   // orange
    critical: '#EF4444',   // red
  },

  // ── Semantic ──────────────────────────────────────────────────
  success: '#22C55E',
  warning: '#EAB308',
  error:   '#EF4444',
  info:    '#60A5FA',

  // ── AI accent ─────────────────────────────────────────────────
  ai: {
    bg:     '#1E0A3C',
    border: '#7C3AED',
    text:   '#C4B5FD',
  },
} as const;

export const typography = {
  fontDisplay: "'Syne', sans-serif",
  fontBody:    "'DM Sans', sans-serif",
  fontMono:    "'JetBrains Mono', monospace",
  sizes: {
    xs:   '0.75rem',
    sm:   '0.875rem',
    base: '1rem',
    lg:   '1.125rem',
    xl:   '1.25rem',
    '2xl':'1.5rem',
    '3xl':'1.875rem',
    '4xl':'2.25rem',
  },
} as const;

export const spacing = {
  xs:  '0.25rem',
  sm:  '0.5rem',
  md:  '1rem',
  lg:  '1.5rem',
  xl:  '2rem',
  '2xl':'3rem',
} as const;

export const radius = {
  sm:   '0.375rem',
  md:   '0.75rem',
  lg:   '1rem',
  xl:   '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  card:    '0 4px 24px rgba(25, 0, 25, 0.6)',
  elevated:'0 8px 40px rgba(25, 0, 25, 0.8)',
  glow:    '0 0 20px rgba(133, 79, 108, 0.3)',
} as const;

// Risk level helpers
export function getRiskColor(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string): string {
  switch (level) {
    case 'LOW':      return colors.risk.low;
    case 'MEDIUM':   return colors.risk.medium;
    case 'HIGH':     return colors.risk.high;
    case 'CRITICAL': return colors.risk.critical;
    default:         return colors.text.muted;
  }
}

export function getRiskBg(level: string): string {
  switch (level) {
    case 'LOW':      return 'rgba(34, 197, 94, 0.15)';
    case 'MEDIUM':   return 'rgba(234, 179, 8, 0.15)';
    case 'HIGH':     return 'rgba(249, 115, 22, 0.15)';
    case 'CRITICAL': return 'rgba(239, 68, 68, 0.15)';
    default:         return 'rgba(133, 79, 108, 0.15)';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 75) return colors.risk.critical;
  if (score >= 50) return colors.risk.high;
  if (score >= 25) return colors.risk.medium;
  return colors.risk.low;
}
