'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ZONES } from '@/data/bodyZones';

useGLTF.setDecoderPath('/draco/');
useGLTF.preload('/models/body-opt.glb', true);

const HOME = { target: [0, 0.9, 0], dist: 3.4 };

/* ───────────── Organes (formes stylisées, positionnées dans le thorax et l'abdomen) ───────────── */
function lumpy(geo, amp, freq, seed = 0) {
    const p = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const n = Math.sin(v.x * freq + seed) * Math.cos(v.y * freq * 1.3 + seed) * Math.sin(v.z * freq * 0.9 + seed);
        v.multiplyScalar(1 + n * amp);
        p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
}

function Organ({ id, zone, active, dim, color, position, scale, rotation = [0, 0, 0], geometry, onPick }) {
    const ref = useRef();
    const geo = useMemo(() => geometry(), [geometry]);
    useFrame((s) => {
        const m = ref.current;
        if (!m) return;
        const pulse = active ? 0.35 + Math.sin(s.clock.elapsedTime * 3) * 0.2 : 0;
        m.material.emissiveIntensity = THREE.MathUtils.lerp(m.material.emissiveIntensity, pulse, 0.15);
        const target = dim ? 0.35 : 1;
        m.material.opacity = THREE.MathUtils.lerp(m.material.opacity, target, 0.12);
    });
    return (
        <mesh
            ref={ref} geometry={geo} position={position} scale={scale} rotation={rotation}
            onClick={(e) => { e.stopPropagation(); onPick(zone); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
            <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} emissive={color} emissiveIntensity={0} transparent opacity={1} />
        </mesh>
    );
}

const G = {
    sphere: (a, f, s) => () => lumpy(new THREE.IcosahedronGeometry(1, 4), a, f, s),
    smooth: () => () => new THREE.SphereGeometry(1, 36, 28),
    coil: () => {
        const pts = [];
        const rows = 6, per = 5;
        for (let r = 0; r < rows; r++) {
            for (let i = 0; i < per; i++) {
                const t = i / (per - 1);
                const x = (r % 2 === 0 ? t : 1 - t) * 2 - 1;
                pts.push(new THREE.Vector3(x, 1 - (r + t * 0.0) * (2 / (rows - 1)) + Math.sin(t * Math.PI) * -0.08, Math.sin((r + t) * 1.7) * 0.25));
            }
        }
        return () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5), 220, 0.075, 12, false);
    },
};
const COIL = G.coil();
const GEO = {
    smooth: G.smooth(),
    brain: G.sphere(0.07, 38, 0.4),
    heart: G.sphere(0.12, 30, 1.1),
    liver: G.sphere(0.06, 24, 0.7),
    stomach: G.sphere(0.08, 20, 1.3),
    coil: COIL,
};

function Organs({ zoneDef, visible, onPick }) {
    if (!visible) return null;
    const on = (id) => zoneDef && zoneDef.organs.includes(id);
    const anyOrgan = zoneDef && zoneDef.organs.length > 0;
    const dim = (id) => anyOrgan && !on(id);
    return (
        <group>
            <Organ id="brain" zone="head" color="#e8a3a8" active={on('brain')} dim={dim('brain')} position={[0, 1.645, -0.022]} scale={[0.066, 0.052, 0.078]} geometry={GEO.brain} onPick={onPick} />
            <Organ id="lungR" zone="chest" color="#e7a5a3" active={on('lungs')} dim={dim('lungs')} position={[-0.078, 1.32, 0.0]} scale={[0.056, 0.11, 0.07]} geometry={GEO.smooth} onPick={onPick} />
            <Organ id="lungL" zone="chest" color="#e7a5a3" active={on('lungs')} dim={dim('lungs')} position={[0.078, 1.32, 0.0]} scale={[0.05, 0.11, 0.068]} geometry={GEO.smooth} onPick={onPick} />
            <Organ id="heart" zone="chest" color="#c8322f" active={on('heart')} dim={dim('heart')} position={[0.028, 1.31, 0.035]} rotation={[0, 0, -0.5]} scale={[0.04, 0.056, 0.042]} geometry={GEO.heart} onPick={onPick} />
            <Organ id="liver" zone="abdomen" color="#8d3b2d" active={on('liver')} dim={dim('liver')} position={[-0.065, 1.145, 0.025]} rotation={[0, 0, 0.18]} scale={[0.09, 0.045, 0.055]} geometry={GEO.liver} onPick={onPick} />
            <Organ id="stomach" zone="abdomen" color="#d98b84" active={on('stomach')} dim={dim('stomach')} position={[0.058, 1.14, 0.03]} rotation={[0, 0, -0.9]} scale={[0.06, 0.036, 0.04]} geometry={GEO.stomach} onPick={onPick} />
            <Organ id="kidneyR" zone="abdomen" color="#9b4a3f" active={on('kidneys')} dim={dim('kidneys')} position={[-0.062, 1.08, -0.045]} scale={[0.022, 0.04, 0.018]} geometry={GEO.smooth} onPick={onPick} />
            <Organ id="kidneyL" zone="abdomen" color="#9b4a3f" active={on('kidneys')} dim={dim('kidneys')} position={[0.062, 1.08, -0.045]} scale={[0.022, 0.04, 0.018]} geometry={GEO.smooth} onPick={onPick} />
            <Organ id="intestines" zone="abdomen" color="#e0a199" active={on('intestines')} dim={dim('intestines')} position={[0, 0.985, 0.025]} scale={[0.082, 0.062, 0.07]} geometry={GEO.coil} onPick={onPick} />
        </group>
    );
}

/* ───────────── Modèle anatomique (muscles et squelette) ───────────── */
function BodyModel({ layers }) {
    const { scene } = useGLTF('/models/body-opt.glb', true);
    const groups = useMemo(() => {
        const g = { bone: new Set(), muscle: new Set() };
        scene.traverse((o) => {
            if (!o.isMesh) return;
            const name = (o.material && o.material.name) || '';
            (/muscle/i.test(name) ? g.muscle : g.bone).add(o.material);
        });
        return g;
    }, [scene]);

    useEffect(() => {
        groups.bone.forEach((m) => {
            m.visible = layers.bone;
            m.color = new THREE.Color('#efe6d2');
            m.roughness = 0.6;
            m.metalness = 0;
            m.needsUpdate = true;
        });
        groups.muscle.forEach((m) => {
            m.visible = layers.muscle;
            m.transparent = layers.muscleOpacity < 1;
            m.opacity = layers.muscleOpacity;
            m.depthWrite = layers.muscleOpacity >= 0.98;
            m.side = THREE.DoubleSide;
            m.needsUpdate = true;
        });
    }, [groups, layers]);

    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') window.__body = { scene, THREE };
    }, [scene]);

    return <primitive object={scene} />;
}

/* ───────────── Caméra : glisse vers la zone choisie ───────────── */
function CameraRig({ focus, nonce, controlsRef, zonesById }) {
    const { camera } = useThree();
    const goal = useRef({ target: new THREE.Vector3(...HOME.target), dist: HOME.dist, run: false });
    useEffect(() => {
        const z = focus ? zonesById[focus] : null;
        goal.current.target.set(...(z ? z.target : HOME.target));
        goal.current.dist = z ? z.dist : HOME.dist;
        goal.current.run = true;
    }, [focus, nonce, zonesById]);
    useEffect(() => {
        const c = controlsRef.current;
        if (!c) return undefined;
        const stop = () => { goal.current.run = false; };
        c.addEventListener('start', stop);
        return () => c.removeEventListener('start', stop);
    }, [controlsRef]);
    useFrame((_, dt) => {
        const c = controlsRef.current;
        if (!c || !goal.current.run) return;
        const k = 1 - Math.exp(-dt * 3.2);
        c.target.lerp(goal.current.target, k);
        const dir = camera.position.clone().sub(c.target);
        const cur = dir.length();
        dir.normalize().multiplyScalar(THREE.MathUtils.lerp(cur, goal.current.dist, k));
        camera.position.copy(c.target).add(dir);
        c.update();
        if (c.target.distanceTo(goal.current.target) < 0.004 && Math.abs(cur - goal.current.dist) < 0.01) goal.current.run = false;
    });
    return null;
}

function Hotspot({ z, on, onPick, dotOnly }) {
    return (
        <Html position={z.anchor} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: 0, height: 0 }}>
                <button
                    type="button" aria-label={z.label} onClick={() => onPick(z.id)}
                    style={{
                        pointerEvents: 'auto', position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: '50%', border: '3px solid #fff', background: z.color,
                        boxShadow: `0 0 0 ${on ? 7 : 0}px ${z.color}33, 0 6px 14px rgba(15,23,42,0.35)`, cursor: 'pointer', padding: 0,
                        transform: `scale(${on ? 1.2 : 1})`, transition: 'all 220ms ease',
                    }}
                />
                {dotOnly ? null : <button
                    type="button" onClick={() => onPick(z.id)}
                    style={{
                        pointerEvents: 'auto', position: 'absolute', left: 24, top: -17, whiteSpace: 'nowrap', minHeight: 34, border: 'none', borderRadius: 999, padding: '0 14px',
                        fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: on ? '#1c5fb2' : '#ffffff', color: on ? '#ffffff' : z.tone, boxShadow: '0 10px 22px -10px rgba(15,23,42,0.45)',
                    }}
                >
                    {z.label}
                </button>}
            </div>
        </Html>
    );
}

const PRESETS = [
    { id: 'all', label: 'Tout', layers: { muscle: true, bone: true, organs: true, muscleOpacity: 0.22 } },
    { id: 'body', label: 'Muscles', layers: { muscle: true, bone: false, organs: false, muscleOpacity: 1 } },
    { id: 'bones', label: 'Squelette', layers: { muscle: false, bone: true, organs: false, muscleOpacity: 1 } },
    { id: 'organs', label: 'Organes', layers: { muscle: false, bone: true, organs: true, muscleOpacity: 1 } },
];

export default function Body3D({ zones = ZONES, zone, onZoneChange, height = 760, mini = false }) {
    const controlsRef = useRef();
    const [preset, setPreset] = useState('all');
    const [nonce, setNonce] = useState(0);
    const [spin, setSpin] = useState(true);
    const layers = PRESETS.find((p) => p.id === preset).layers;
    const zonesById = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones]);
    const zoneDef = zone ? zonesById[zone] : null;

    const pick = (id) => {
        const z = zonesById[id];
        if (!z) return;
        onZoneChange(id);
        setSpin(false);
        if (z.organs.length && preset !== 'organs' && preset !== 'all') setPreset('organs');
        setNonce((n) => n + 1);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height, borderRadius: mini ? 16 : 28, overflow: 'hidden', background: 'radial-gradient(70% 55% at 50% 40%, #eaf5fe 0%, #d6e9f9 60%, #c5def4 100%)' }}>
            <Canvas camera={{ position: [0.9, 1.15, 3.3], fov: 32, near: 0.05, far: 20 }} dpr={mini ? [1, 1.25] : [1, 1.75]} gl={{ antialias: true }}>
                <ambientLight intensity={0.85} />
                <hemisphereLight args={['#ffffff', '#9ec3e6', 0.7]} />
                <directionalLight position={[2, 3, 3]} intensity={1.6} />
                <directionalLight position={[-3, 1.5, -2]} intensity={0.7} color="#bcd9f5" />
                <Suspense fallback={<Html center><div style={{ fontFamily: 'inherit', fontWeight: 700, color: '#1c5fb2', background: '#fff', borderRadius: 999, padding: '10px 18px', boxShadow: '0 10px 24px -12px rgba(28,95,178,0.5)' }}>Chargement du modèle 3D…</div></Html>}>
                    <BodyModel layers={layers} />
                    <Organs zoneDef={zoneDef} visible={layers.organs} onPick={pick} />
                    {zones.map((z) => <Hotspot key={z.id} z={z} on={z.id === zone} onPick={pick} dotOnly={mini} />)}
                </Suspense>
                <CameraRig focus={zone} nonce={nonce} controlsRef={controlsRef} zonesById={zonesById} />
                <OrbitControls
                    ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} zoomToCursor
                    target={HOME.target} minDistance={0.3} maxDistance={4.2} autoRotate={spin} autoRotateSpeed={0.9}
                    onStart={() => setSpin(false)}
                />
            </Canvas>

            {mini ? null : (
                <>
                    <div style={{ position: 'absolute', left: 16, top: 16, display: 'flex', gap: 6, flexWrap: 'wrap', background: 'rgba(255,255,255,0.82)', padding: 5, borderRadius: 999, boxShadow: '0 12px 28px -14px rgba(28,95,178,0.5)', backdropFilter: 'blur(10px)' }}>
                        {PRESETS.map((p) => (
                            <button
                                key={p.id} type="button" onClick={() => setPreset(p.id)}
                                style={{ minHeight: 38, padding: '0 16px', border: 'none', borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: preset === p.id ? 'linear-gradient(135deg,#2a7de1,#1c5fb2)' : 'transparent', color: preset === p.id ? '#fff' : '#334155' }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'absolute', right: 16, bottom: 14, display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => { onZoneChange(null); setPreset('all'); setNonce((n) => n + 1); }} style={{ minHeight: 42, padding: '0 16px', border: 'none', borderRadius: 999, background: 'rgba(255,255,255,0.9)', color: '#1c5fb2', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 28px -14px rgba(28,95,178,0.5)' }}>
                            Vue d&apos;ensemble
                        </button>
                    </div>
                    <div style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 12, fontWeight: 600, color: '#334155', background: 'rgba(255,255,255,0.8)', borderRadius: 999, padding: '7px 14px' }}>
                        Glisser, molette, cliquer une zone
                    </div>
                </>
            )}
        </div>
    );
}
