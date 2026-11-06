'use client';
import { Fragment, useState } from 'react';
import styles from './Labs.module.css';
import SmartLink from '@/components/ui/SmartLink';
import DoctorHeader from '@/components/shell/DoctorHeader';



function renderVals() {
    const sel = (this.state && this.state.lab) || 'all';
    const fr = (n, d) => n.toFixed(d).replace('.', ',');
    const sg = (n, d) => (n >= 0 ? '+ ' : '− ') + fr(Math.abs(n), d);
    const defs = [
      { name: 'Glycémie à jeun', date: '22 mars 2026', val: 1.18, d: 2, unit: 'g/L', lo: 0.7, hi: 1.1, prev: 1.32, prevDate: 'nov. 2025', series: [1.32, 1.28, 1.22, 1.18], lab: 'labomed', note: '' },
      { name: 'HbA1c', date: '22 mars 2026', val: 7.8, d: 1, unit: '%', lo: 4.0, hi: 5.6, prev: 8.1, prevDate: 'juil. 2025', series: [8.4, 8.1, 7.9, 7.8], lab: 'labomed', note: '' },
      { name: 'Ferritine', date: '22 mars 2026', val: 48, d: 0, unit: 'ng/mL', lo: 30, hi: 400, prev: 31, prevDate: 'mars 2025', series: [24, 31, 40, 48], lab: 'labomed', note: '' },
      { name: 'LDL cholestérol', date: '8 janv. 2026', val: 1.8, d: 1, unit: 'g/L', lo: 0.8, hi: 1.6, prev: 1.9, prevDate: 'juil. 2025', series: [2.0, 1.9, 1.9, 1.8], lab: 'central', note: '', rangeTxt: 'Moins de 1,6' },
      { name: 'Créatinine', date: '8 janv. 2026', val: 12, d: 0, unit: 'mg/L', lo: 7, hi: 13, prev: 11, prevDate: 'juil. 2025', series: [10, 11, 11, 12], lab: 'central', note: '' },
      { name: 'Vitamine B12', date: '8 janv. 2026', val: 310, d: 0, unit: 'pg/mL', lo: 200, hi: 900, prev: 355, prevDate: 'juil. 2025', series: [420, 380, 355, 310], lab: 'central', note: 'Normale mais en baisse régulière' }
    ];
    const labs = { labomed: { name: 'Labomed Fès', init: 'LM', color: '#0e7490' }, central: { name: 'Laboratoire Central', init: 'LC', color: '#1c5fb2' } };
    const clamp = (v) => Math.max(3, Math.min(97, v));
    const rows = defs.filter((r) => sel === 'all' || r.lab === sel).map((r) => {
      const span = r.hi - r.lo;
      const aMin = r.lo - span * 0.5;
      const aMax = r.hi + span * 0.5;
      const pct = (v) => ((v - aMin) / (aMax - aMin)) * 100;
      const high = r.val > r.hi;
      const low = r.val < r.lo;
      const mn = Math.min.apply(null, r.series);
      const mx = Math.max.apply(null, r.series);
      const pts = r.series.map((v, i) => {
        const x = 6 + i * (92 / (r.series.length - 1));
        const y = 30 - ((v - mn) / ((mx - mn) || 1)) * 24;
        return [x, y];
      });
      const last = pts[pts.length - 1];
      return {
        name: r.name, date: r.date, val: fr(r.val, r.d), unit: r.unit,
        flag: high ? 'Élevé' : low ? 'Bas' : 'Normal',
        flagBg: high ? '#fef2f2' : low ? '#fffbeb' : '#f0fdf4',
        flagColor: high ? '#b91c1c' : low ? '#b45309' : '#166534',
        zoneL: clamp(pct(r.lo)) + '%', zoneW: (clamp(pct(r.hi)) - clamp(pct(r.lo))) + '%',
        pos: clamp(pct(r.val)) + '%', mark: high ? '#dc2626' : low ? '#d97706' : '#16a34a',
        range: r.rangeTxt ? r.rangeTxt + ' ' + r.unit : fr(r.lo, r.d) + ' à ' + fr(r.hi, r.d) + ' ' + r.unit,
        prev: fr(r.prev, r.d), prevDate: r.prevDate, delta: sg(r.val - r.prev, r.d),
        spark: pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), lx: last[0].toFixed(1), ly: last[1].toFixed(1),
        lab: labs[r.lab].name, labInit: labs[r.lab].init, labColor: labs[r.lab].color,
        hasNote: !!r.note, note: r.note
      };
    });
    const count = (k) => defs.filter((r) => k === 'all' || r.lab === k).length;
    const mk = (k, label) => ({
      label: label + ' (' + count(k) + ')',
      bg: sel === k ? 'linear-gradient(135deg,#2a7de1,#1c5fb2)' : '#ffffff',
      color: sel === k ? '#ffffff' : '#1c5fb2',
      border: sel === k ? 'transparent' : '#d4e6f7',
      pick: () => this.setState({ lab: k })
    });
    const out = defs.filter((r) => r.val > r.hi || r.val < r.lo).length;
    return {
      rows: rows,
      chips: [mk('all', 'Tous'), mk('labomed', 'Labomed Fès'), mk('central', 'Laboratoire Central')],
      summary: defs.length + ' résultats de 2 laboratoires. ' + out + ' hors des valeurs normales.'
    };
  }

export default function Labs() {
  const [st, setSt] = useState({});
  const ctx = { state: st, setState: (o) => setSt((s) => ({ ...s, ...(typeof o === 'function' ? o(s) : o) })) };
  const v = renderVals.call(ctx);
  return (
    <div style={{ minHeight: "1100px", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#0f172a", background: "radial-gradient(900px 500px at 12% 0%,rgba(125,189,244,0.55),transparent 70%),radial-gradient(800px 480px at 100% 14%,rgba(186,215,252,0.7),transparent 70%),linear-gradient(180deg,#d3e7fb 0%,#eaf4fd 36%,#f7fbff 100%)", padding: "24px 32px 40px" }} className={`${styles["root"]}`}><div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}> <DoctorHeader active="Patients" /> <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}><div style={{ display: "flex", alignItems: "center", gap: "18px" }}><div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "linear-gradient(135deg,#4ab7ea,#1b79a7)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "22px", boxShadow: "0 14px 28px -12px rgba(28,95,178,0.7)" }}>YK</div><div ><div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}><span style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "-0.035em", lineHeight: "1.05" }}>Youssef Kacimi</span><span className={`${styles["tag"]}`} style={{ background: "#e6f1fb", color: "#196185", border: "1px solid #bfdbfe" }}>Suivi mémoire</span></div><div style={{ fontSize: "15px", color: "#475569", marginTop: "4px" }}>58 ans, groupe A+, PAT-2024-00147</div></div></div><nav aria-label={"Sections du dossier"} className={`${styles["glass"]} ${styles["tabs"]}`} style={{ display: "flex", gap: "2px", borderRadius: "999px", padding: "4px", flexWrap: "wrap" }}><SmartLink href={"/doctor/patient"}>Aperçu</SmartLink><SmartLink href={"/doctor/patient/team"}>Équipe de soins</SmartLink><SmartLink className={`${styles["on"]}`} href={"/doctor/patient/labs"}>Analyses</SmartLink></nav></div><div className={`${styles["rise"]}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(380px,100%),1fr))", gap: "20px" }}><div style={{ background: "#ffffff", borderRadius: "32px", padding: "22px", boxShadow: "0 26px 50px -32px rgba(28,95,178,0.4)", display: "flex", alignItems: "center", gap: "18px" }}><div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg,#22d3ee,#0e7490)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "20px", flex: "none" }}>LM</div><div style={{ flex: "1", minWidth: "0" }}><div style={{ fontWeight: "800", fontSize: "19px", letterSpacing: "-0.02em" }}>Labomed Fès</div><div style={{ fontSize: "14px", color: "#475569", marginTop: "2px" }}>Responsable: Dr. Amal Berrada, biologiste</div><span className={`${styles["tag"]}`} style={{ display: "inline-block", marginTop: "8px", background: "#e6f1fb", color: "#196185" }}>Prescrit par Dr. Tazi</span></div></div><div style={{ background: "#ffffff", borderRadius: "32px", padding: "22px", boxShadow: "0 26px 50px -32px rgba(28,95,178,0.4)", display: "flex", alignItems: "center", gap: "18px" }}><div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg,#4ab7ea,#1c5fb2)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "20px", flex: "none" }}>LC</div><div style={{ flex: "1", minWidth: "0" }}><div style={{ fontWeight: "800", fontSize: "19px", letterSpacing: "-0.02em" }}>Laboratoire Central, Fès</div><div style={{ fontSize: "14px", color: "#475569", marginTop: "2px" }}>Responsable: Dr. Omar Sebti, biologiste</div><span className={`${styles["tag"]}`} style={{ display: "inline-block", marginTop: "8px", background: "#e6f1fb", color: "#196185" }}>Prescrit par Dr. Zniber</span></div></div></div><div className={`${styles["rise"]}`} style={{ background: "#ffffff", borderRadius: "40px", padding: "28px 30px 20px", boxShadow: "0 30px 60px -36px rgba(28,95,178,0.45)", animationDelay: "100ms" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}><div ><h1 style={{ margin: "0", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.035em", lineHeight: "1.1" }}>Analyses</h1><div style={{ fontSize: "16px", color: "#475569", marginTop: "6px" }}>{v.summary}</div></div><div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{(v.chips || []).map((c, index) => (<Fragment key={index}><button className={`${styles["fchip"]}`} onClick={(c.pick)} style={{ background: (c.bg), color: (c.color), borderColor: (c.border) }}>{c.label}</button></Fragment>))}</div></div><div style={{ overflowX: "auto" }}><div style={{ minWidth: "1000px" }}><div className={`${styles["rw"]}`} style={{ borderTop: "none", paddingTop: "0", paddingBottom: "10px", fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569" }}><span >Analyse</span><span >Résultat</span><span >Plage normale</span><span >Précédent</span><span >Évolution</span><span >Laboratoire</span></div>{(v.rows || []).map((r, index) => (<Fragment key={index}><div className={`${styles["rw"]}`}><div ><div style={{ fontWeight: "800", fontSize: "17px", letterSpacing: "-0.01em" }}>{r.name}</div><div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>{r.date}</div>{(r.hasNote) && (<><div style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", marginTop: "4px" }}>{r.note}</div></>)}</div><div ><div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}><span style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.03em" }}>{r.val}</span><span style={{ fontSize: "13px", color: "#475569" }}>{r.unit}</span></div><span className={`${styles["tag"]}`} style={{ display: "inline-block", marginTop: "4px", background: (r.flagBg), color: (r.flagColor) }}>{r.flag}</span></div><div ><div style={{ position: "relative", height: "12px", borderRadius: "6px", background: "#eef3f8", maxWidth: "200px" }}><span style={{ position: "absolute", top: "0", bottom: "0", left: (r.zoneL), width: (r.zoneW), borderRadius: "6px", background: "#bbf7d0" }} /><span style={{ position: "absolute", top: "-4px", left: (r.pos), width: "20px", height: "20px", marginLeft: "-10px", borderRadius: "50%", background: (r.mark), border: "3px solid #ffffff", boxShadow: "0 4px 10px rgba(15,23,42,0.3)", boxSizing: "border-box" }} /></div><div style={{ fontSize: "12px", color: "#475569", marginTop: "10px" }}>{r.range}</div></div><div ><div style={{ fontWeight: "700", fontSize: "16px" }}>{r.prev}{" "}<span style={{ fontSize: "13px", fontWeight: "500", color: "#475569" }}>{r.unit}</span></div><div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>{r.prevDate}</div><span className={`${styles["tag"]}`} style={{ display: "inline-block", marginTop: "4px", background: "#e6f1fb", color: "#196185" }}>{r.delta}</span></div><svg role={"img"} aria-label={"Évolution des quatre derniers résultats"} width={"104"} height={"36"} viewBox={"0 0 104 36"}><polyline points={(r.spark)} fill={"none"} stroke={"#2a7de1"} strokeWidth={"3"} strokeLinecap={"round"} strokeLinejoin={"round"} /><circle cx={(r.lx)} cy={(r.ly)} r={"5"} fill={"#2a7de1"} /></svg><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ width: "34px", height: "34px", borderRadius: "11px", background: (r.labColor), color: "#ffffff", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{r.labInit}</span><span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>{r.lab}</span></div></div></Fragment>))}</div></div><div style={{ fontSize: "12px", color: "#475569", marginTop: "14px" }}>Valeurs de démonstration. Le médecin interprète chaque résultat. Les laboratoires partenaires enverront leurs résultats directement dans le dossier.</div></div><div style={{ fontSize: "12px", color: "#475569", textAlign: "center" }}>Aide à la décision. La décision finale revient au médecin. Données de démonstration.</div></div></div>
  );
}
