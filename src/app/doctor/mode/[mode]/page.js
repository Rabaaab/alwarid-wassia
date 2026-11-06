'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
import DoctorHeader from '@/components/shell/DoctorHeader';
import PatientBar from '@/components/shell/PatientBar';
import PopupAIChat from '@/components/PopupAIChat';

const Loading = () => <div style={{ padding: 60, textAlign: 'center', color: '#1c5fb2', fontWeight: 700 }}>Chargement…</div>;
const MODES = {
    urgence: dynamic(() => import('@/components/modes/UrgenceMode'), { ssr: false, loading: Loading }),
    consultation: dynamic(() => import('@/components/modes/ConsultationMode'), { ssr: false, loading: Loading }),
    suivi: dynamic(() => import('@/components/modes/SuiviMode'), { ssr: false, loading: Loading }),
    transfert: dynamic(() => import('@/components/modes/TransfertMode'), { ssr: false, loading: Loading }),
};
const pageBg = 'radial-gradient(900px 500px at 12% 0%,rgba(125,189,244,0.55),transparent 70%),radial-gradient(800px 480px at 100% 14%,rgba(186,215,252,0.7),transparent 70%),linear-gradient(180deg,#d3e7fb 0%,#eaf4fd 36%,#f7fbff 100%)';

export default function ModePage({ params }) {
    const { mode } = use(params);
    const key = MODES[mode] ? mode : 'consultation';
    const Mode = MODES[key];
    return (
        <div style={{ minHeight: '100vh', boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: '#0f172a', background: pageBg, padding: '24px 32px 48px' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <DoctorHeader active={key === 'transfert' ? 'Transferts' : 'Patients'} />
                <PatientBar active={key} />
                <div className="aw-legacy" style={{ background: '#ffffff', borderRadius: 40, padding: 24, boxShadow: '0 30px 60px -36px rgba(28,95,178,0.45)', overflow: 'hidden' }}>
                    <Mode />
                </div>
            </div>
            <PopupAIChat mode={key} />
        </div>
    );
}
