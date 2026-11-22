'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Body3D from '@/components/Body3D';
import { ZONES } from '@/data/bodyZones';

/*
 * Corps humain 3D : Svitylo 3D Anatomy Atlas (CPAL-1.0), données issues de Z-Anatomy et
 * BodyParts3D (CC BY-SA 4.0), reins du Human Reference Atlas et oreille OpenEar (CC BY 4.0).
 * Les données sont servies depuis /anatomy-data (qualité "economy").
 *
 * Pudeur : les organes génitaux, la peau de la région urogénitale et les poils pubiens
 * sont masqués en permanence. Si l'atlas ne se charge pas, on retombe sur notre modèle léger.
 *
 * Interaction : des points cliquables sont posés sur le corps (comme avant). Un clic sur un
 * point, ou sur un organe, choisit la zone et ouvre ses examens. Rien n'est masqué ni affiché
 * par ces clics : seules la mise en évidence et la caméra changent.
 */
const DATA_URL = '/anatomy-data/1.2.0/';

const HIDE = [
    'visceral.genital_systems',
    'visceral.urethra',
    'regions.pubic_hairs',
    'regions.urogenital_region_l',
    'regions.urogenital_region_r',
    'muscular.perineal_muscles',
    'cardiovascular.deep_artery_of_penis_l',
    'cardiovascular.deep_artery_of_penis_r',
    'cardiovascular.dorsal_artery_of_penis_l',
    'cardiovascular.dorsal_artery_of_penis_r',
    'cardiovascular.superficial_dorsal_veins_of_penis',
    'cardiovascular.deep_dorsal_vein_of_penis',
    'cardiovascular.left_testicular_artery',
    'cardiovascular.right_testicular_artery_r',
    'cardiovascular.left_testicular_vein',
    'cardiovascular.right_testicular_vein',
];

const ZONE_IDS = {
    head: ['nervous.brain'],
    chest: ['cardiovascular.heart', 'visceral.lungs'],
    abdomen: ['visceral.liver', 'visceral.stomach', 'visceral.pancreas', 'visceral.small_intestine', 'visceral.large_intestine', 'visceral.kidney_l', 'visceral.kidney_r'],
    knee: ['skeletal.patella_l', 'joints.articular_capsule_of_knee_joint_l'],
    rightArm: ['skeletal.humerus_r', 'skeletal.radius_r', 'skeletal.ulna_r'],
    leftArm: ['skeletal.humerus_l', 'skeletal.radius_l', 'skeletal.ulna_l'],
    rightLeg: ['skeletal.femur_r', 'skeletal.tibia_r'],
    leftLeg: ['skeletal.femur_l', 'skeletal.tibia_l'],
};

// Position des points sur le corps (mètres, repère de l'atlas : Y vers le haut, +Z devant, +X côté gauche du patient)
const ANCHORS = {
    head: [0, 1.63, 0.1],
    chest: [0.035, 1.3, 0.12],
    abdomen: [0, 1.04, 0.13],
    knee: [0.085, 0.46, 0.09],
    rightArm: [-0.21, 1.2, 0.05],
    leftArm: [0.21, 1.2, 0.05],
    rightLeg: [-0.09, 0.62, 0.08],
    leftLeg: [0.095, 0.62, 0.08],
};

const ATLAS_STYLE = {
    display: 'block',
    width: '100%',
    height: '100%',
    '--svitylo-anatomy-scene-bg': '#edf1f6',
    '--svitylo-anatomy-bg': '#edf1f6',
    '--svitylo-anatomy-panel-bg': '#ffffff',
    '--svitylo-anatomy-text': '#0f172a',
    '--svitylo-anatomy-muted': '#475569',
    '--svitylo-anatomy-accent': '#1c5fb2',
    '--svitylo-anatomy-border': '#cfe0f2',
    '--svitylo-anatomy-font': "'Plus Jakarta Sans', system-ui, sans-serif",
    '--svitylo-anatomy-panel-width': '0px',
    '--svitylo-anatomy-info-width': '0px',
};

const PRESETS = [
    { id: 'all', label: 'Tout', isolate: ['skeletal', 'joints', 'visceral', 'nervous', 'cardiovascular.heart'] },
    { id: 'muscles', label: 'Muscles', isolate: ['muscular'] },
    { id: 'bones', label: 'Squelette', isolate: ['skeletal', 'joints'] },
    { id: 'organs', label: 'Organes', isolate: ['visceral', 'nervous', 'cardiovascular.heart'] },
    { id: 'vessels', label: 'Vaisseaux', isolate: ['cardiovascular', 'skeletal'] },
];

function zoneOfStructure(id, zones) {
    for (const z of zones) {
        const ids = ZONE_IDS[z.id] || [];
        if (ids.some((s) => id === s || id.startsWith(s + '.') || s.startsWith(id + '.'))) return z.id;
    }
    return null;
}

/* Projection d'un point 3D sur l'écran à partir de la caméra de l'atlas (haut = +Y). */
function project(p, cam, w, h) {
    const [px, py, pz] = cam.position;
    const [tx, ty, tz] = cam.target;
    let fx = tx - px, fy = ty - py, fz = tz - pz;
    const fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl; fy /= fl; fz /= fl;
    // droite = f x up(0,1,0)
    let rx = -fz, ry = 0, rz = fx;
    const rl = Math.hypot(rx, ry, rz) || 1;
    rx /= rl; rz /= rl;
    // haut = r x f
    const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
    const vx = p[0] - px, vy = p[1] - py, vz = p[2] - pz;
    const depth = vx * fx + vy * fy + vz * fz;
    if (depth <= 0.05) return null;
    const th = Math.tan(((cam.fov || 35) * Math.PI) / 360);
    const nx = (vx * rx + vy * ry + vz * rz) / (depth * th * (w / h));
    const ny = (vx * ux + vy * uy + vz * uz) / (depth * th);
    return { x: (nx * 0.5 + 0.5) * w, y: (-ny * 0.5 + 0.5) * h };
}

export default function AnatomyViewer({ zones = ZONES, zone, onZoneChange, height = 760 }) {
    const elRef = useRef(null);
    const boxRef = useRef(null);
    const [mode, setMode] = useState('loading'); // loading | atlas | legacy
    const [sceneReady, setSceneReady] = useState(false);
    const [preset, setPreset] = useState('all');
    const [progress, setProgress] = useState(null);
    const [cam, setCam] = useState(null);
    const [box, setBox] = useState(null);
    const zonesRef = useRef(zones);
    const changeRef = useRef(onZoneChange);
    const zoneRef = useRef(zone);
    zonesRef.current = zones;
    changeRef.current = onZoneChange;
    zoneRef.current = zone;

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        if (new URLSearchParams(window.location.search).get('body') === 'legacy') {
            setMode('legacy');
            return undefined;
        }
        let alive = true;
        import('@authorod/svitylo-3d-anatomy-atlas')
            .then(() => { if (alive) setMode('atlas'); })
            .catch(() => { if (alive) setMode('legacy'); });
        return () => { alive = false; };
    }, []);

    const keepHidden = useCallback(() => {
        const el = elRef.current;
        if (el && typeof el.hide === 'function') el.hide(HIDE);
    }, []);

    // sélection stable : on remet toujours la sélection de notre zone
    const applySelection = useCallback(() => {
        const el = elRef.current;
        if (!el) return;
        const z = zoneRef.current;
        if (z && ZONE_IDS[z]) {
            el.select(ZONE_IDS[z]);
            el.setTransparency(0.5);
        } else {
            el.select([]);
            el.setTransparency(0);
        }
    }, []);

    useEffect(() => {
        if (mode !== 'atlas') return undefined;
        const el = elRef.current;
        if (!el) return undefined;
        let alive = true;
        const onReady = (e) => {
            if (e.detail && e.detail.kind === 'ui') {
                // on garde la scène et le logo Svitylo, on retire la barre de recherche, les panneaux et la barre d'outils
                if (el.shadowRoot && !el.shadowRoot.querySelector('style[data-alwarid]')) {
                    const st = document.createElement('style');
                    st.setAttribute('data-alwarid', '');
                    st.textContent = 'header.bar, aside#panel, aside#info, .scene-controls { display: none !important; } .shell { display: block !important; height: 100% !important; } main.stage { height: 100% !important; min-height: 0 !important; }';
                    el.shadowRoot.appendChild(st);
                }
                // le visualiseur 3D se crée juste après l'interface : on réessaie brièvement
                let tries = 0;
                const start = () => {
                    if (!alive) return;
                    Promise.resolve()
                        .then(() => el.loadAll())
                        .catch((err) => {
                            tries += 1;
                            if (tries < 25 && /not ready/i.test(String((err && err.message) || err))) setTimeout(start, 300);
                            else setMode('legacy');
                        });
                };
                start();
            } else if (e.detail && e.detail.kind === 'scene' && e.detail.complete) {
                keepHidden();
                setSceneReady(true);
            }
        };
        const onSelect = (e) => {
            const ids = (e.detail && e.detail.ids) || [];
            const primary = (e.detail && e.detail.primary) || ids[0];
            if (!primary) return;
            const z = zoneOfStructure(primary, zonesRef.current);
            if (z && z !== zoneRef.current) changeRef.current(z);
            else if (!z) setTimeout(applySelection, 0); // clic sur une structure hors zones : on garde notre sélection
        };
        const onVis = () => keepHidden(); // si une partie masquée réapparaît, on la remasque
        const onProgress = (e) => setProgress(e.detail || null);
        const onError = () => setMode('legacy');
        el.addEventListener('anatomy:ready', onReady);
        el.addEventListener('anatomy:select', onSelect);
        el.addEventListener('anatomy:visibility', onVis);
        el.addEventListener('anatomy:progress', onProgress);
        el.addEventListener('anatomy:error', onError);
        return () => {
            alive = false;
            el.removeEventListener('anatomy:ready', onReady);
            el.removeEventListener('anatomy:select', onSelect);
            el.removeEventListener('anatomy:visibility', onVis);
            el.removeEventListener('anatomy:progress', onProgress);
            el.removeEventListener('anatomy:error', onError);
        };
    }, [mode, keepHidden, applySelection]);

    // caméra : on lit sa position ~20 fois par seconde pour garder les points collés au corps
    useEffect(() => {
        if (mode !== 'atlas' || !sceneReady) return undefined;
        const el = elRef.current;
        let raf = 0;
        let frame = 0;
        let last = '';
        const tick = () => {
            frame += 1;
            if (frame % 3 === 0 && el && typeof el.getState === 'function') {
                try {
                    const c = el.getState().camera;
                    const key = c ? c.position.join(',') + '|' + c.target.join(',') + '|' + c.fov : '';
                    if (c && key !== last) {
                        last = key;
                        setCam({ position: c.position, target: c.target, fov: c.fov });
                    }
                } catch { /* l'atlas se recharge */ }
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [mode, sceneReady]);

    // taille de la zone d'affichage
    useEffect(() => {
        const node = boxRef.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(() => {
            const r = node.getBoundingClientRect();
            setBox({ w: r.width, h: r.height });
        });
        ro.observe(node);
        return () => ro.disconnect();
    }, [mode]);

    // couches
    useEffect(() => {
        const el = elRef.current;
        if (mode !== 'atlas' || !sceneReady || !el) return;
        const p = PRESETS.find((x) => x.id === preset);
        Promise.resolve(el.isolate(p.isolate)).then(() => { keepHidden(); applySelection(); });
    }, [mode, sceneReady, preset, keepHidden, applySelection]);

    // zone choisie : mise en évidence et caméra, sans rien masquer
    useEffect(() => {
        const el = elRef.current;
        if (mode !== 'atlas' || !sceneReady || !el) return;
        applySelection();
        if (zone && ZONE_IDS[zone]) el.focusOn(ZONE_IDS[zone]);
        else el.setView('anterior');
    }, [mode, sceneReady, zone, applySelection]);

    if (mode === 'legacy') {
        return <Body3D zones={zones} zone={zone} onZoneChange={onZoneChange} height={height} />;
    }

    const pct = progress && progress.total ? Math.round((progress.loaded / progress.total) * 100) : null;
    const dots = [];
    if (sceneReady && cam && box) {
        zones.forEach((z) => {
            const a = ANCHORS[z.id];
            if (!a) return;
            const s = project(a, cam, box.w, box.h);
            if (!s || s.x < -20 || s.y < -20 || s.x > box.w + 20 || s.y > box.h + 20) return;
            dots.push({ z, x: s.x, y: s.y, on: z.id === zone });
        });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height }}>
            <div ref={boxRef} style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 28, overflow: 'hidden', background: '#edf1f6' }}>
                {mode === 'atlas' ? (
                    <svitylo-anatomy
                        ref={elRef}
                        data-url={DATA_URL}
                        layout="full"
                        quality="economy"
                        theme="light"
                        lang="en"
                        autoload=""
                        style={ATLAS_STYLE}
                    />
                ) : null}
                {!sceneReady ? (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ fontWeight: 700, color: '#1c5fb2', background: '#fff', borderRadius: 999, padding: '10px 18px', boxShadow: '0 10px 24px -12px rgba(28,95,178,0.5)' }}>
                            Chargement du corps 3D{pct !== null ? ` ${pct} %` : '…'}
                        </div>
                    </div>
                ) : null}

                {/* points cliquables sur le corps */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
                    {dots.map(({ z, x, y, on }) => (
                        <div key={z.id} style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
                            <button
                                type="button" aria-label={z.label} onClick={() => onZoneChange(z.id)}
                                style={{
                                    pointerEvents: 'auto', position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: '50%', border: '3px solid #fff', background: z.color,
                                    boxShadow: `0 0 0 ${on ? 7 : 0}px ${z.color}33, 0 6px 14px rgba(15,23,42,0.35)`, cursor: 'pointer', padding: 0,
                                    transform: `scale(${on ? 1.2 : 1})`, transition: 'box-shadow 220ms ease, transform 220ms ease',
                                }}
                            />
                            {on || zones.length <= 4 ? (
                                <button
                                    type="button" onClick={() => onZoneChange(z.id)}
                                    style={{
                                        pointerEvents: 'auto', position: 'absolute', left: 24, top: -17, whiteSpace: 'nowrap', minHeight: 34, border: 'none', borderRadius: 999, padding: '0 14px',
                                        fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        background: on ? '#1c5fb2' : '#ffffff', color: on ? '#ffffff' : z.tone, boxShadow: '0 10px 22px -10px rgba(15,23,42,0.45)',
                                    }}
                                >
                                    {z.label}
                                </button>
                            ) : null}
                        </div>
                    ))}
                </div>

                {sceneReady ? (
                    <>
                        <div style={{ position: 'absolute', left: 14, top: 14, zIndex: 5 }}>
                            <button
                                type="button" onClick={() => onZoneChange(null)}
                                style={{ minHeight: 36, padding: '0 14px', border: 'none', borderRadius: 999, background: 'rgba(255,255,255,0.92)', color: '#1c5fb2', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 24px -14px rgba(28,95,178,0.5)' }}
                            >
                                Vue d&apos;ensemble
                            </button>
                        </div>
                        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 5, pointerEvents: 'none' }}>
                            <div style={{ pointerEvents: 'auto', display: 'flex', gap: 2, flexWrap: 'nowrap', maxWidth: '100%', overflowX: 'auto', background: 'rgba(255,255,255,0.92)', padding: 4, borderRadius: 999, boxShadow: '0 10px 24px -14px rgba(28,95,178,0.5)', backdropFilter: 'blur(10px)', scrollbarWidth: 'none' }}>
                                {PRESETS.map((p) => (
                                    <button
                                        key={p.id} type="button" onClick={() => setPreset(p.id)}
                                        style={{ minHeight: 34, padding: '0 11px', border: 'none', borderRadius: 999, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none', background: preset === p.id ? 'linear-gradient(135deg,#2a7de1,#1c5fb2)' : 'transparent', color: preset === p.id ? '#fff' : '#334155' }}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', padding: '8px 6px 0', lineHeight: 1.45 }}>
                Anatomie : Z-Anatomy et BodyParts3D (CC BY-SA 4.0), reins du Human Reference Atlas et oreille OpenEar (CC BY 4.0).
                Visionneuse : <a href="https://svitylo.com" target="_blank" rel="noreferrer" style={{ color: '#1c5fb2' }}>Svitylo 3D Anatomy Atlas</a> (CPAL-1.0).
                Données de démonstration, sans valeur diagnostique.
            </div>
        </div>
    );
}
