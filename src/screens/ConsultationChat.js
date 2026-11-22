'use client';
import { useEffect, useRef, useState } from 'react';
import DoctorHeader from '@/components/shell/DoctorHeader';
import PatientBar from '@/components/shell/PatientBar';
import SmartLink from '@/components/ui/SmartLink';
import s from './ConsultationChat.module.css';

const MEDS = [
    ['Metformin 1000 mg', 'twice a day'],
    ['Gliclazide 60 mg', 'morning'],
    ['Amlodipine 10 mg', 'once a day'],
    ['Bisoprolol 5 mg', 'morning'],
    ['Atorvastatin 20 mg', 'evening'],
    ['Ibuprofen 400 mg', 'as needed'],
];
const SUGGEST = [
    ['Drug interactions', 'Could this interact with anything Amina takes?'],
    ['Allergies', 'Which allergies should I know about?'],
    ['Summary', 'Give me a short summary of her file.'],
    ['Exams due', 'Which exams are due?'],
];

const IX = [
    { c: '#DC2626', src: 'Critical · VIDAL database', t: 'Amlodipine + Bisoprolol', d: 'Risk of severe bradycardia. Monitor the heart rate.' },
    { c: '#DC2626', src: 'Critical · DrugBank', t: 'Gliclazide + Ramadan fasting', d: 'High risk of hypoglycemia. Adjust the dosing times.' },
    { c: '#D97706', src: 'Warning · VIDAL database', t: 'Ibuprofen + Amlodipine', d: 'Reduces the blood pressure effect. Prefer paracetamol for the knee pain.' },
];

/* Answers come only from the demo patient file. */
function answer(q) {
    const t = q.toLowerCase();
    if (/interact|drug|medic|takes|ibuprofen|treatment/.test(t)) return { kind: 'ix' };
    if (/allerg/.test(t)) return { kind: 'text', html: <><b>Penicillin family (amoxicillin): anaphylaxis.</b> Found in a discharge report from 12 March 2014, page 37 of 52. Also allergic to <b>sulfonamides</b>. Avoid both families.</> };
    if (/summar|file|overview|history/.test(t)) return { kind: 'text', html: <>Amina, 72. <b>Type 2 diabetes</b> since 2016 (HbA1c 7.8%), <b>stage 2 hypertension</b> (155/95), <b>high cholesterol</b>, <b>left knee osteoarthritis</b> grade 2. Atrial fibrillation on today&apos;s ECG. Severe penicillin allergy.</> };
    if (/exam|test|due|lab/.test(t)) return { kind: 'text', html: <>Suggested for the doctor to review: <b>control ECG</b>, <b>HbA1c</b> (last 7.8%, target below 7%), <b>lipid panel</b> and a <b>knee X-ray</b> follow-up.</> };
    return { kind: 'text', html: <>I only answer from Amina&apos;s file. You can ask about her medications, allergies, exams or a summary.</> };
}

function Answer({ a }) {
    if (!a) return <span className={s.typing} aria-label="The assistant is writing"><i /><i /><i /></span>;
    return (
        <>
            {a.kind === 'ix' ? (
                <>
                    Three interactions found in her current treatment:
                    <div className={s.ixList}>
                        {IX.map((x) => (
                            <div key={x.t} className={s.ix} style={{ '--c': x.c }}>
                                <small>{x.src}</small>
                                <b>{x.t}</b>
                                <p>{x.d}</p>
                            </div>
                        ))}
                    </div>
                </>
            ) : a.html}
            <div className={s.note}>Decision support. The doctor decides.</div>
        </>
    );
}

export default function ConsultationChat() {
    const [msgs, setMsgs] = useState(() => [{ q: SUGGEST[0][1], a: answer(SUGGEST[0][1]) }]);
    const [text, setText] = useState('');
    const box = useRef(null);
    const ask = (q) => {
        if (!q.trim()) return;
        const i = msgs.length;
        setMsgs((m) => [...m, { q, a: null }]);
        setTimeout(() => setMsgs((m) => m.map((x, k) => (k === i ? { ...x, a: answer(q) } : x))), 900);
    };
    useEffect(() => {
        if (box.current && msgs.length > 1) box.current.scrollTop = box.current.scrollHeight;
    }, [msgs]);
    const send = () => { ask(text); setText(''); };

    return (
        <div className={s.page}>
            <div className={s.wrap}>
                <DoctorHeader active="Patients" />
                <PatientBar active="consultation" />
                <div className={s.alert}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" aria-hidden="true"><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></svg>
                    <span className={s.kick} style={{ color: '#DC2626' }}>Severe antibiotic allergy</span>
                    <span className={s.alertTitle}>Penicillin family (amoxicillin): anaphylaxis</span>
                    <SmartLink href="/doctor/patient" className={s.ghost}>← Patient 360</SmartLink>
                </div>
                <div className={s.main}>
                    <div className={s.left}>
                        <div className={s.card}>
                            <div className={s.cardHd}><span className={s.kick}>Live conversation</span><span className={`${s.chip} ${s.green}`}>● Listening, with consent</span></div>
                            <div className={s.wave} aria-hidden="true">
                                {Array.from({ length: 64 }, (_, i) => <i key={i} style={{ height: 6 + Math.abs(Math.sin(i * 0.5) * 24) * (0.55 + ((i * 37) % 10) / 16), background: i < 46 ? '#2A7DE1' : '#BFD3EE' }} />)}
                            </div>
                            <div className={`${s.ln} ${s.dr}`}><b>Doctor</b>Does she take anything for the pain in her knee?</div>
                            <div className={`${s.ln} ${s.fm}`}><b>Family</b>Ibuprofen when it hurts, and her pills for pressure and sugar.</div>
                        </div>
                        <div className={s.card}>
                            <span className={s.kick}>Current medications · from her file</span>
                            <div style={{ marginTop: 8 }}>
                                {MEDS.map(([m, d]) => <div key={m} className={s.med}><b>{m}</b><span>{d}</span></div>)}
                            </div>
                        </div>
                    </div>
                    <div className={`${s.card} ${s.chat}`}>
                        <div className={s.chatHd}>
                            <span className={`${s.chip} ${s.violet}`}>AI assistant</span>
                            <span className={s.chatTitle}>Ask anything about Amina&apos;s file</span>
                            <span className={s.chatSub}>Answers only from her own records</span>
                        </div>
                        <div className={s.msgs} ref={box}>
                            {msgs.map((m, i) => (
                                <div key={i}>
                                    <div className={s.q}><div>{m.q}</div></div>
                                    <div className={s.a}>
                                        <div className={s.who}><i>✦</i>AlWarid assistant</div>
                                        <div className={s.txt}><Answer a={m.a} /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={s.chips}>
                            {SUGGEST.map(([l, q]) => <button key={l} type="button" onClick={() => ask(q)}>{l}</button>)}
                        </div>
                        <div className={s.inp}>
                            <label htmlFor="ask" className={s.sr}>Ask a question about Amina&apos;s file</label>
                            <input id="ask" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} placeholder="Ask a question about Amina's file..." autoComplete="off" />
                            <button type="button" onClick={send} aria-label="Send">➤</button>
                        </div>
                    </div>
                </div>
                <div className={s.foot}>Decision support. The final decision belongs to the treating doctor. Demonstration data, fictional patient.</div>
            </div>
        </div>
    );
}
