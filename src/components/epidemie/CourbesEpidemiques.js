'use client';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { historiqueSemaines } from '@/data/epidemieData';

const GROUPES = [
  { key: 'total',      label: 'Total passages', color: '#29a2dd' },
  { key: 'grippe_IRA', label: 'Grippe / IRA',   color: '#ef4444' },
  { key: 'gastro',     label: 'Gastro-entérite', color: '#f59e0b' },
  { key: 'respiratoire', label: 'Respiratoire',  color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const isPrev = historiqueSemaines.find((s) => s.semaine === label)?.prevision;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>
        {label} {isPrev ? <span style={{ color: '#94a3b8', fontWeight: 400 }}>(prévision)</span> : ''}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function CourbesEpidemiques() {
  const [selectedGroupe, setSelectedGroupe] = useState('all');

  const groupesToShow = selectedGroupe === 'all'
    ? GROUPES
    : GROUPES.filter((g) => g.key === selectedGroupe);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(30,41,59,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Courbes épidémiques</h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Passages par groupe syndromique — 5 semaines</p>
        </div>
        <select
          value={selectedGroupe}
          onChange={(e) => setSelectedGroupe(e.target.value)}
          style={{
            fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8,
            border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b',
            cursor: 'pointer',
          }}
        >
          <option value="all">Tous les groupes</option>
          {GROUPES.map((g) => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={historiqueSemaines} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <ReferenceLine x="S0 (actuel)" stroke="#94a3b8" strokeDasharray="4 2" label={{ value: 'Aujourd\'hui', fontSize: 10, fill: '#94a3b8' }} />
          {groupesToShow.map((g) => (
            <Line
              key={g.key}
              type="monotone"
              dataKey={g.key}
              name={g.label}
              stroke={g.color}
              strokeWidth={2}
              dot={(props) => {
                const isPrev = historiqueSemaines[props.index]?.prevision;
                return (
                  <circle
                    key={props.key}
                    cx={props.cx}
                    cy={props.cy}
                    r={isPrev ? 4 : 3}
                    fill={isPrev ? '#fff' : g.color}
                    stroke={g.color}
                    strokeWidth={2}
                    strokeDasharray={isPrev ? '3 2' : undefined}
                  />
                );
              }}
              strokeDasharray={(d) => d?.prevision ? '5 3' : undefined}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <p style={{ fontSize: 11, color: '#64748b' }}>
          Les points après "S0 (actuel)" sont des prévisions indicatives — ne pas extrapoler au-delà de 2 semaines
        </p>
      </div>
    </div>
  );
}
