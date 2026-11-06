// ── Mock data — Orientation des transferts ───────────────────────────────────
// DONNEES DE DEMONSTRATION (simulees). En production, ces informations viendraient
// d'un registre national des etablissements (equipements, lits disponibles en temps reel).

export const CAPABILITIES = [
    { id: 'cardio', label: 'Cardiologie' },
    { id: 'neuro', label: 'Neurologie / AVC' },
    { id: 'ortho', label: 'Orthopedie' },
    { id: 'scanner', label: 'Scanner' },
    { id: 'irm', label: 'IRM' },
    { id: 'bloc', label: 'Bloc operatoire' },
    { id: 'reanimation', label: 'Reanimation' }
];

// Distances / delais depuis l'etablissement d'origine : CHU Hassan II, Fes
export const FACILITIES = [
    { id: 'clinique_atlas', name: 'Clinique Atlas', city: 'Fes', sector: 'prive', distanceKm: 4, etaMin: 10, criticalBeds: 0,
      capabilities: ['cardio', 'ortho', 'scanner', 'irm', 'bloc'] },
    { id: 'chr_meknes', name: 'CHR Meknes', city: 'Meknes', sector: 'public', distanceKm: 60, etaMin: 55, criticalBeds: 1,
      capabilities: ['cardio', 'ortho', 'scanner', 'bloc', 'reanimation'] },
    { id: 'hopital_ifrane', name: 'Hopital Provincial, Ifrane', city: 'Ifrane', sector: 'public', distanceKm: 65, etaMin: 70, criticalBeds: 0,
      capabilities: ['scanner'] },
    { id: 'chu_rabat', name: 'CHU Ibn Sina, Rabat', city: 'Rabat', sector: 'public', distanceKm: 210, etaMin: 150, criticalBeds: 3,
      capabilities: ['cardio', 'neuro', 'ortho', 'scanner', 'irm', 'bloc', 'reanimation'] }
];

export function facilityLabel(id) {
    return FACILITIES.find(f => f.id === id)?.name || (id === 'autre' ? 'Autre etablissement' : id);
}

/**
 * Triage a base de regles (transparent, modifiable par le medecin) :
 * on explique les facteurs plutot que de donner un score opaque.
 */
export function computeTriage(patient) {
    const factors = [];
    let score = 0;

    const critConds = patient.conditions.filter(c => c.severity === 'critical');
    if (critConds.length) { score += critConds.length * 2; factors.push(`${critConds.length} pathologie(s) critique(s) : ${critConds.map(c => c.name).join(', ')}`); }

    const critInter = patient.interactions.filter(i => i.severity === 'critical');
    if (critInter.length) { score += critInter.length * 2; factors.push(`${critInter.length} interaction(s) medicamenteuse(s) critique(s)`); }

    const warnConds = patient.conditions.filter(c => c.severity === 'warning');
    if (warnConds.length) { score += warnConds.length; factors.push(`${warnConds.length} pathologie(s) a surveiller`); }

    const ecgAnomaly = Object.values(patient.bodyRegions || {})
        .flatMap(r => r.scans || [])
        .find(s => s.type === 'ECG' && /arythm/i.test(s.result));
    if (ecgAnomaly) { score += 2; factors.push(`ECG anormal recent (${ecgAnomaly.result})`); }

    const level = score >= 8 ? 'critical' : score >= 4 ? 'urgent' : 'normal';
    return { score, level, factors };
}

/**
 * Classe les etablissements : d'abord ceux qui ont tout l'equipement requis,
 * puis par distance. Signale l'absence de lit critique si le cas est critique.
 */
export function rankFacilities(needs, urgency, publicOnly) {
    return FACILITIES
        .filter(f => !publicOnly || f.sector === 'public')
        .map(f => {
            const missing = needs.filter(n => !f.capabilities.includes(n));
            const noCriticalBed = urgency === 'critical' && f.criticalBeds === 0;
            return { ...f, missing, noCriticalBed, compatible: missing.length === 0 && !noCriticalBed };
        })
        .sort((a, b) => Number(b.compatible) - Number(a.compatible) || a.missing.length - b.missing.length || a.distanceKm - b.distanceKm);
}
