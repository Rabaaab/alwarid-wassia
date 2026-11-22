'use client';
import SmartLink from '@/components/ui/SmartLink';
import { usePlatform, pendingResults } from '@/lib/platformStore';
import styles from './DoctorHeader.module.css';

const NAV = [
    { key: 'Accueil', label: 'Home', href: '/doctor' },
    { key: 'Patients', label: 'Patients', href: '/doctor/patient' },
    { key: 'Résultats', label: 'Results', href: '/doctor/results', badge: 3 },
    { key: 'Transferts', label: 'Transfers', href: '/doctor/mode/transfert' },
    { key: 'Épidémie', label: 'Epidemics', href: '/doctor/epidemie', badge: 2 },
];

export default function DoctorHeader({ active = 'Accueil' }) {
    const results = usePlatform('results');
    const pending = pendingResults(results);
    return (
        <header className={styles.glass}>
            <div className={styles.left}>
                <SmartLink href="/doctor" aria-label="Alwarid, home">
                    <img src="/ui/logo-wide.png" alt="Alwarid" className={styles.logo} />
                </SmartLink>
                <nav aria-label="Main navigation" className={styles.nav}>
                    {NAV.map((n) => (
                        <SmartLink key={n.key} href={n.href} className={`${styles.nv} ${n.key === active ? styles.on : ''}`}>
                            {n.label}
                            {(n.key === 'Résultats' ? pending : n.badge) ? <span className={styles.bd}>{n.key === 'Résultats' ? pending : n.badge}</span> : null}
                        </SmartLink>
                    ))}
                </nav>
            </div>
            <div className={styles.right}>
                <SmartLink href="/doctor/results" className={styles.ib} aria-label="Notifications">
                    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
                    {pending > 0 ? <span aria-hidden="true" className={styles.dot} /> : null}
                </SmartLink>
                <span aria-hidden="true" className={styles.sep} />
                <SmartLink href="/" className={styles.who} aria-label="Dr. Mounir Alaoui, switch account">
                    <img src="/ui/doctor-avatar.jpg" alt="Dr. Mounir Alaoui" className={styles.avatar} />
                    <span>
                        <span className={styles.name} style={{ display: 'block' }}>Dr. M. Alaoui</span>
                        <span className={styles.role} style={{ display: 'block' }}>Internal medicine</span>
                    </span>
                </SmartLink>
            </div>
        </header>
    );
}
