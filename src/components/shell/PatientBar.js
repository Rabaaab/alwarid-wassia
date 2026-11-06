'use client';
import SmartLink from '@/components/ui/SmartLink';
import styles from './PatientBar.module.css';

const VIEWS = [
    { id: 'dossier', label: 'Dossier', href: '/doctor/patient' },
    { id: 'urgence', label: 'Urgence', href: '/doctor/mode/urgence' },
    { id: 'consultation', label: 'Consultation', href: '/doctor/mode/consultation' },
    { id: 'suivi', label: 'Suivi', href: '/doctor/mode/suivi' },
    { id: 'transfert', label: 'Transfert', href: '/doctor/mode/transfert' },
];

export default function PatientBar({ active = 'dossier' }) {
    return (
        <div className={styles.bar}>
            <div className={styles.who}>
                <div className={styles.avatar}>YK</div>
                <div>
                    <div className={styles.nameRow}>
                        <span className={styles.name}>Youssef Kacimi</span>
                        <span className={styles.tag}>Suivi mémoire</span>
                    </div>
                    <div className={styles.meta}>58 ans, groupe A+, PAT-2024-00147</div>
                </div>
            </div>
            <nav className={styles.seg} aria-label="Vue du dossier">
                {VIEWS.map((v) => (
                    <SmartLink key={v.id} href={v.href} className={`${styles.pill} ${v.id === active ? styles.on : ''}`}>
                        {v.label}
                    </SmartLink>
                ))}
            </nav>
        </div>
    );
}
