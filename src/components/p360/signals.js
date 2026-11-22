// Demo signal generators for the live monitor (deterministic, no randomness between renders).
function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const g = (x, mu, sg, a) => a * Math.exp(-((x - mu) * (x - mu)) / (2 * sg * sg));
const toPath = (pts) => pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');

export const N = (len) => ({ len, kind: 'n' });
export const V = (len) => ({ len, kind: 'v' });

/* ECG trace. Normal beats have P, QRS and T waves; 'v' beats are the abnormal beat the AI flags. */
export function ecgTrace(w, h, beats, { seed = 3, amp = 0.6, base = 0.64, noise = 0.012 } = {}) {
    const r = rng(seed);
    const total = beats.reduce((a, b) => a + b.len, 0);
    const k = w / total;
    const pts = [];
    const marks = [];
    let x0 = 0;
    for (const b of beats) {
        if (b.kind === 'v') marks.push([x0 * k, (x0 + b.len) * k]);
        for (let i = 0; i < b.len; i++) {
            const t = i / b.len;
            let v;
            if (b.kind === 'n') v = g(t, 0.16, 0.035, 0.1) + g(t, 0.335, 0.012, -0.09) + g(t, 0.37, 0.012, 1.0) + g(t, 0.405, 0.014, -0.2) + g(t, 0.64, 0.06, 0.2);
            else v = g(t, 0.3, 0.03, -0.12) + g(t, 0.4, 0.035, 1.15) + g(t, 0.47, 0.03, -0.55) + g(t, 0.7, 0.07, -0.28);
            v += (r() - 0.5) * noise;
            pts.push([(x0 + i) * k, h * base - v * h * amp]);
        }
        x0 += b.len;
    }
    const segs = marks.map((m) => toPath(pts.filter((q) => q[0] >= m[0] && q[0] <= m[1])));
    return { d: toPath(pts), marks, segs };
}

export function wavePath(w, h, kind) {
    let d = '';
    for (let x = 0; x <= w; x += 2) {
        let y;
        if (kind === 'pleth') {
            const t = (x / (w / 3)) % 1;
            y = h * 0.82 - h * 0.62 * (g(t, 0.25, 0.09, 1) + g(t, 0.5, 0.08, 0.28));
        } else {
            y = h / 2 + Math.sin((x / (w / 2.2)) * Math.PI * 2) * h * 0.32;
        }
        d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    return d;
}

export function sparkPath(vals, w, h, lo, hi) {
    const X = (i) => 6 + (i * (w - 12)) / (vals.length - 1);
    const Y = (v) => h - 8 - ((v - lo) / (hi - lo)) * (h - 16);
    return { d: vals.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' '), pts: vals.map((v, i) => [X(i), Y(v)]), Y };
}
