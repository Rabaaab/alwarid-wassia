'use client';
import { useState } from 'react';
import { heatmapData, heatmapPassages, joursLabels } from '@/data/epidemieData';

function scoreToColor(score) {
  if (score >= 0.8) return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
  if (score >= 0.6) return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
  if (score >= 0.4) return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
  return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
}

function scoreLabel(score) {
  if (score >= 0.8) return 'Critique';
  if (score >= 0.6) return 'Suspect';
  if (score >= 0.4) return 'Surveillance';
  return 'Normal';
}

export default function HeatmapSalles() {
  const [tooltip, setTooltip] = useState(null);
  const salles = Object.keys(heatmapData);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(30,41,59,0.05)' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Heatmap salles × jours</h2>
        <p style={{ fontSize: 12, color: '#64748b' }}>Score d&apos;anomalie IF — 7 derniers jours · Survolez une cellule pour le détail</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textAlign: 'left', padding: '4px 8px', width: 120 }}>Salle</th>
              {joursLabels.map((j) => (
                <th key={j} style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textAlign: 'center', padding: '4px 4px', minWidth: 58 }}>{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salles.map((salle) => (
              <tr key={salle}>
                <td style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', padding: '4px 8px', whiteSpace: 'nowrap' }}>{salle}</td>
                {heatmapData[salle].map((score, ji) => {
                  const cfg = scoreToColor(score);
                  const passages = heatmapPassages[salle]?.[ji] ?? 0;
                  return (
                    <td
                      key={ji}
                      onMouseEnter={(e) => setTooltip({ salle, jour: joursLabels[ji], score, passages, rect: e.currentTarget.getBoundingClientRect() })}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 8,
                        textAlign: 'center',
                        padding: '8px 4px',
                        cursor: 'default',
                        transition: 'transform 0.1s',
                        position: 'relative',
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.text }}>{score.toFixed(1)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          top: tooltip.rect.top - 100,
          left: tooltip.rect.left + tooltip.rect.width / 2,
          transform: 'translateX(-50%)',
          background: '#1e293b',
          color: '#fff',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 12,
          pointerEvents: 'none',
          zIndex: 9999,
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>{tooltip.salle} · {tooltip.jour}</p>
          <p style={{ color: '#94a3b8', marginBottom: 2 }}>Score IF: <strong style={{ color: '#fff' }}>{tooltip.score.toFixed(2)}</strong></p>
          <p style={{ color: '#94a3b8', marginBottom: 2 }}>Passages suspects: <strong style={{ color: '#fff' }}>{tooltip.passages}</strong></p>
          <p style={{ color: scoreToColor(tooltip.score).bg === '#fef2f2' ? '#fca5a5' : '#86efac' }}>{scoreLabel(tooltip.score)}</p>
        </div>
      )}

      {/* Légende */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Légende :</span>
        {[
          { label: 'Normal (< 0.4)',      bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
          { label: 'Surveillance (0.4+)', bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
          { label: 'Suspect (0.6+)',      bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
          { label: 'Critique (0.8+)',     bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: l.bg, border: `1px solid ${l.border}`, display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: l.text, fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
