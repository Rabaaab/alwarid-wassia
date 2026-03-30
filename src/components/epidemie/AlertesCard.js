'use client';
import { useState } from 'react';

const NIVEAU_CONFIG = {
  critique:     { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Critique',     dot: '#dc2626' },
  surveillance: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Surveillance', dot: '#d97706' },
  info:         { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Info',          dot: '#2563eb' },
};

export default function AlertesCard({ alertes: initialAlertes }) {
  const [alertes, setAlertes] = useState(initialAlertes);

  const handleAction = (id, action) => {
    setAlertes((prev) =>
      prev.map((a) => a.id === id ? { ...a, statut: action } : a)
    );
  };

  const actives = alertes.filter((a) => a.statut === 'en_attente');
  const traitees = alertes.filter((a) => a.statut !== 'en_attente');

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(30,41,59,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Alertes actives</h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>L'IA propose — le médecin valide</p>
        </div>
        {actives.length > 0 && (
          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
            {actives.length} en attente
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {actives.map((alerte) => {
          const cfg = NIVEAU_CONFIG[alerte.niveau] || NIVEAU_CONFIG.info;
          return (
            <div key={alerte.id} style={{
              border: `1px solid ${cfg.border}`,
              background: cfg.bg,
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: cfg.dot,
                  flexShrink: 0, marginTop: 5,
                  boxShadow: `0 0 0 3px ${cfg.color}33`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                      {alerte.salle} · {alerte.service}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 600, marginBottom: 4 }}>
                    {alerte.message}
                  </p>
                  <p style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>
                    {alerte.n_passages_suspects} passages suspects · Détecté le {alerte.premiere_detection}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {alerte.symptomes_dominants.map((s) => (
                      <span key={s} style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px',
                        background: '#fff', border: `1px solid ${cfg.border}`,
                        borderRadius: 999, color: cfg.color,
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, paddingLeft: 18 }}>
                <button
                  onClick={() => handleAction(alerte.id, 'confirme')}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer',
                  }}
                >
                  Confirmer alerte
                </button>
                <button
                  onClick={() => handleAction(alerte.id, 'rejete')}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: '#fff', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer',
                  }}
                >
                  Rejeter
                </button>
              </div>
            </div>
          );
        })}

        {traitees.length > 0 && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Traitées
            </p>
            {traitees.map((alerte) => (
              <div key={alerte.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 6,
              }}>
                <span style={{ fontSize: 12, color: '#475569' }}>{alerte.salle} · {alerte.service}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  background: alerte.statut === 'confirme' ? '#fef2f2' : '#f0fdf4',
                  color: alerte.statut === 'confirme' ? '#dc2626' : '#16a34a',
                }}>
                  {alerte.statut === 'confirme' ? 'Confirmée' : 'Rejetée'}
                </span>
              </div>
            ))}
          </div>
        )}

        {actives.length === 0 && traitees.length === 0 && (
          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
            Aucune alerte active
          </p>
        )}
      </div>
    </div>
  );
}
