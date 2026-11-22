// deterministic pseudo random
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function g(x, mu, sg, a) { return a * Math.exp(-((x - mu) * (x - mu)) / (2 * sg * sg)); }
// build an ECG trace. beats: array of {len, kind} where kind = 'n' normal or 'v' abnormal (no P, wide, tall, inverted T)
function ecgPoints(w, h, beats, opts) {
  opts = opts || {}; const r = rng(opts.seed || 3);
  const base = h * (opts.base || 0.62), amp = h * (opts.amp || 0.5);
  const total = beats.reduce((a, b) => a + b.len, 0), k = w / total;
  const pts = []; let x0 = 0, marks = [];
  for (const b of beats) {
    const L = b.len;
    if (b.kind === 'v') marks.push([x0 * k, (x0 + L) * k]);
    for (let i = 0; i < L; i++) {
      const t = i / L; let v = 0;
      if (b.kind === 'n') {
        v += g(t, .16, .035, .10) + g(t, .335, .012, -.09) + g(t, .37, .012, 1.0) + g(t, .405, .014, -.2) + g(t, .64, .06, .20);
      } else {
        v += g(t, .30, .03, -.12) + g(t, .40, .035, 1.15) + g(t, .47, .03, -.55) + g(t, .70, .07, -.28);
      }
      v += (r() - .5) * (opts.noise || .012);
      pts.push([(x0 + i) * k, base - v * amp]);
    }
    x0 += L;
  }
  return { pts, marks };
}
function pathOf(p) { return p.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' '); }
// draw a lead inside an <svg>; abnormal beats get a red highlight band when ai=true
function drawLead(svg, beats, o) {
  o = o || {}; const w = +svg.getAttribute('width'), h = +svg.getAttribute('height');
  const { pts, marks } = ecgPoints(w, h, beats, o);
  let s = '';
  if (o.ai) for (const m of marks) {
    const id = 'gr' + Math.floor(Math.random() * 1e6);
    s += `<defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#FF4D4D" stop-opacity="0"/><stop offset=".25" stop-color="#FF4D4D" stop-opacity=".42"/><stop offset=".75" stop-color="#FF4D4D" stop-opacity=".42"/><stop offset="1" stop-color="#FF4D4D" stop-opacity="0"/></linearGradient></defs><rect x="${m[0] - 6}" y="0" width="${m[1] - m[0] + 12}" height="${h}" fill="url(#${id})"/>`;
  }
  s += `<path d="${pathOf(pts)}" fill="none" stroke="${o.color || '#3BE58E'}" stroke-width="${o.sw || 2}" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (o.ai) for (const m of marks) {
    const seg = pts.filter(q => q[0] >= m[0] && q[0] <= m[1]);
    s += `<path d="${pathOf(seg)}" fill="none" stroke="#FF6B5E" stroke-width="${(o.sw || 2) + 1}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  svg.innerHTML = s;
}
function drawWave(svg, kind, color, seed) {
  const w = +svg.getAttribute('width'), h = +svg.getAttribute('height'); const r = rng(seed || 5); let d = '';
  for (let x = 0; x <= w; x += 2) {
    let y;
    if (kind === 'pleth') { const t = (x / (w / 3)) % 1; y = h * 0.8 - h * 0.62 * (g(t, .25, .09, 1) + g(t, .5, .08, .28)); }
    else { y = h / 2 + Math.sin(x / (w / 2.2) * Math.PI * 2) * h * 0.32; }
    d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
  }
  svg.innerHTML = `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
}
