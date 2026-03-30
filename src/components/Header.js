'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { kpis } from '@/data/epidemieData';

const INTERNAL_HISTORY_KEY = 'alwarid:internal-history';
const ROOT_ROUTES = new Set(['/', '/role']);

function readInternalHistory() {
    if (typeof window === 'undefined') return [];

    try {
        const raw = window.sessionStorage.getItem(INTERNAL_HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeInternalHistory(history) {
    if (typeof window === 'undefined') return;

    window.sessionStorage.setItem(INTERNAL_HISTORY_KEY, JSON.stringify(history));
}

function clearInternalHistory() {
    writeInternalHistory([]);
}

function getPreviousRoute(history, currentRoute) {
    if (!history.length) return null;
    if (history[history.length - 1] === currentRoute) {
        return history[history.length - 2] || null;
    }

    return history[history.length - 1] || null;
}

export default function Header({ showMode, modeName, mode, patientName, patientId, showBackToSearch, userName, userRole, userInitials, backHref, backLabel, hideEpidemie, showBack, onBack }) {
    const router = useRouter();
    const pathname = usePathname();
    const alertesActives = kpis.alertes_actives;
    const activeMode = modeName || mode || 'urgence';
    const shouldShowMode = showMode || Boolean(modeName) || Boolean(mode);
    const [previousRoute, setPreviousRoute] = useState(null);

    const displayName = userName || 'Dr. M. Aloui';
    const displayRole = userRole || 'Urgentiste';
    const displayInitials = userInitials || 'MA';
    const currentRoute = useMemo(
        () => (pathname === '/dashboard' ? `${pathname}?mode=${activeMode}` : pathname),
        [activeMode, pathname]
    );

    useEffect(() => {
        if (!pathname) return;

        if (ROOT_ROUTES.has(pathname)) {
            writeInternalHistory([]);
            setPreviousRoute(null);
            return;
        }

        const history = readInternalHistory();
        const nextHistory = history[history.length - 1] === currentRoute
            ? history
            : [...history, currentRoute];

        writeInternalHistory(nextHistory);
        setPreviousRoute(getPreviousRoute(nextHistory, currentRoute));
    }, [currentRoute, pathname]);

    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
            return;
        }

        if (!previousRoute) return;

        const history = readInternalHistory();
        const nextHistory = [...history];

        if (nextHistory[nextHistory.length - 1] === currentRoute) {
            nextHistory.pop();
        }

        writeInternalHistory(nextHistory);
        router.replace(previousRoute);
    }, [currentRoute, onBack, previousRoute, router]);

    const hasBack = Boolean(onBack) || ((showBack || showBackToSearch) && Boolean(previousRoute));

    return (
        <header className="app-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {hasBack && (
                    <button
                        onClick={handleBack}
                        title="Retour"
                        className="btn btn-ghost btn-icon"
                        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                )}
                <Link href="/role" className="app-logo" style={{ textDecoration: 'none' }} onClick={clearInternalHistory}>
                    <div style={{ position: 'relative', width: 220, height: 120 }}>
                        <Image
                            src="/logo-official-nobg.png"
                            alt="Alwarid"
                            fill
                            priority
                            sizes="220px"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                </Link>
            </div>
            <div className="app-header-right">
                {shouldShowMode && (
                    <span className={`mode-badge ${activeMode}`}>
                        <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
                            <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" />
                        </svg>
                        {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)}
                    </span>
                )}
                {patientName && (
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {patientName}{' '}
                        {patientId && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{patientId}</span>}
                    </div>
                )}
                {!hideEpidemie && (
                    <Link href="/epidemie" title="Surveillance épidémique" style={{ position: 'relative', display: 'inline-flex', textDecoration: 'none' }}>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 10px', borderRadius: 999,
                            background: alertesActives > 0 ? '#fef2f2' : '#f8fafc',
                            border: `1px solid ${alertesActives > 0 ? '#fecaca' : '#e2e8f0'}`,
                            color: alertesActives > 0 ? '#dc2626' : '#64748b',
                            fontSize: 12, fontWeight: 700,
                            transition: 'all 0.2s',
                        }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
                            </svg>
                            Épidémie
                            {alertesActives > 0 && (
                                <span style={{
                                    minWidth: 16, height: 16, borderRadius: '50%',
                                    background: '#dc2626', color: '#fff',
                                    fontSize: 10, fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {alertesActives}
                                </span>
                            )}
                        </span>
                    </Link>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="user-avatar">{displayInitials}</div>
                    {!showBackToSearch && (
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{displayName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{displayRole}</div>
                        </div>
                    )}
                    <Link href="/" className="btn btn-ghost btn-icon" title="Deconnexion" style={{ color: 'var(--text-muted)', marginLeft: 4 }} onClick={clearInternalHistory}>
                        <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </Link>
                </div>
            </div>
        </header>
    );
}
