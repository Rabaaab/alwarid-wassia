'use client';
import { useEffect, useState } from 'react';
import SmartLink from '@/components/ui/SmartLink';
import DoctorHeader from '@/components/shell/DoctorHeader';
import PatientBar from '@/components/shell/PatientBar';
import { Ecg, Wave, Spark, Scan } from '@/components/p360/Visuals';
import { N, V } from '@/components/p360/signals';
import s from './PatientFile.module.css';

const IMG = '/ui/p360/';
const STRIP = [N(60), N(58), V(52), N(62), N(56), N(60)];

/* Body zones: position in % of the body image (patient's left is on the image right). */
const ZONES = {
    brain: { label: 'Brain', x: 50, y: 4.5, color: '#2A9BE0', tone: '#1B7FC0', side: 'r' },
    lungs: { label: 'Lungs', x: 40, y: 23.5, color: '#E02424', tone: '#C21F1F', side: 'l' },
    heart: { label: 'Heart', x: 58.5, y: 25, color: '#E02424', tone: '#C21F1F', side: 'r' },
    metabolism: { label: 'Metabolism', x: 50, y: 37, color: '#E08A12', tone: '#B26A0A', side: 'r' },
    knee: { label: 'Left knee', x: 60, y: 71.5, color: '#22A55A', tone: '#168244', side: 'r' },
};

const ICON = {
    heart: <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M12 21s-7.5-4.6-9.5-9.4C1 7.8 3.6 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.6 0 6.2 3.8 4.7 7.6C19.5 16.4 12 21 12 21z" /></svg>,
    lungs: <svg viewBox="0 0 24 24" fill="none" stroke="#1C5FB2" strokeWidth="2"><path d="M12 3v8M12 11c-1 2-3 3-5 3M12 11c1 2 3 3 5 3" /><path d="M7 8c-3 1-4 6-4 9 0 2 1 3 3 3s3-2 3-5V9M17 8c3 1 4 6 4 9 0 2-1 3-3 3s-3-2-3-5V9" /></svg>,
    brain: <svg viewBox="0 0 24 24" fill="none" stroke="#1B7FC0" strokeWidth="2"><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 0V4a3 3 0 0 0-3 0zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 0" /></svg>,
    drop: <svg viewBox="0 0 24 24" fill="none" stroke="#B26A0A" strokeWidth="2"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" /></svg>,
    bone: <svg viewBox="0 0 24 24" fill="none" stroke="#168244" strokeWidth="2"><path d="M8 4a2 2 0 0 0-3 3 2 2 0 0 0-1 3l10 10a2 2 0 0 0 3 1 2 2 0 0 0 3-3 2 2 0 0 0 1-3L11 5a2 2 0 0 0-3-1z" /></svg>,
    file: <svg viewBox="0 0 24 24" fill="none" stroke="#1C5FB2" strokeWidth="2"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>,
    wave: <svg viewBox="0 0 24 24" fill="none" stroke="#1C5FB2" strokeWidth="2"><path d="M2 12h4l3-7 4 14 3-7h6" /></svg>,
};

const ecgMedia = (h) => <div className={`${s.ecgBox} ${s.grid}`} style={{ height: h }}><Ecg beats={STRIP} seed={7} /></div>;
const xray = (h, box) => <Scan src={IMG + 'thorax_final.png'} alt="Chest X-ray" height={h} pos="top" heat={[8, 50, 30, 40]} box={box ? [7, 46, 33, 46] : null} labels={box} />;

/* Cards shown on the right for each zone. 'all' = what the AI flagged on arrival. */
const CARDS = {
    all: [
        { id: 'ecg', title: 'Heart', icon: ICON.heart, chip: ['AI alert', 'red'], media: () => ecgMedia(84), cap: 'ECG model, last 10 s. The highlight shows the trigger.', open: 'Open ECG' },
        { id: 'xray', title: 'Lungs', icon: ICON.lungs, chip: ['To review', 'amber'], media: () => xray(84, false), cap: 'Chest X-ray model: opacity at the right base.', open: 'Open X-ray' },
    ],
    heart: [
        { id: 'ecg', title: 'ECG · 12 lead', icon: ICON.heart, chip: ['AI · T-MECA', 'violet'], media: () => ecgMedia(130), score: ['Supraventricular beat', 0.93], cap: 'Red band = what triggered the model.', open: 'Open ECG' },
        { id: 'echo', title: 'Echocardiography', icon: ICON.wave, chip: ['Normal', 'green'], media: () => <Scan src={IMG + 'echo.png'} alt="Echocardiography" height={96} />, cap: '5 Jul 2025 · ejection fraction 55%', open: 'Open report' },
    ],
    lungs: [
        { id: 'xray', title: 'Chest X-ray', icon: ICON.lungs, chip: ['AI · lung model', 'violet'], media: () => xray(150, true), score: ['Opacity, right lower zone', 0.87], cap: 'Heat = where the model looked.', open: 'Open X-ray' },
        { id: 'spo2', title: 'Oxygen saturation', icon: ICON.wave, chip: ['Low', 'amber'], media: () => <Spark vals={[97, 97, 96, 96, 95, 94, 94, 93]} lo={90} hi={99} target={94} color="#2A9BE0" />, cap: '93% on room air, falling since 08:00', open: 'Open trend' },
    ],
    brain: [
        { id: 'ct', title: 'Brain CT', icon: ICON.brain, chip: ['AI · reviewed', 'violet'], media: () => <Scan src={IMG + 'brain_ct.png'} alt="Brain CT" height={150} />, cap: '10:31 today · no acute bleeding detected. The doctor confirms.', open: 'Open CT' },
        { id: 'memory', title: 'Memory follow-up', icon: ICON.brain, chip: ['WassIA', 'blue'], media: () => <Spark vals={[62, 60, 61, 57, 55, 52, 50, 46]} lo={40} hi={68} />, cap: 'Weekly speech and memory scores from home.', open: 'Open memory report', href: '/doctor/patient/report' },
    ],
    metabolism: [
        { id: 'hba1c', title: 'HbA1c', icon: ICON.drop, chip: ['Critical', 'red'], media: () => <Spark vals={[6.9, 7.1, 7.2, 7.4, 7.5, 7.8]} lo={6.4} hi={8.2} target={7} color="#DC2626" />, score: ['Last result', '7.8%'], cap: 'Type 2 diabetes since 2016. Target below 7%.', open: 'Open labs', href: '/doctor/patient/labs' },
        { id: 'abdo', title: 'Abdominal ultrasound', icon: ICON.file, chip: ['Normal', 'green'], media: () => <Scan src={IMG + 'abdo_us.png'} alt="Abdominal ultrasound" height={96} />, cap: '2024 · liver and portal vein normal', open: 'Open report' },
    ],
    knee: [
        { id: 'mri', title: 'Knee MRI', icon: ICON.bone, chip: ['AI · joint model', 'violet'], media: () => <Scan src={IMG + 'knee_mri.png'} alt="Knee MRI" height={150} heat={[36, 38, 30, 34]} />, score: ['Osteoarthritis, grade 2', 0.81], cap: 'Heat = narrowed joint space the model used.', open: 'Open MRI' },
        { id: 'pain', title: 'Pain treatment', icon: ICON.file, chip: ['Interaction', 'red'], cap: 'Ibuprofen as needed reduces the effect of amlodipine. Paracetamol preferred.', open: 'Open in consultation', href: '/doctor/mode/consultation' },
    ],
};

/* Large view when the doctor opens an exam. */
const DETAIL = {
    ecg: { title: 'ECG · lead II', zone: 'Heart', big: () => <div className={`${s.ecgBox} ${s.grid}`} style={{ height: 300 }}><Ecg beats={[N(60), N(58), V(52), N(62), N(56), N(60), N(58), N(62)]} seed={9} sw={2.6} /></div>, result: 'Supraventricular ectopic beat · confidence 0.93', why: 'The red band is the part of the signal that triggered the prediction. Model: T-MECA, ResNet18 with multi-spectral attention, Grad-CAM explanation.' },
    xray: { title: 'Chest X-ray · AP', zone: 'Lungs', big: () => <Scan src={IMG + 'thorax_final.png'} alt="Chest X-ray" height={420} fit="contain" heat={[22, 50, 22, 30]} box={[21, 47, 24, 36]} labels />, result: 'Opacity, right lower zone · 0.87', why: 'The heat shows where the lung model looked. Compare with the previous X-ray and the oxygen level before treatment.' },
    echo: { title: 'Echocardiography', zone: 'Heart', big: () => <Scan src={IMG + 'echo.png'} alt="Echocardiography" height={420} fit="contain" />, result: 'Ejection fraction 55% · normal', why: 'Report from 5 July 2025, linked automatically to the heart zone.' },
    ct: { title: 'Brain CT', zone: 'Brain', big: () => <Scan src={IMG + 'brain_ct.png'} alt="Brain CT" height={420} fit="contain" />, result: 'No acute bleeding detected', why: 'The AI review is a reading aid. The doctor confirms every finding.' },
    abdo: { title: 'Abdominal ultrasound', zone: 'Metabolism', big: () => <Scan src={IMG + 'abdo_us.png'} alt="Abdominal ultrasound" height={420} fit="contain" />, result: 'Liver and portal vein normal', why: 'Report from 2024, linked to the metabolism zone.' },
    mri: { title: 'Knee MRI', zone: 'Left knee', big: () => <Scan src={IMG + 'knee_mri.png'} alt="Knee MRI" height={420} fit="contain" heat={[38, 36, 26, 30]} />, result: 'Osteoarthritis, grade 2 · 0.81', why: 'The heat shows the narrowed joint space the model used for its prediction.' },
    spo2: { title: 'Oxygen saturation', zone: 'Lungs', big: () => <div style={{ padding: '20px 10px' }}><Spark vals={[97, 97, 96, 96, 95, 94, 94, 93]} lo={90} hi={99} target={94} color="#2A9BE0" h={220} /></div>, result: '93% on room air', why: 'Falling slowly since 08:00. Below the 94% line.' },
};

function Card({ c, onOpen }) {
    const score = c.score;
    return (
        <div className={s.zc}>
            <div className={s.zt}><span className={s.ic}>{c.icon}</span>{c.title}<span className={`${s.chip} ${s[c.chip[1]]}`}>{c.chip[0]}</span></div>
            {c.media ? <div className={s.media}>{c.media()}</div> : null}
            {score ? (
                <>
                    <div className={s.score}><b>{score[0]}</b><span>{typeof score[1] === 'number' ? score[1].toFixed(2) : score[1]}</span></div>
                    {typeof score[1] === 'number' ? <div className={s.bar}><i style={{ width: `${score[1] * 100}%` }} /></div> : null}
                </>
            ) : null}
            <div className={s.cap}>{c.cap}</div>
            {c.href ? (
                <SmartLink href={c.href} className={s.open}>{c.open} →</SmartLink>
            ) : (
                <button type="button" className={s.open} onClick={() => onOpen(c.id)}>{c.open} →</button>
            )}
        </div>
    );
}

function Detail({ id, onClose }) {
    const d = DETAIL[id];
    if (!d) return null;
    return (
        <div role="dialog" aria-modal="true" aria-label={d.title} className={s.modalBg} onClick={onClose}>
            <div className={s.modal} onClick={(e) => e.stopPropagation()}>
                <div className={s.mHead}>
                    <div>
                        <div className={s.kick}>{d.zone}</div>
                        <div className={s.mTitle}>{d.title}</div>
                    </div>
                    <button type="button" className={s.ghost} onClick={onClose}>Close</button>
                </div>
                <div className={s.mMedia}>{d.big()}</div>
                <div className={s.mResult}><span className={`${s.chip} ${s.violet}`}>Explainable AI</span><b>{d.result}</b></div>
                <div className={s.mWhy}>{d.why}</div>
                <div className={s.mFoot}>
                    <span>Decision support. The doctor always decides.</span>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button type="button" className={s.ghost} onClick={onClose}>Doctor validates</button>
                        <SmartLink href="/doctor/mode/consultation" className={s.primary}>Discuss in consultation →</SmartLink>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PatientFile() {
    const [zone, setZone] = useState('all');
    const [open, setOpen] = useState(null);
    const [found, setFound] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setFound(true), 1600);
        return () => clearTimeout(t);
    }, []);
    const cards = CARDS[zone] || CARDS.all;

    return (
        <div className={s.page}>
            <div className={s.wrap}>
                <DoctorHeader active="Patients" />
                <PatientBar active="dossier" />

                <div className={`${s.alert} ${found ? s.found : ''}`} aria-live="polite">
                    {found ? (
                        <>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" aria-hidden="true"><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></svg>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className={s.kick} style={{ color: '#DC2626' }}>Severe antibiotic allergy · read this first</div>
                                <div className={s.alertTitle}>Penicillin family (amoxicillin): anaphylaxis</div>
                                <div className={s.alertSub}>Found in an old report: discharge report, 12 March 2014, page 37 of 52</div>
                            </div>
                            <SmartLink href="/doctor/mode/consultation" className={s.primary}>Consultation →</SmartLink>
                        </>
                    ) : (
                        <>
                            <span className={s.spin} aria-hidden="true" />
                            <div className={s.kick}>Critical alerts</div>
                            <div className={s.alertSub} style={{ fontSize: 15, fontWeight: 600 }}>Reading 12 years of records...</div>
                        </>
                    )}
                </div>

                <div className={s.main}>
                    <div className={s.left}>
                        <div className={s.mon}>
                            <div className={s.monHd}><span className={s.live} />EMERGENCY · BAY 4<span className={s.monTime}>25 mm/s · live</span></div>
                            <div className={s.row}>
                                <div className={`${s.wbox} ${s.grid}`} style={{ height: 140 }}><span className={s.wlab}>ECG II</span><Ecg beats={[N(64), N(60), V(56), N(66), N(58), N(62)]} seed={11} amp={0.6} base={0.64} /></div>
                                <div className={s.read}><div className={s.rk} style={{ color: '#3BE58E' }}>HR <span>bpm</span></div><div className={s.rv} style={{ color: '#3BE58E', fontSize: 'clamp(40px,4.2vw,62px)' }}>104</div><div className={s.rs}>Irregular rhythm</div></div>
                            </div>
                            <div className={s.row}>
                                <div className={`${s.wbox} ${s.grid}`} style={{ height: 84 }}><span className={s.wlab}>PLETH</span><Wave kind="pleth" color="#45D2FF" /></div>
                                <div className={s.read}><div className={s.rk} style={{ color: '#45D2FF' }}>SpO₂ <span>%</span></div><div className={s.rv} style={{ color: '#45D2FF' }}>93</div><div className={s.rs}>Room air</div></div>
                            </div>
                            <div className={s.row}>
                                <div className={`${s.wbox} ${s.grid}`} style={{ height: 76 }}><span className={s.wlab} style={{ color: '#FFD84A' }}>RESP</span><Wave kind="resp" color="#FFD84A" /></div>
                                <div className={s.read}><div className={s.rk} style={{ color: '#FFD84A' }}>RR <span>/min</span></div><div className={s.rv} style={{ color: '#FFD84A' }}>22</div><div className={s.rs}>Fast breathing</div></div>
                            </div>
                        </div>
                        <div className={s.xai}>
                            <div className={s.xaiTop}>
                                <span className={`${s.chip} ${s.blue}`}>✦ Explainable AI · T-MECA</span>
                                <button type="button" className={s.primary} onClick={() => setOpen('ecg')}>Explain</button>
                            </div>
                            <div className={s.xaiT}>Abnormal beat: supraventricular, 0.93</div>
                            <div className={s.xaiS}>The red band is exactly what triggered the prediction</div>
                        </div>
                        <div className={s.tiles}>
                            <div className={s.tile}><small>BP</small><b>138/82</b><em style={{ color: '#B4510B' }}>Raised · mmHg</em></div>
                            <div className={s.tile}><small>TEMP</small><b>38.4</b><i>°C</i><em style={{ color: '#B4510B' }}>Fever</em></div>
                            <div className={`${s.tile} ${s.tileRed}`}><small>GCS</small><b>9</b><i>/15</i><em style={{ color: '#C21F1F' }}>Unconscious</em></div>
                            <div className={`${s.tile} ${s.tileRed}`}><small>NEWS2</small><b style={{ color: '#C21F1F' }}>9</b><em style={{ color: '#C21F1F' }}>High, act now</em></div>
                        </div>
                    </div>

                    <div className={s.stage}>
                        <div className={s.bodyCol}>
                            <div className={s.layers} aria-label="Body layers"><span className={s.on}>All</span><span>Muscles</span><span>Skeleton</span><span>Organs</span></div>
                            <div className={s.bodyWrap}>
                                <img src={IMG + 'body_mus.png'} alt="Body map of the patient" className={s.bodyImg} />
                                {Object.entries(ZONES).map(([k, z]) => {
                                    const on = zone === k;
                                    return (
                                        <div key={k}>
                                            {on ? <span className={s.halo} style={{ left: `${z.x}%`, top: `${z.y}%`, background: `${z.color}22`, borderColor: `${z.color}88` }} /> : null}
                                            <button type="button" aria-label={z.label} className={`${s.pin} ${on ? s.pinOn : ''}`} style={{ left: `${z.x}%`, top: `${z.y}%`, background: z.color, color: z.color }} onClick={() => setZone(on ? 'all' : k)} />
                                            <button type="button" className={`${s.plab} ${z.side === 'l' ? s.plabL : ''}`} style={{ left: `${z.x}%`, top: `${z.y}%`, color: on ? '#fff' : z.tone, background: on ? z.color : '#fff' }} onClick={() => setZone(on ? 'all' : k)}>{z.label}</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={s.cards}>
                            {zone === 'all' ? (
                                <div className={s.zHead}><span className={s.kick}>Flagged by the AI on arrival</span></div>
                            ) : (
                                <div className={s.zHead}>
                                    <span className={s.zDot} style={{ background: ZONES[zone].color }} />
                                    <span className={s.zName}>{ZONES[zone].label}</span>
                                    <span className={s.zSub}>linked exams and their AI models</span>
                                </div>
                            )}
                            {cards.map((c) => <Card key={zone + c.id} c={c} onOpen={setOpen} />)}
                            {zone === 'all' ? (
                                <div className={s.hint}>Tap a zone on the body: its AI model and exams open</div>
                            ) : (
                                <button type="button" className={s.hint} onClick={() => setZone('all')}>← Whole body</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={s.links}>
                    <SmartLink href="/doctor/patient/team" className={s.link}><span className={s.ic}>{ICON.file}</span>Care team</SmartLink>
                    <SmartLink href="/doctor/patient/labs" className={s.link}><span className={s.ic}>{ICON.drop}</span>Lab results<span className={`${s.chip} ${s.red}`}>3 out of range</span></SmartLink>
                    <SmartLink href="/doctor/patient/report" className={s.link}><span className={s.ic}>{ICON.brain}</span>Memory report<span className={`${s.chip} ${s.blue}`}>New</span></SmartLink>
                    <SmartLink href="/doctor/patient/note" className={s.link}><span className={s.ic}>{ICON.wave}</span>Consultation note</SmartLink>
                    <SmartLink href="/doctor/patient/rx" className={s.link}><span className={s.ic}>{ICON.file}</span>New prescription</SmartLink>
                </div>
                <div className={s.foot}>Decision support. The doctor always decides. Demonstration data, fictional patient.</div>
            </div>
            <Detail id={open} onClose={() => setOpen(null)} />
        </div>
    );
}
