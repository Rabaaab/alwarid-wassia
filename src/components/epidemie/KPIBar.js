'use client';

export default function KPIBar({ kpis }) {
  const cards = [
    {
      label: 'Passages aujourd\'hui',
      value: kpis.total_passages_aujourd_hui,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: '#29a2dd',
      bg: '#e6f6fd',
      suffix: '',
    },
    {
      label: 'Alertes actives',
      value: kpis.alertes_actives,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      color: kpis.alertes_actives > 0 ? '#dc2626' : '#16a34a',
      bg: kpis.alertes_actives > 0 ? '#fef2f2' : '#f0fdf4',
      suffix: '',
      badge: kpis.alertes_actives > 0,
    },
    {
      label: 'Salles surveillées',
      value: kpis.salles_surveillees,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
          <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
        </svg>
      ),
      color: '#7c3aed',
      bg: '#f5f3ff',
      suffix: '',
    },
    {
      label: 'Taux anomalies 7j',
      value: kpis.taux_anomalies_7j,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      color: kpis.taux_anomalies_7j > 3 ? '#d97706' : '#16a34a',
      bg: kpis.taux_anomalies_7j > 3 ? '#fffbeb' : '#f0fdf4',
      suffix: '%',
      warning: kpis.taux_anomalies_7j > 3,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: '#fff',
            border: `1px solid ${card.badge || card.warning ? card.color + '44' : '#e2e8f0'}`,
            borderRadius: 14,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 2px 8px rgba(30,41,59,0.05)',
          }}
        >
          <span style={{
            width: 44, height: 44, borderRadius: 12,
            background: card.bg,
            color: card.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {card.icon}
          </span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: 4 }}>
              {card.label}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: card.color, lineHeight: 1, marginBottom: 2 }}>
              {card.value}{card.suffix}
            </p>
            {card.badge && (
              <p style={{ fontSize: 11, color: card.color, fontWeight: 600 }}>Intervention requise</p>
            )}
            {card.warning && !card.badge && (
              <p style={{ fontSize: 11, color: card.color, fontWeight: 600 }}>Seuil dépassé (3%)</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
