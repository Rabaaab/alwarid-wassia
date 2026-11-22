'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ZONES } from '@/data/bodyZones';

/*
 * Corps humain 3D interactif.
 * Anatomie : BodyParts3D, (c) The Database Center for Life Science, licence CC BY 4.0
 * (adaptation : axes et unités convertis, maillages regroupés et simplifiés).
 * Le modèle ne contient pas les poumons ni le foie entiers : ils sont dessinés en formes
 * translucides autour des bronches et des voies biliaires réelles.
 */
const MODEL_URL = '/models/body-bp3d.glb';
useGLTF.setDecoderPath('/draco/');
useGLTF.preload(MODEL_URL, true);

const HOME = { target: [0, 0.97, 0], dist: 3.75 };

const STYLE = {
    skin: { color: '#8fc3ee', roughness: 0.25 },
    bones: { color: '#efe6d2', roughness: 0.6 },
    muscles: { color: '#b84a42', roughness: 0.55 },
    arteries: { color: '#e03b3b', roughness: 0.45 },
    veins: { color: '#3a6fd6', roughness: 0.45 },
    brain: { color: '#e9aab0', roughness: 0.6 },
    heart: { color: '#c63a3a', roughness: 0.5 },
    bronchi: { color: '#eab6aa', roughness: 0.5 },
    stomach: { color: '#da857d', roughness: 0.55 },
    intestines: { color: '#e4a89c', roughness: 0.55 },
    pancreas: { color: '#e2b46d', roughness: 0.55 },
    biliary: { color: '#4f9a62', roughness: 0.5 },
    kidneys: { color: '#a24d46', roughness: 0.5 },
    bladder: { color: '#e2baa2', roughness: 0.5 },
    spleen: { color: '#8f3550', roughness: 0.55 },
};
const LAYER_OF = { skin: 'skin', bones: 'bones', muscles: 'muscles', arteries: 'arteries', veins: 'veins' };
const ORGAN_ZONE = { brain: 'head', heart: 'chest', bronchi: 'chest', stomach: 'abdomen', intestines: 'abdomen', pancreas: 'abdomen', biliary: 'abdomen', kidneys: 'abdomen', bladder: 'abdomen', spleen: 'abdomen' };
// nom du maillage -> nom utilisé dans les listes `organs` des zones
const ORGAN_KEY = { brain: 'brain', heart: 'heart', bronchi: 'lungs', stomach: 'stomach', intestines: 'intestines', pancreas: 'abdomen', biliary: 'liver', kidneys: 'kidneys', bladder: 'abdomen', spleen: 'abdomen' };

/* ───────────── Poumons et foie (formes translucides) ───────────── */
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
const makeLung = () => lumpy(new THREE.SphereGeometry(1, 40, 32), 0.05, 6, 1);
const makeLiver = () => lumpy(new THREE.SphereGeometry(1, 36, 28), 0.07, 5, 3);

function Soft({ id, zone, active, dim, level, color, position, scale, rotation = [0, 0, 0], make, base, onPick }) {
    const ref = useRef();
    const geo = useMemo(() => make(), [make]);
    useFrame((s) => {
        const m = ref.current;
        if (!m) return;
        const pulse = active ? 0.3 + Math.sin(s.clock.elapsedTime * 3) * 0.18 : 0;
        m.material.emissiveIntensity = THREE.MathUtils.lerp(m.material.emissiveIntensity, pulse, 0.15);
        const target = (dim ? 0.18 : base) * level;
        m.material.opacity = THREE.MathUtils.lerp(m.material.opacity, target, 0.12);
    });
    return (
        <mesh
            ref={ref} geometry={geo} position={position} scale={scale} rotation={rotation} visible={level > 0}
            onClick={(e) => { e.stopPropagation(); onPick(zone); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.02} emissive={color} emissiveIntensity={0} transparent opacity={base * level} depthWrite={false} />
        </mesh>
    );
}

function SoftOrgans({ zoneDef, level, onPick }) {
    const on = (k) => zoneDef && zoneDef.organs.includes(k);
    const any = zoneDef && zoneDef.organs.length > 0;
    const dim = (k) => any && !on(k);
    return (
        <group>
            <Soft id="lungR" zone="chest" level={level} color="#e9a9a6" base={0.42} active={on('lungs')} dim={dim('lungs')} position={[-0.078, 1.315, 0.0]} scale={[0.058, 0.118, 0.078]} make={makeLung} onPick={onPick} />
            <Soft id="lungL" zone="chest" level={level} color="#e9a9a6" base={0.42} active={on('lungs')} dim={dim('lungs')} position={[0.082, 1.315, 0.0]} scale={[0.052, 0.118, 0.074]} make={makeLung} onPick={onPick} />
            <Soft id="liver" zone="abdomen" level={level} color="#9a4132" base={0.5} active={on('liver')} dim={dim('liver')} position={[-0.055, 1.165, 0.03]} rotation={[0, 0, 0.16]} scale={[0.1, 0.052, 0.066]} make={makeLiver} onPick={onPick} />
        </group>
    );
}

/* ───────────── Modèle BodyParts3D ───────────── */
function makeMaterial(name) {
    const st = STYLE[name];
    return new THREE.MeshStandardMaterial({ color: st.color, roughness: st.roughness, metalness: 0.02, emissive: st.color, emissiveIntensity: 0, transparent: true, side: name === 'skin' ? THREE.FrontSide : THREE.DoubleSide });
}

function Anatomy({ layers, zoneDef, onPick }) {
    const { scene } = useGLTF(MODEL_URL, true);
    const meshes = useMemo(() => {
        const m = {};
        scene.traverse((o) => {
            if (!o.isMesh || !STYLE[o.name]) return;
            o.material = makeMaterial(o.name);
            o.frustumCulled = false;
            m[o.name] = o;
        });
        return m;
    }, [scene]);

    useEffect(() => {
        Object.entries(meshes).forEach(([name, mesh]) => {
            const level = layers[LAYER_OF[name] || 'organs'];
            mesh.visible = level > 0;
            mesh.userData.level = level;
            mesh.material.depthWrite = level >= 1;
            if (LAYER_OF[name]) mesh.material.opacity = level;
            mesh.renderOrder = name === 'skin' ? 5 : 0;
        });
    }, [meshes, layers]);

    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') window.__body = { scene, THREE };
    }, [scene]);

    useFrame((s) => {
        const any = zoneDef && zoneDef.organs.length > 0;
        Object.entries(meshes).forEach(([name, mesh]) => {
            if (LAYER_OF[name] || !mesh.visible) return;
            const key = ORGAN_KEY[name];
            const active = zoneDef && zoneDef.organs.includes(key);
            const pulse = active ? 0.28 + Math.sin(s.clock.elapsedTime * 3) * 0.16 : 0;
            mesh.material.emissiveIntensity = THREE.MathUtils.lerp(mesh.material.emissiveIntensity, pulse, 0.15);
            const target = (any && !active ? 0.2 : 1) * (mesh.userData.level ?? 1);
            mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, target, 0.12);
            mesh.material.depthWrite = mesh.material.opacity > 0.98;
        });
    });

    const hit = (e) => e.intersections.find((i) => ORGAN_ZONE[i.object.name] && i.object.visible);
    return (
        <primitive
            object={scene}
            onClick={(e) => { const h = hit(e); if (h) { e.stopPropagation(); onPick(ORGAN_ZONE[h.object.name]); } }}
            onPointerMove={(e) => { document.body.style.cursor = hit(e) ? 'pointer' : 'auto'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        />
    );
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
    const showLabel = !dotOnly && (on || z.alwaysLabel);
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
                {showLabel ? <button
                    type="button" onClick={() => onPick(z.id)}
                    style={{
                        pointerEvents: 'auto', position: 'absolute', left: 24, top: -17, whiteSpace: 'nowrap', minHeight: 34, border: 'none', borderRadius: 999, padding: '0 14px',
                        fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: on ? '#1c5fb2' : '#ffffff', color: on ? '#ffffff' : z.tone, boxShadow: '0 10px 22px -10px rgba(15,23,42,0.45)',
                    }}
                >
                    {z.label}
                </button> : null}
            </div>
        </Html>
    );
}

const PRESETS = [
    { id: 'all', label: 'Tout', layers: { skin: 0.1, bones: 0.55, muscles: 0, organs: 1, arteries: 0, veins: 0 } },
    { id: 'muscles', label: 'Muscles', layers: { skin: 0, bones: 0, muscles: 1, organs: 0, arteries: 0, veins: 0 } },
    { id: 'bones', label: 'Squelette', layers: { skin: 0, bones: 1, muscles: 0, organs: 0, arteries: 0, veins: 0 } },
    { id: 'organs', label: 'Organes', layers: { skin: 0.07, bones: 0.2, muscles: 0, organs: 1, arteries: 0, veins: 0 } },
    { id: 'vessels', label: 'Vaisseaux', layers: { skin: 0.07, bones: 0.12, muscles: 0, organs: 0.35, arteries: 1, veins: 1 } },
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
        if (z.organs.length && ['muscles', 'bones', 'vessels'].includes(preset)) setPreset('organs');
        setNonce((n) => n + 1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height }}>
        <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: mini ? 16 : 28, overflow: 'hidden', background: 'radial-gradient(70% 55% at 50% 40%, #eaf5fe 0%, #d6e9f9 60%, #c5def4 100%)' }}>
            <Canvas camera={{ position: [0.9, 1.15, 3.3], fov: 32, near: 0.05, far: 20 }} dpr={mini ? [1, 1.25] : [1, 1.75]} gl={{ antialias: true }}>
                <ambientLight intensity={0.9} />
                <hemisphereLight args={['#ffffff', '#9ec3e6', 0.7]} />
                <directionalLight position={[2, 3, 3]} intensity={1.5} />
                <directionalLight position={[-3, 1.5, -2]} intensity={0.7} color="#bcd9f5" />
                <Suspense fallback={<Html center><div style={{ fontFamily: 'inherit', fontWeight: 700, color: '#1c5fb2', background: '#fff', borderRadius: 999, padding: '10px 18px', boxShadow: '0 10px 24px -12px rgba(28,95,178,0.5)' }}>Chargement du modèle 3D…</div></Html>}>
                    <Anatomy layers={layers} zoneDef={zoneDef} onPick={pick} />
                    <SoftOrgans zoneDef={zoneDef} level={layers.organs} onPick={pick} />
                    {zones.map((z) => <Hotspot key={z.id} z={{ ...z, alwaysLabel: z.alwaysLabel ?? zones.length <= 4 }} on={z.id === zone} onPick={pick} dotOnly={mini} />)}
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
                    <div style={{ position: 'absolute', left: 16, top: 16, display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 'calc(100% - 32px)', background: 'rgba(255,255,255,0.82)', padding: 5, borderRadius: 24, boxShadow: '0 12px 28px -14px rgba(28,95,178,0.5)', backdropFilter: 'blur(10px)' }}>
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
        {mini ? null : (
            <div style={{ fontSize: 11, color: '#64748b', padding: '8px 6px 0', lineHeight: 1.4 }}>
                Anatomie : BodyParts3D, © The Database Center for Life Science, licence CC BY 4.0. Poumons et foie dessinés en formes translucides.
            </div>
        )}
        </div>
    );
}
