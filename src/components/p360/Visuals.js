'use client';
import { useId } from 'react';
import { ecgTrace, wavePath, sparkPath } from './signals';
import s from './Visuals.module.css';

/* ECG strip with the explainable AI band on the abnormal beat. */
export function Ecg({ beats, ai = true, seed = 3, amp = 0.62, base = 0.66, sw = 2.2, glow = true, w = 360, h = 150, className }) {
    const id = useId().replace(/:/g, '');
    const { d, marks, segs } = ecgTrace(w, h, beats, { seed, amp, base });
    return (
        <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
            <defs>
                <linearGradient id={`b${id}`} x1="0" x2="1">
                    <stop offset="0" stopColor="#FF4D4D" stopOpacity="0" />
                    <stop offset=".25" stopColor="#FF4D4D" stopOpacity=".45" />
                    <stop offset=".75" stopColor="#FF4D4D" stopOpacity=".45" />
                    <stop offset="1" stopColor="#FF4D4D" stopOpacity="0" />
                </linearGradient>
            </defs>
            {ai && marks.map((m, i) => <rect key={i} x={m[0] - 6} y="0" width={m[1] - m[0] + 12} height={h} fill={`url(#b${id})`} />)}
            <path d={d} fill="none" stroke="#3BE58E" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={glow ? { filter: 'drop-shadow(0 0 3px rgba(59,229,142,.8))' } : undefined} />
            {ai && segs.map((p, i) => <path key={i} d={p} fill="none" stroke="#FF6B5E" strokeWidth={sw + 1} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
        </svg>
    );
}

export function Wave({ kind, color, w = 360, h = 80 }) {
    return (
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
            <path d={wavePath(w, h, kind)} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

export function Spark({ vals, lo, hi, color = '#2A7DE1', target, h = 64 }) {
    const w = 380;
    const { d, pts, Y } = sparkPath(vals, w, h, lo, hi);
    return (
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden="true" className={s.spark}>
            {target !== undefined && <line x1="0" x2={w} y1={Y(target)} y2={Y(target)} stroke="#94A3B8" strokeDasharray="4 5" />}
            <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.6" fill={color} />)}
        </svg>
    );
}

/* Medical image with an optional AI heat area (positions in % of the image box). */
export function Scan({ src, alt, heat, box, height = 150, fit = 'cover', pos = 'center', labels }) {
    return (
        <div className={s.scan} style={{ height }}>
            <img src={src} alt={alt} style={{ objectFit: fit, objectPosition: pos }} />
            {heat && <span className={s.heat} style={{ left: `${heat[0]}%`, top: `${heat[1]}%`, width: `${heat[2]}%`, height: `${heat[3]}%` }} />}
            {box && <span className={s.box} style={{ left: `${box[0]}%`, top: `${box[1]}%`, width: `${box[2]}%`, height: `${box[3]}%` }} />}
            {labels && <><span className={s.lr} style={{ left: 10 }}>R</span><span className={s.lr} style={{ right: 10 }}>L</span></>}
        </div>
    );
}
