'use client';
import dynamic from 'next/dynamic';
import DoctorHeader from '@/components/shell/DoctorHeader';
import KPIBar from '@/components/epidemie/KPIBar';
import AlertesCard from '@/components/epidemie/AlertesCard';
import { kpis, alertes } from '@/data/epidemieData';

const CourbesEpidemiques = dynamic(() => import('@/components/epidemie/CourbesEpidemiques'), { ssr: false });
const PrevisionsChart = dynamic(() => import('@/components/epidemie/PrevisionsChart'), { ssr: false });
const HeatmapSalles = dynamic(() => import('@/components/epidemie/HeatmapSalles'), { ssr: false });
const pageBg = 'radial-gradient(900px 500px at 12% 0%,rgba(125,189,244,0.55),transparent 70%),radial-gradient(800px 480px at 100% 14%,rgba(186,215,252,0.7),transparent 70%),linear-gradient(180deg,#d3e7fb 0%,#eaf4fd 36%,#f7fbff 100%)';

export default function EpidemiePage() {
    return (
        <div style={{ minHeight: '100vh', lineHeight: 'normal', boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: '#0f172a', background: pageBg, padding: '24px 32px 48px' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <DoctorHeader active="Épidémie" />
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: '-0.035em' }}>Surveillance épidémique</h1>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            Détection automatique, validation médecin requise
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 15, color: '#475569' }}>Données anonymisées. Un signal n&apos;est pas un diagnostic et ne déclare pas une épidémie.</p>
                </div>
                <div className="aw-legacy" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <KPIBar kpis={kpis} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 20 }}>
                        <AlertesCard alertes={alertes} />
                        <HeatmapSalles />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <CourbesEpidemiques />
                        <PrevisionsChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
