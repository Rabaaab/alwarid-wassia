'use client';
import SmartLink from '@/components/ui/SmartLink';
import styles from './PatientBar.module.css';

const VIEWS = [
    { id: 'dossier', label: 'Patient 360', href: '/doctor/patient' },
    { id: 'urgence', label: 'Emergency', href: '/doctor/mode/urgence' },
    { id: 'consultation', label: 'Consultation', href: '/doctor/mode/consultation' },
    { id: 'suivi', label: 'Follow-up', href: '/doctor/mode/suivi' },
    { id: 'transfert', label: 'Transfer', href: '/doctor/mode/transfert' },
];

export default function PatientBar({ active = 'dossier' }) {
    return (
        <div className={styles.bar}>
            <div className={styles.who}>
                <div className={styles.avatar}>AM</div>
                <div>
                    <div className={styles.nameRow}>
                        <span className={styles.name}>Amina El Idrissi</span>
                        <span className={styles.tag}>Emergency, bay 4</span>
                    </div>
                    <div className={styles.meta}>72 years, blood group A+, PAT-2026-00072</div>
                </div>
            </div>
            <nav className={styles.seg} aria-label="Patient file views">
                {VIEWS.map((v) => (
                    <SmartLink key={v.id} href={v.href} className={`${styles.pill} ${v.id === active ? styles.on : ''}`}>
                        {v.label}
                    </SmartLink>
                ))}
            </nav>
        </div>
    );
}
