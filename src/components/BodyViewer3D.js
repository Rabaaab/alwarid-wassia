'use client';
import { useMemo, useState } from 'react';
import Body3D from '@/components/Body3D';
import { REGION_ZONES } from '@/data/bodyZones';

/*
 * Anciennes entrées (BodyViewer3D, BodyViewerMini) conservées pour les modes Urgence et
 * Consultation : elles affichent maintenant le vrai modèle 3D (rotation, zoom, couches).
 */
const SEVERITY = { critical: '#dc2626', warning: '#d97706', caution: '#eab308', stable: '#29a2dd', info: '#3b82f6' };

function useZones(regions) {
    return useMemo(
        () => REGION_ZONES.map((z) => ({
            ...z,
            color: SEVERITY[regions?.[z.id]?.severity] || SEVERITY.stable,
            tone: '#0f172a',
        })),
        [regions],
    );
}

export function BodyViewer3D({ onRegionSelect, regions, selectedRegion, style }) {
    const zones = useZones(regions);
    const [local, setLocal] = useState(selectedRegion || null);
    const active = selectedRegion !== undefined && selectedRegion !== null ? selectedRegion : local;
    return (
        <div style={{ width: '100%', height: '100%', ...style }}>
            <Body3D
                zones={zones}
                zone={active}
                height="100%"
                onZoneChange={(id) => { setLocal(id); if (id && onRegionSelect) onRegionSelect(id); }}
            />
        </div>
    );
}

export function BodyViewerMini({ onRegionSelect, regions, style }) {
    const zones = useZones(regions);
    const [local, setLocal] = useState(null);
    return (
        <div style={{ width: '100%', height: '100%', ...style }}>
            <Body3D
                mini
                zones={zones}
                zone={local}
                height="100%"
                onZoneChange={(id) => { setLocal(id); if (id && onRegionSelect) onRegionSelect(id); }}
            />
        </div>
    );
}
