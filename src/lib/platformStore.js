'use client';
import { useCallback, useSyncExternalStore } from 'react';

/*
 * Petit magasin partagé (sans dépendance) pour que les écrans médecin et patient
 * restent cohérents : confidentialité, demandes d'accès, résultats revus,
 * ordonnance et note de consultation. Persisté dans localStorage (démonstration).
 */
const KEY = 'alwarid:platform:v2';

export const DEFAULTS = {
    privacy: { lv: {} },
    access: { asked: false, resp: 'none' },
    results: { sel: 0, act: {}, inf: {}, rev: {} },
    rx: { sel: {}, ack: false, signed: false },
    note: { t: {}, signed: false, amends: 0 },
    session: { role: null },
};

let state = DEFAULTS;
let loaded = false;
const listeners = new Set();

function load() {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try {
        const raw = window.localStorage.getItem(KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            const merged = { ...DEFAULTS };
            Object.keys(DEFAULTS).forEach((k) => { merged[k] = { ...DEFAULTS[k], ...(saved[k] || {}) }; });
            state = merged;
        }
    } catch {
        /* stockage indisponible : on garde les valeurs par défaut */
    }
}

function emit() {
    listeners.forEach((l) => l());
    try {
        window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
        /* ignore */
    }
}

export function patchSlice(key, patch) {
    load();
    const cur = state[key];
    const next = typeof patch === 'function' ? patch(cur) : patch;
    state = { ...state, [key]: { ...cur, ...next } };
    emit();
}

export function resetPlatform() {
    state = DEFAULTS;
    emit();
}

function subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
}

/** Lit une tranche du magasin. */
export function usePlatform(key) {
    return useSyncExternalStore(
        subscribe,
        () => { load(); return state[key]; },
        () => DEFAULTS[key],
    );
}

/** Même forme que useState : [tranche, setState(partiel ou fonction)]. */
export function useStoreState(key) {
    const slice = usePlatform(key);
    const setState = useCallback((o) => patchSlice(key, o), [key]);
    return [slice, setState];
}

export const RESULT_COUNT = 3;
export function pendingResults(results) {
    const done = Object.values((results && results.rev) || {}).filter(Boolean).length;
    return Math.max(0, RESULT_COUNT - done);
}
