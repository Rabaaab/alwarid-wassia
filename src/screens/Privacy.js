'use client';
import { Fragment } from 'react';
import { useStoreState } from '@/lib/platformStore';
import styles from './Privacy.module.css';
import SmartLink from '@/components/ui/SmartLink';



function renderVals() {
    const base = { alaoui: 'notes', tazi: 'notes', fassi: 'notes', zniber: 'nom', sbai: 'hidden' };
    const lv = Object.assign({}, base, (this.state && this.state.lv) || {});
    const docs = [
      { id: 'alaoui', init: 'MA', photo: '/ui/doctor-avatar.jpg', grad: 'linear-gradient(135deg,#2a7de1,#1c5fb2)', name: 'Dr. Mounir Alaoui', spec: 'Neurologue, mémoire', sensitive: false },
      { id: 'tazi', init: 'KT', photo: '/ui/doc-tazi.jpg', grad: 'linear-gradient(135deg,#a9daf3,#2182b1)', name: 'Dr. Karim Tazi', spec: 'Diabétologue', sensitive: false },
      { id: 'fassi', init: 'SF', photo: '/ui/doc-fassi.jpg', grad: 'linear-gradient(135deg,#7ec7ec,#196185)', name: 'Dr. Samira Fassi', spec: 'Cardiologue', sensitive: false },
      { id: 'zniber', init: 'NZ', photo: '/ui/doc-zniber.jpg', grad: 'linear-gradient(135deg,#22d3ee,#0e7490)', name: 'Dr. Nadia Zniber', spec: 'Médecin traitant', sensitive: false },
      { id: 'sbai', init: 'HS', photo: '/ui/doc-sbai.jpg', grad: 'linear-gradient(135deg,#94a3b8,#475569)', name: 'Dr. Houda Sbai', spec: 'Gynécologue', sensitive: true }
    ];
    const opts = [{ k: 'nom', l: 'Nom' }, { k: 'notes', l: 'Notes' }, { k: 'hidden', l: 'Masqué' }];
    const rows = docs.map((d) => ({
      init: d.init, photo: d.photo, grad: d.grad, name: d.name, spec: d.spec, sensitive: d.sensitive,
      seg: opts.map((o) => {
        const on = lv[d.id] === o.k;
        const blocked = d.sensitive && o.k === 'notes';
        return {
          label: o.l,
          bg: on ? (o.k === 'hidden' ? '#0f172a' : 'linear-gradient(135deg,#2a7de1,#1c5fb2)') : 'transparent',
          color: on ? '#ffffff' : '#334155',
          op: blocked ? 0.45 : 1,
          pick: () => {
            if (blocked) { return; }
            const patch = {};
            patch[d.id] = o.k;
            this.setState({ lv: Object.assign({}, lv, patch) });
          }
        };
      })
    }));
    return { rows: rows };
  }

export default function Privacy() {
  const [st, setStoreState] = useStoreState('privacy');
  const ctx = { state: st, setState: setStoreState };
  const v = renderVals.call(ctx);
  return (
    <div style={{ width: "390px", height: "1200px", boxSizing: "border-box", overflow: "hidden", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#0f172a", background: "radial-gradient(500px 260px at -10% -6%,rgba(125,189,244,0.6),transparent 70%),radial-gradient(420px 240px at 110% 14%,rgba(186,215,252,0.75),transparent 72%),linear-gradient(180deg,#d3e7fb 0%,#eaf4fd 30%,#f7fbff 100%)", padding: "18px 18px 24px", display: "flex", flexDirection: "column", gap: "14px" }} className={`${styles["root"]}`}><div style={{ display: "flex", alignItems: "center", gap: "12px" }}><SmartLink href={"/patient"} aria-label={"Retour"} style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 22px -12px rgba(28,95,178,0.5)" }}><svg aria-hidden={"true"} width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#0f172a"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M15 6l-6 6 6 6"} /></svg></SmartLink><img src={"/ui/logo-wide.png"} alt={"Alwarid"} style={{ height: "26px", width: "auto", marginLeft: "auto" }} /></div><div className={`${styles["rise"]}`}><div style={{ fontSize: "34px", fontWeight: "800", letterSpacing: "-0.035em", lineHeight: "1.04" }}>Qui voit mon dossier</div><div style={{ fontSize: "15px", color: "#334155", lineHeight: "1.5", marginTop: "8px" }}>Vous décidez, médecin par médecin, ce que les autres médecins de votre équipe peuvent voir.</div></div><div className={`${styles["card"]}`} style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#334155", lineHeight: "1.4" }}><div ><b style={{ color: "#0f172a" }}>Nom</b> : son nom, sa spécialité et son établissement</div><div ><b style={{ color: "#0f172a" }}>Notes</b> : ses notes et ses résultats en plus</div><div ><b style={{ color: "#0f172a" }}>Masqué</b> : invisible pour les autres médecins</div></div><div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{(v.rows || []).map((d, index) => (<Fragment key={index}><div className={`${styles["card"]}`}><div style={{ display: "flex", alignItems: "center", gap: "12px" }}><img src={(d.photo)} alt={(d.name)} style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flex: "none", border: "2px solid #ffffff", boxShadow: "0 8px 18px -8px rgba(28,95,178,0.5)" }} /><div style={{ flex: "1", minWidth: "0" }}><div style={{ fontWeight: "800", fontSize: "16px", letterSpacing: "-0.01em" }}>{d.name}</div><div style={{ fontSize: "13px", color: "#475569" }}>{d.spec}</div></div>{(d.sensitive) && (<><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "700", background: "#fffbeb", color: "#b45309", borderRadius: "999px", padding: "5px 10px" }}><svg aria-hidden={"true"} width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#b45309"} strokeWidth={"2.4"} strokeLinecap={"round"} strokeLinejoin={"round"}><rect x={"4"} y={"11"} width={"16"} height={"10"} rx={"3"} /><path d={"M8 11V8a4 4 0 0 1 8 0v3"} /></svg>Protégé</span></>)}</div><div className={`${styles["sg"]}`} style={{ display: "flex", gap: "4px", background: "#eef5fc", borderRadius: "999px", padding: "4px", marginTop: "12px" }}>{(d.seg || []).map((s, index) => (<Fragment key={index}><button onClick={(s.pick)} style={{ background: (s.bg), color: (s.color), opacity: (s.op) }}>{s.label}</button></Fragment>))}</div>{(d.sensitive) && (<><div style={{ fontSize: "12px", color: "#b45309", fontWeight: "600", marginTop: "10px", lineHeight: "1.4" }}>Spécialité sensible: masquée par défaut. Pour partager les notes, confirmez avec votre code.</div></>)}</div></Fragment>))}</div><SmartLink href={"/patient/access"} className={`${styles["card"]}`} style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", marginTop: "2px" }}><div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><svg aria-hidden={"true"} width={"24"} height={"24"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1c5fb2"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><circle cx={"12"} cy={"12"} r={"9"} /><path d={"M12 7v5l3 2"} /></svg></div><div style={{ flex: "1", minWidth: "0" }}><div style={{ fontWeight: "800", fontSize: "16px" }}>{"Journal d'accès"}</div><div style={{ fontSize: "13px", color: "#475569" }}>Voir qui a consulté mon dossier</div></div><span style={{ fontSize: "12px", fontWeight: "700", background: "#fef2f2", color: "#b91c1c", borderRadius: "999px", padding: "5px 10px" }}>1 demande</span></SmartLink><div style={{ fontSize: "12px", color: "#475569", textAlign: "center" }}>Données de démonstration.</div></div>
  );
}
