'use client';
// src/components/risk/AISummary.tsx

interface Props {
  summary: string;
  recommendations: string[];
  alerts: string[];
}

export default function AISummary({ summary, recommendations, alerts }: Props) {
  const isFallback = summary?.includes('unavailable') || summary?.includes('manually');

  return (
    <div>
      {/* Summary */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30,10,60,0.8) 0%, rgba(43,18,76,0.6) 100%)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 10, padding: '14px 16px', marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
            color: 'var(--ai-text)', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>Gemini AI Analysis</span>
          {!isFallback && (
            <span style={{
              marginLeft: 'auto', background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.3)', borderRadius: 99,
              padding: '1px 8px', fontSize: 10, color: 'var(--ai-text)',
            }}>gemini-2.5-flash</span>
          )}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.7,
          color: isFallback ? 'var(--text-muted)' : 'var(--text-soft)',
          fontStyle: isFallback ? 'italic' : 'normal',
        }}>{summary || 'No summary available.'}</p>
      </div>

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <div>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
            color: 'var(--text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 8,
          }}>Recommendations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recommendations.map((rec, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '8px 10px',
                background: 'rgba(82,43,91,0.2)', borderRadius: 8,
                border: '1px solid var(--border-soft)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text-muted)', minWidth: 20, paddingTop: 1,
                }}>{String(i + 1).padStart(2, '0')}</span>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6 }}>
                  {rec.replace(/^[\*\-\d\.\s]+/, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
