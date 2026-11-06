'use client';
import { Fragment } from 'react';
import { useStoreState } from '@/lib/platformStore';
import styles from './AccessLog.module.css';
import SmartLink from '@/components/ui/SmartLink';



function renderVals() {
    const asked = !!(this.state && this.state.asked);
    const resp = (this.state && this.state.resp) || 'none';
    const blue = 'linear-gradient(135deg,#2a7de1,#1c5fb2)';
    const PH = { 'Dr. Mounir Alaoui': '/ui/doctor-avatar.jpg', 'Dr. Samira Fassi': '/ui/doc-fassi.jpg' };
    const row = (who, init, grad, text, time, tag, tagBg, tagColor) => ({ photo: PH[who] || '', hasPhoto: !!PH[who], noPhoto: !PH[who], isDay: false, isRow: true, day: '', who: who, init: init, grad: grad, text: text, time: time, hasTag: !!tag, tag: tag || '', tagBg: tagBg || '', tagColor: tagColor || '' });
    const day = (d) => ({ photo: '', hasPhoto: false, noPhoto: false, isDay: true, isRow: false, day: d, who: '', init: '', grad: '', text: '', time: '', hasTag: false, tag: '', tagBg: '', tagColor: '' });
    const items = [
      day('Aujourd\'hui'),
      row('Dr. Mounir Alaoui', 'MA', blue, 'a consulté votre rapport mémoire', '09:12'),
      row('Dr. Mounir Alaoui', 'MA', blue, 'a ouvert votre dossier', '09:10'),
      day('Hier'),
      row('Dr. Samira Fassi', 'SF', 'linear-gradient(135deg,#7ec7ec,#196185)', 'a consulté votre ECG de 2024', '16:40'),
      row('Laboratoire Central', 'LC', 'linear-gradient(135deg,#4ab7ea,#1c5fb2)', 'a déposé 3 résultats d\'analyses', '15:05', 'Ajout', '#f0fdf4', '#166534'),
      row('Dr. Mounir Alaoui', 'MA', blue, 'a demandé l\'accès à un suivi protégé', '11:20', 'Bloqué par vos règles', '#fef2f2', '#b91c1c')
    ];
    return {
      items: items,
      asked: asked,
      noReq: !asked,
      pending: resp === 'none',
      allowed: resp === 'allowed',
      refused: resp === 'refused',
      reqLabel: resp === 'none' ? 'DEMANDE D\'ACCÈS' : resp === 'allowed' ? 'DEMANDE ACCEPTÉE' : 'DEMANDE REFUSÉE',
      reqBorder: resp === 'none' ? '#fecaca' : resp === 'allowed' ? '#bbf7d0' : '#e2e8f0',
      dot: resp === 'none' ? '#dc2626' : resp === 'allowed' ? '#16a34a' : '#94a3b8',
      pulse: resp === 'none' ? 'pd' : '',
      allow: () => this.setState({ resp: 'allowed' }),
      refuse: () => this.setState({ resp: 'refused' }),
      undo: () => this.setState({ resp: 'none' }),
      reset: () => this.setState({ asked: false, resp: 'none' })
    };
  }

export default function AccessLog() {
  const [st, setStoreState] = useStoreState('access');
  const ctx = { state: st, setState: setStoreState };
  const v = renderVals.call(ctx);
  return (
    <div style={{ width: "390px", height: "1180px", boxSizing: "border-box", overflow: "hidden", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#0f172a", background: "radial-gradient(500px 260px at -10% -6%,rgba(125,189,244,0.6),transparent 70%),radial-gradient(420px 240px at 110% 14%,rgba(186,215,252,0.75),transparent 72%),linear-gradient(180deg,#d3e7fb 0%,#eaf4fd 30%,#f7fbff 100%)", padding: "18px 18px 24px", display: "flex", flexDirection: "column", gap: "14px" }} className={`${styles["root"]}`}><div style={{ display: "flex", alignItems: "center", gap: "12px" }}><SmartLink href={"/patient/privacy"} aria-label={"Retour"} style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 22px -12px rgba(28,95,178,0.5)" }}><svg aria-hidden={"true"} width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#0f172a"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M15 6l-6 6 6 6"} /></svg></SmartLink><img src={"/ui/logo-wide.png"} alt={"Alwarid"} style={{ height: "26px", width: "auto", marginLeft: "auto" }} /></div><div className={`${styles["rise"]}`}><div style={{ fontSize: "34px", fontWeight: "800", letterSpacing: "-0.035em", lineHeight: "1.04" }}>{"Journal d'accès"}</div><div style={{ fontSize: "15px", color: "#334155", lineHeight: "1.5", marginTop: "8px" }}>Chaque consultation de votre dossier est enregistrée. Vous voyez qui, quand et quoi.</div></div>{(v.asked) && (<><div className={`${styles["card"]} ${styles["rise"]}`} style={{ border: `2px solid ${v.reqBorder}`, animationDelay: "80ms" }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span className={v.pulse ? styles['pd'] : undefined} style={{ width: "12px", height: "12px", borderRadius: "50%", background: (v.dot), flex: "none" }} /><span style={{ fontSize: "13px", fontWeight: "700", color: "#475569", letterSpacing: "0.04em" }}>{v.reqLabel}</span></div><div style={{ fontSize: "17px", fontWeight: "800", letterSpacing: "-0.01em", lineHeight: "1.3", marginTop: "10px" }}>Le Dr. Mounir Alaoui, neurologue, souhaite voir votre suivi de gynécologie.</div><div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5", marginTop: "6px" }}>Raison indiquée: mieux comprendre vos traitements. Cette spécialité est protégée.</div>{(v.pending) && (<><div style={{ display: "flex", gap: "10px", marginTop: "14px" }}><button onClick={(v.allow)} style={{ flex: "1.4", minHeight: "52px", border: "none", borderRadius: "18px", background: "linear-gradient(135deg,#2a7de1,#1c5fb2)", color: "#ffffff", fontSize: "15px", fontWeight: "700", boxShadow: "0 14px 28px -12px rgba(28,95,178,0.6)" }}>Autoriser avec mon code</button><button onClick={(v.refuse)} style={{ flex: "1", minHeight: "52px", border: "1px solid #bfdbfe", borderRadius: "18px", background: "#ffffff", color: "#1c5fb2", fontSize: "15px", fontWeight: "700" }}>Refuser</button></div></>)}{(v.allowed) && (<><div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}><span className={`${styles["tag"]}`} style={{ background: "#f0fdf4", color: "#166534", fontSize: "13px", padding: "7px 14px" }}>Autorisé pour une durée limitée</span><button onClick={(v.undo)} style={{ minHeight: "44px", border: "none", background: "transparent", color: "#1c5fb2", fontSize: "14px", fontWeight: "700", textDecoration: "underline" }}>Annuler</button></div></>)}{(v.refused) && (<><div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}><span className={`${styles["tag"]}`} style={{ background: "#f1f5f9", color: "#475569", fontSize: "13px", padding: "7px 14px" }}>Refusé, le médecin est prévenu</span><button onClick={(v.undo)} style={{ minHeight: "44px", border: "none", background: "transparent", color: "#1c5fb2", fontSize: "14px", fontWeight: "700", textDecoration: "underline" }}>Annuler</button></div></>)}</div></>)}{(v.noReq) && (<div className={`${styles["card"]} ${styles["rise"]}`} style={{ animationDelay: "80ms", fontSize: "15px", color: "#475569", lineHeight: "1.5" }}>{"Aucune demande d'accès en attente. Si un médecin demande l'accès à un suivi protégé, vous la verrez ici."}</div>)}<div style={{ display: "flex", gap: "8px" }}><button style={{ minHeight: "44px", padding: "0 18px", border: "none", borderRadius: "999px", background: "#0f172a", color: "#ffffff", fontSize: "14px", fontWeight: "700" }}>Tous</button><button style={{ minHeight: "44px", padding: "0 18px", border: "1px solid #cfe0f2", borderRadius: "999px", background: "#ffffff", color: "#334155", fontSize: "14px", fontWeight: "700" }}>Médecins</button><button style={{ minHeight: "44px", padding: "0 18px", border: "1px solid #cfe0f2", borderRadius: "999px", background: "#ffffff", color: "#334155", fontSize: "14px", fontWeight: "700" }}>Laboratoires</button></div><div className={`${styles["card"]}`} style={{ padding: "8px 14px", display: "flex", flexDirection: "column" }}>{(v.items || []).map((it, index) => (<Fragment key={index}><div >{(it.isDay) && (<><div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", padding: "14px 0 6px" }}>{it.day}</div></>)}{(it.isRow) && (<><div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 0", borderTop: "1px solid #eef3f9" }}>{(it.hasPhoto) && (<><img src={(it.photo)} alt={(it.who)} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flex: "none" }} /></>)}{(it.noPhoto) && (<><div style={{ width: "44px", height: "44px", borderRadius: "50%", background: (it.grad), color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", flex: "none" }}>{it.init}</div></>)}<div style={{ flex: "1", minWidth: "0" }}><div style={{ fontSize: "15px", fontWeight: "700", lineHeight: "1.3" }}>{it.who}</div><div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.4", marginTop: "1px" }}>{it.text}</div>{(it.hasTag) && (<><span className={`${styles["tag"]}`} style={{ display: "inline-block", marginTop: "6px", background: (it.tagBg), color: (it.tagColor) }}>{it.tag}</span></>)}</div><div style={{ fontSize: "13px", color: "#475569", fontWeight: "600", whiteSpace: "nowrap" }}>{it.time}</div></div></>)}</div></Fragment>))}</div><div style={{ fontSize: "12px", color: "#475569", textAlign: "center" }}>Données de démonstration.</div></div>
  );
}
