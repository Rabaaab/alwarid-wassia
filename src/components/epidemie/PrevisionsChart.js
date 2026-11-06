'use client';
import { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { previsions } from '@/data/epidemieData';

const INDICATEURS = [
  { key: 'total_passages', label: 'Total passages', color: '#29a2dd' },
  { key: 'grippe_IRA',     label: 'Grippe / IRA',   color: '#ef4444' },
  { key: 'gastro',         label: 'Gastro-entérite', color: '#f59e0b' },
  { key: 'respiratoire',   label: 'Respiratoire',    color: '#8b5cf6' },
];

const TENDANCE_CONFIG = {
  hausse: { icon: '📈', label: 'Hausse', color: '#ef4444' },
  stable: { icon: '➡️', label: 'Stable', color: '#f59e0b' },
  baisse: { icon: '📉', label: 'Baisse', color: '#16a34a' },
};

function buildChartData(indicateur) {
  const d = previsions[indicateur];
  return [
    { semaine: 'S-4', valeur: Math.round(d.actuel * 0.87) },
    { semaine: 'S-3', valeur: Math.round(d.actuel * 0.91) },
    { semaine: 'S-2', valeur: Math.round(d.actuel * 0.95) },
    { semaine: 'S-1', valeur: Math.round(d.actuel * 0.98) },
    { semaine: 'S0',  valeur: d.actuel },
    { semaine: 'S+1', valeur: d['S+1'].valeur, ic_low: d['S+1'].ic_low, ic_high: d['S+1'].ic_high, prevision: true },
    { semaine: 'S+2', valeur: d['S+2'].valeur, ic_low: d['S+2'].ic_low, ic_high: d['S+2'].ic_high, prevision: true },
  ];
}

const CustomTooltip = ({ active, payload, label, color }) => {
  if (!active || !payload?.length) return null;
  const entry = payload.find((p) => p.dataKey === 'valeur');
  const ic = payload.find((p) => p.dataKey === 'ic_high');
  const icLow = payload.find((p) => p.dataKey === 'ic_low');
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>{label}</p>
      {entry && <p style={{ color }}>Valeur: <strong>{entry.value}</strong></p>}
      {ic && icLow && (
        <p style={{ color: '#94a3b8', fontSize: 11 }}>IC 90%: {icLow.value} – {ic.value}</p>
      )}
    </div>
  );
};

export default function PrevisionsChart() {
  const [selected, setSelected] = useState('total_passages');
  const cfg = INDICATEURS.find((i) => i.key === selected);
  const data = buildChartData(selected);
  const tendance = TENDANCE_CONFIG[previsions[selected].tendance];

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(30,41,59,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Prévisions S+1 / S+2</h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Intervalle de confiance 90% · Zone grisée</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
            background: tendance.color + '18', color: tendance.color,
          }}>
            {tendance.icon} {tendance.label}
          </span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', cursor: 'pointer' }}
          >
            {INDICATEURS.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip content={<CustomTooltip color={cfg.color} />} />
          <ReferenceLine x="S0" stroke="#94a3b8" strokeDasharray="4 2" />
          {/* IC band */}
          <Area
            type="monotone"
            dataKey="ic_high"
            stroke="none"
            fill={cfg.color}
            fillOpacity={0.08}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="ic_low"
            stroke="none"
            fill="#fff"
            fillOpacity={1}
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="valeur"
            stroke={cfg.color}
            strokeWidth={2.5}
            dot={(props) => {
              const isPrev = data[props.index]?.prevision;
              return (
                <circle
                  key={props.key}
                  cx={props.cx}
                  cy={props.cy}
                  r={isPrev ? 5 : 4}
                  fill={isPrev ? '#fff' : cfg.color}
                  stroke={cfg.color}
                  strokeWidth={2}
                />
              );
            }}
            strokeDasharray="0"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p style={{ fontSize: 11, color: '#92400e', fontWeight: 500 }}>
          Prévision indicative — ne pas extrapoler au-delà de 2 semaines. L&apos;IA propose, le médecin décide.
        </p>
      </div>
    </div>
  );
}
