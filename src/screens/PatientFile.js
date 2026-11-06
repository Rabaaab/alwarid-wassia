'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import SmartLink from '@/components/ui/SmartLink';
import DoctorHeader from '@/components/shell/DoctorHeader';
import PatientBar from '@/components/shell/PatientBar';
import PopupAIChat from '@/components/PopupAIChat';
import { ZONES, ZONE_BY_ID } from '@/data/bodyZones';
import styles from './PatientFile.module.css';

const Body3D = dynamic(() => import('@/components/Body3D'), {
    ssr: false,
    loading: () => (
        <div style={{ height: 760, borderRadius: 28, background: '#dcebf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1c5fb2', fontWeight: 700 }}>
            Chargement du modèle 3D…
        </div>
    ),
});

const CHEVRON = (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
);
const pageBg = 'radial-gradient(900px 500px at 12% 0%,rgba(125,189,244,0.55),transparent 70%),radial-gradient(800px 480px at 100% 14%,rgba(186,215,252,0.7),transparent 70%),linear-gradient(180deg,#d3e7fb 0%,#eaf4fd 36%,#f7fbff 100%)';
const iconBox = { width: 48, height: 48, borderRadius: 16, background: '#e6f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' };

function ExamModal({ exam, zone, onClose }) {
    if (!exam) return null;
    return (
        <div role="dialog" aria-modal="true" aria-label={exam.n} onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(6px)' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(920px, 100%)', maxHeight: '92vh', overflow: 'auto', background: '#fff', borderRadius: 36, padding: 28, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 50px 100px -40px rgba(0,0,0,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>{zone.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{exam.n}</div>
                        <div style={{ fontSize: 15, color: '#475569', marginTop: 2 }}>{exam.d}</div>
                    </div>
                    <button type="button" onClick={onClose} style={{ minHeight: 48, padding: '0 22px', borderRadius: 999, border: '1px solid #bfdbfe', background: '#fff', color: '#1c5fb2', fontSize: 15, fontWeight: 700 }}>Fermer</button>
                </div>
                <div style={{ background: '#0b1220', borderRadius: 24, padding: 12, display: 'flex', justifyContent: 'center' }}>
                    <img src={exam.img} alt={`${exam.n}, ${exam.d}`} style={{ maxWidth: '100%', maxHeight: '58vh', objectFit: 'contain', borderRadius: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13, color: '#475569', maxWidth: 520, lineHeight: 1.5 }}>
                        Document de démonstration. L&apos;interprétation automatique est une aide à la lecture, le médecin décide.
                    </div>
                    <SmartLink href="/doctor/mode/consultation" style={{ minHeight: 52, padding: '0 26px', borderRadius: 999, background: 'linear-gradient(135deg,#2a7de1,#1c5fb2)', color: '#fff', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', boxShadow: '0 16px 30px -12px rgba(28,95,178,0.65)' }}>
                        Analyser dans Consultation
                    </SmartLink>
                </div>
            </div>
        </div>
    );
}

export default function PatientFile() {
    const [zoneId, setZoneId] = useState(null);
    const [exam, setExam] = useState(null);
    const zone = zoneId ? ZONE_BY_ID[zoneId] : null;

    return (
        <div className={styles.root} style={{ minHeight: 1060, boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: '#0f172a', background: pageBg, padding: '24px 32px 48px' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <DoctorHeader active="Patients" />
                <PatientBar active="dossier" />
                <div className={styles.cols} style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
                    <div className={styles.rise} style={{ flex: 1.3, minWidth: 0, background: '#ffffff', borderRadius: 40, padding: 26, boxShadow: '0 30px 60px -36px rgba(28,95,178,0.45)', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
                        <div style={{ flex: '0 0 280px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>{zone ? 'Zone sélectionnée' : 'Corps entier'}</div>
                            {zone ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ width: 14, height: 14, borderRadius: '50%', background: zone.color, display: 'inline-block', flex: 'none' }} />
                                        <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{zone.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span className={styles.tag} style={{ background: zone.bg, color: zone.tone }}>{zone.sub}</span>
                                        <span style={{ fontSize: 13, color: '#475569' }}>{zone.items.length} {zone.items.length > 1 ? 'examens liés' : 'examen lié'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                                        {zone.items.map((it) => {
                                            const inner = (
                                                <>
                                                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{it.n}</div>
                                                        <div style={{ fontSize: 13, color: '#475569', marginTop: 1 }}>{it.d}</div>
                                                    </div>
                                                    {it.tag ? <span className={styles.tag} style={{ background: '#e6f1fb', color: '#196185' }}>{it.tag}</span> : null}
                                                    {CHEVRON}
                                                </>
                                            );
                                            return it.href ? (
                                                <SmartLink key={it.n} href={it.href} className={styles.rowp} style={{ background: '#f5faff' }}>{inner}</SmartLink>
                                            ) : (
                                                <button key={it.n} type="button" onClick={() => setExam(it)} className={styles.rowp} style={{ background: '#f5faff', border: 'none', width: '100%', cursor: 'pointer', fontFamily: 'inherit' }}>{inner}</button>
                                            );
                                        })}
                                    </div>
                                    <button type="button" onClick={() => setZoneId(null)} style={{ marginTop: 6, minHeight: 44, borderRadius: 999, border: '1px solid #bfdbfe', background: '#fff', color: '#1c5fb2', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Revenir au corps entier
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 }}>Touchez une zone pour voir ses examens</div>
                                    <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.55 }}>Faites tourner le corps, zoomez, puis changez de couche pour voir les muscles, le squelette et les organes.</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                                        {ZONES.map((z) => (
                                            <button key={z.id} type="button" onClick={() => setZoneId(z.id)} className={styles.rowp} style={{ background: '#f5faff', border: 'none', width: '100%', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                <span style={{ width: 14, height: 14, borderRadius: '50%', background: z.color, flex: 'none' }} />
                                                <span style={{ flex: 1, textAlign: 'left', fontWeight: 700, fontSize: 15 }}>{z.label}</span>
                                                <span className={styles.tag} style={{ background: z.bg, color: z.tone }}>{z.sub}</span>
                                                {CHEVRON}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div style={{ flex: '1 1 380px', minWidth: 300 }}>
                            <Body3D zone={zoneId} onZoneChange={setZoneId} height={760} />
                        </div>
                    </div>

                    <div style={{ flex: 0.7, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className={`${styles.panel} ${styles.rise}`} style={{ animationDelay: '80ms' }}>
                            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>À savoir</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Allergies</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {['Pénicilline', 'Sulfamides'].map((a) => (
                                    <span key={a} style={{ fontSize: 17, fontWeight: 700, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 16, padding: '9px 16px' }}>{a}</span>
                                ))}
                            </div>
                            <SmartLink href="/doctor/mode/urgence" className={styles.rowp} style={{ marginTop: 12 }}>
                                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626', flex: 'none' }} />
                                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>2 interactions médicamenteuses critiques</span>
                                {CHEVRON}
                            </SmartLink>
                        </div>
                        <div className={`${styles.panel} ${styles.rise}`} style={{ animationDelay: '120ms', padding: '14px 16px' }}>
                            <SmartLink href="/doctor/patient/team" className={styles.rowp}>
                                <div style={{ display: 'flex', flex: 'none' }}>
                                    {['doctor-avatar', 'doc-tazi', 'doc-fassi', 'doc-zniber'].map((n, i) => (
                                        <img key={n} src={`/ui/${n}.jpg`} alt="" style={{ marginLeft: i ? -12 : 0, width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '3px solid #ffffff', boxSizing: 'border-box' }} />
                                    ))}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>Équipe de soins</div>
                                    <div style={{ fontSize: 13, color: '#475569' }}>4 médecins, 2 cliniques</div>
                                </div>
                                {CHEVRON}
                            </SmartLink>
                            <SmartLink href="/doctor/patient/labs" className={styles.rowp}>
                                <div style={iconBox}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1c5fb2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /></svg></div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>Analyses</div>
                                    <div style={{ fontSize: 13, color: '#475569' }}>6 résultats, 2 laboratoires</div>
                                </div>
                                <span className={styles.tag} style={{ background: '#fef2f2', color: '#b91c1c' }}>3 hors norme</span>
                                {CHEVRON}
                            </SmartLink>
                        </div>
                        <div className={`${styles.panel} ${styles.rise}`} style={{ animationDelay: '160ms' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>À examiner</span>
                                <span className={styles.tag} style={{ background: '#e6f1fb', color: '#196185' }}>2</span>
                            </div>
                            <SmartLink href="/doctor/patient/report" className={styles.rowp}>
                                <div style={iconBox}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1c5fb2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg></div>
                                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 16 }}>Rapport mémoire</div><div style={{ fontSize: 13, color: '#475569' }}>WassIA, hier soir</div></div>
                                <span className={styles.tag} style={{ background: '#e6f1fb', color: '#196185' }}>Nouveau</span>
                            </SmartLink>
                            <SmartLink href="/doctor/results" className={styles.rowp}>
                                <div style={iconBox}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1c5fb2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 8l9 6 9-6" /></svg></div>
                                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 16 }}>Demande d&apos;avis</div><div style={{ fontSize: 13, color: '#475569' }}>Dr. Tazi, médecin traitant</div></div>
                            </SmartLink>
                        </div>
                        <div className={styles.rise} style={{ display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '240ms' }}>
                            <SmartLink href="/doctor/patient/note" style={{ minHeight: 62, borderRadius: 24, background: 'linear-gradient(135deg,#2a7de1,#1c5fb2)', color: '#ffffff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 20px 38px -14px rgba(28,95,178,0.65)', textDecoration: 'none' }}>
                                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                                Note de consultation
                            </SmartLink>
                            <SmartLink href="/doctor/patient/rx" style={{ minHeight: 62, borderRadius: 24, border: '1px solid #bfdbfe', background: '#ffffff', color: '#1c5fb2', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                                Nouvelle ordonnance
                            </SmartLink>
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>Aide à la décision. La décision finale revient au médecin. Données de démonstration.</div>
            </div>
            <ExamModal exam={exam} zone={zone || ZONES[0]} onClose={() => setExam(null)} />
            <PopupAIChat mode="consultation" />
        </div>
    );
}
