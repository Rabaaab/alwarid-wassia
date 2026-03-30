'use client';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import KPIBar from '@/components/epidemie/KPIBar';
import AlertesCard from '@/components/epidemie/AlertesCard';
import { kpis, alertes } from '@/data/epidemieData';

const CourbesEpidemiques = dynamic(() => import('@/components/epidemie/CourbesEpidemiques'), { ssr: false });
const PrevisionsChart    = dynamic(() => import('@/components/epidemie/PrevisionsChart'),    { ssr: false });
const HeatmapSalles      = dynamic(() => import('@/components/epidemie/HeatmapSalles'),      { ssr: false });

export default function EpidemiePage() {
  return (
    <div className="app-shell">
      <Header
        showMode
        modeName="epidemie"
        showBack
        userName="Dr. M. Aloui"
        userRole="Urgentiste"
        userInitials="MA"
        hideEpidemie
      />

      <main className="app-main" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f0f7ff 100%)', padding: '28px 40px 60px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* Titre + disclaimer */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Dashboard Épidémie</h1>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
              }}>
                ⚠️ Détection automatique — validation médecin requise
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Surveillance épidémique en temps réel · Données anonymisées · Aucun diagnostic automatique
            </p>
          </div>

          {/* KPIs */}
          <div style={{ marginBottom: 24 }}>
            <KPIBar kpis={kpis} />
          </div>

          {/* Alertes + Heatmap */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 20, marginBottom: 20 }}>
            <AlertesCard alertes={alertes} />
            <HeatmapSalles />
          </div>

          {/* Courbes + Prévisions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <CourbesEpidemiques />
            <PrevisionsChart />
          </div>

        </div>
      </main>

      <footer className="page-footer">© 2026 Alwarid. All rights reserved.</footer>
    </div>
  );
}
