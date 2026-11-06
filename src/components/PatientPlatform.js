'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { patientProfile } from '@/data/patientMockData';
import Header from '@/components/Header';
import styles from './PatientPlatform.module.css';

const sectionButtons = [
  { key: 'home', label: 'Accueil', icon: <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13V10.5" /></svg> },
  { key: 'notifs', label: 'Notifications', icon: <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
  { key: 'dossier', label: 'Dossier Medical', icon: <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { key: 'ordonnances', label: 'Ordonnances', icon: <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg> },
  { key: 'privacy', label: 'Confidentialite', href: '/patient/privacy', icon: <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg> },
  { key: 'access', label: "Journal d'acces", href: '/patient/access', icon: <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg> },
  { key: 'rdv', label: 'Rendez-vous', icon: <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
];

function detectLanguage(text) {
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (hasArabic) return 'ar';
  const low = text.toLowerCase();
  if (low.includes('chno') || low.includes('wach') || low.includes('salam') || low.includes('kifach')) {
    return 'darija';
  }
  return 'fr';
}

function replyFromContext(text, lang) {
  const low = text.toLowerCase();
  const meds = patientProfile.medications.map((m) => `- ${m.name}: ${m.dosage} (${m.purpose})`).join('\n');
  const allergies = patientProfile.allergies.join(', ');
  const lastDiagnosedVisit = patientProfile.consultations.find((c) => !c.upcoming && c.diagnosis);

  const asksBloodPressureExplanation =
    /pression du sang|tension arterielle|ضغط الدم|pressure|blood pressure|tension/.test(low) ||
    /شنو هي|اشنو هي|chrah|explique/.test(low);

  if (asksBloodPressureExplanation) {
    if (lang === 'ar') {
      return 'ضغط الدم هو القوة التي يضخ بها القلب الدم داخل الشرايين. عندما يبقى مرتفعا لفترة طويلة، يمكن ان يؤثر على القلب والكلى والدماغ. لذلك المتابعة والدواء مهمان.';
    }
    if (lang === 'darija') {
      return 'La pression du sang hiya l9owa li kaydfe3 biha l9alb dam f chraiyen. Ila b9at tal3a muddo twila, t9dar t2atr 3la l9alb, lkliwa w dimagh. 3lach dawa w lmoutaba3a مهمين بزاف.';
    }
    return 'La pression du sang, c\'est la force exercee par le sang sur les arteres. Si elle reste elevee longtemps, elle peut fatiguer le coeur, les reins et le cerveau. C\'est pour cela que le suivi et le traitement sont importants.';
  }

  const diseaseKeywords = [
    'maladie',
    'malade',
    'diagnostic',
    '3ndi',
    'andi',
    'qali',
    'gali',
    'pas compris',
    'ma fhemtch',
    'mafhemtch',
    'expliquer',
    'expliq',
    'medecin',
    'doctor said',
  ];

  const asksDiseaseByKeyword = diseaseKeywords.some((k) => low.includes(k));
  const asksDiseaseArabic = /مريض|مرض|المرض|تشخيص|شنو|شنو عندي|ماذا عندي|الطبيب|قالي|قالي|عندي/.test(text);
  const asksAboutDisease = asksDiseaseByKeyword || asksDiseaseArabic;

  if (asksAboutDisease && lastDiagnosedVisit) {
    const diag = lastDiagnosedVisit.diagnosis;
    const diagSimple =
      patientProfile.diagnosisExplanations?.[diag] ||
      'Je peux te donner une explication simple selon ton dossier.';

    if (lang === 'ar') {
      return `حسب ملفك الطبي: في زيارة ${lastDiagnosedVisit.date} مع ${lastDiagnosedVisit.doctor} تم ذكر ${diag}.\nتفسير مبسط: ${diagSimple}\nاذا بغيت شرح اكثر، تواصل مع طبيبك.`;
    }
    if (lang === 'darija') {
      return `Men dossier dialk: f ziyarat ${lastDiagnosedVisit.date} m3a ${lastDiagnosedVisit.doctor}, tbib dkher ${diag}.\nB charh sahl: ${diagSimple}\nIla bghiti tafasil aktar, tsawl tabib dialk.`;
    }
    return `Selon ton dossier: pendant la consultation du ${lastDiagnosedVisit.date} avec ${lastDiagnosedVisit.doctor}, le diagnostic note est ${diag}.\nExplication simple: ${diagSimple}\nPour plus de details, contacte ton medecin.`;
  }

  if (low.includes('medicament') || low.includes('dwa') || low.includes('traitement')) {
    if (lang === 'ar') return `ادويتك الحالية هي:\n${meds}\nهذا فقط حسب ملفك الطبي.`;
    if (lang === 'darija') return `Hadchi li kayn f dossier dialk:\n${meds}\nGhir ma3lomat men dossier dialk.`;
    return `Voici tes medicaments actuels:\n${meds}\nReponse basee uniquement sur ton dossier.`;
  }

  if (low.includes('allerg') || low.includes('penic')) {
    if (lang === 'ar') return `حسب ملفك: لديك حساسية من ${allergies}.`;
    if (lang === 'darija') return `F dossier dialk kayna allergie men: ${allergies}.`;
    return `Selon ton dossier, tu es allergique a: ${allergies}.`;
  }

  if (low.includes('rdv') || low.includes('rendez') || low.includes('consult')) {
    const rdv = patientProfile.nextAppointment;
    if (lang === 'ar') return `موعدك القادم: ${rdv.date} مع ${rdv.doctor} (${rdv.specialty}) في ${rdv.location}.`;
    if (lang === 'darija') return `Rdv jay dialk: ${rdv.date} m3a ${rdv.doctor} (${rdv.specialty}) f ${rdv.location}.`;
    return `Ton prochain rendez-vous: ${rdv.date} avec ${rdv.doctor} (${rdv.specialty}) a ${rdv.location}.`;
  }

  if (lang === 'ar') return 'انا مساعد معلوماتي فقط حسب ملفك الطبي. لا اقدم تشخيصا. من فضلك تواصل مع طبيبك.';
  if (lang === 'darija') return 'Ana ghir assistant ma3loumati 3la dossier dialk. Ma kanchkhessch. 3afak tsawl tabib dialk.';
  return 'Je suis un assistant informatif base uniquement sur ton dossier. Je ne fais pas de diagnostic. Contacte ton medecin.';
}

export default function PatientPlatform() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [unreadNotifs] = useState(1);
  const [language, setLanguage] = useState('darija');
  const [input, setInput] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showDoctorContactModal, setShowDoctorContactModal] = useState(false);
  const [activeFollowup, setActiveFollowup] = useState('suivi');
  const [followupValues, setFollowupValues] = useState({ fasting: '1.05', postMeal: '' });
  const [expandedSections, setExpandedSections] = useState({ allergies: true, meds: true, conditions: true });
  const [dossierQuickFocus, setDossierQuickFocus] = useState(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(patientProfile.prescriptions[0].id);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Salam Youssef! Kifach n9dar n3awnek lyoum?' },
  ]);
  const chatScrollRef = useRef(null);

  const selectedPrescription = useMemo(
    () => patientProfile.prescriptions.find((p) => p.id === selectedPrescriptionId),
    [selectedPrescriptionId]
  );

  const doctorContacts = useMemo(() => {
    const byDoctor = new Map();
    const phonesByDoctor = {
      'Dr. Alaoui': '+212 6 12 34 56 78',
      'Dr. Tazi': '+212 6 98 76 54 32',
    };

    const addContact = (doctor, specialty, location) => {
      if (!doctor) return;
      if (byDoctor.has(doctor)) return;
      byDoctor.set(doctor, {
        doctor,
        specialty: specialty || 'Medecin traitant',
        location: location || patientProfile.lastVisit.location,
        phone: phonesByDoctor[doctor] || '+212 6 00 00 00 00',
      });
    };

    addContact(
      patientProfile.nextAppointment.doctor,
      patientProfile.nextAppointment.specialty,
      patientProfile.nextAppointment.location
    );

    patientProfile.consultations.forEach((c) => addContact(c.doctor, c.title, c.hospital));

    return Array.from(byDoctor.values());
  }, []);

  useEffect(() => {
    const available = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(Boolean(available));
  }, []);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isAskingAI, chatOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = chatOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [chatOpen]);

  useEffect(() => {
    if (!selectedPrescription) return;
    const payload = JSON.stringify({
      token: selectedPrescription.id,
      patient: patientProfile.id,
      expiresAt: selectedPrescription.expiresAt,
    });
    QRCode.toDataURL(payload, { margin: 1, width: 240, color: { dark: '#0f172a', light: '#ffffff' } })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [selectedPrescription]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (isAskingAI) return;

    const userText = input.trim();
    const detected = detectLanguage(input);
    const lang = language === 'auto' ? detected : language;

    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsAskingAI(true);

    let answer = '';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/patient-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, language: lang }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API status ${response.status}`);
      }

      const data = await response.json();
      answer = data.reply;
    } catch {
      answer = replyFromContext(userText, lang);
    } finally {
      setIsAskingAI(false);
    }

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: answer },
    ]);

  };

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openChat = () => {
    setChatOpen(true);
  };

  const closeChat = () => {
    setChatOpen(false);
    setShowDoctorContactModal(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'dossier') {
      setDossierQuickFocus(null);
    }
  };

  const handleQuickAccess = (focus) => {
    setDossierQuickFocus(focus);
    setActiveTab('dossier');

    if (focus === 'diabete') {
      setExpandedSections({ allergies: false, meds: false, conditions: true });
      return;
    }

    if (focus === 'meds') {
      setExpandedSections({ allergies: false, meds: true, conditions: false });
      return;
    }

    if (focus === 'allergies') {
      setExpandedSections({ allergies: true, meds: false, conditions: false });
    }
  };

  const clearQuickFocus = () => {
    setDossierQuickFocus(null);
    setExpandedSections({ allergies: true, meds: true, conditions: true });
  };

  const handleBack = () => {
    setActiveTab('home');
    setDossierQuickFocus(null);
    setExpandedSections({ allergies: true, meds: true, conditions: true });
  };

  const handleFollowupSubmit = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Super, suivi enregistre. 5 jours de suivi consecutifs, bravo.',
      },
    ]);
  };

  const handleVoiceInput = () => {
    const Recognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!Recognition || isListening) return;

    const recognition = new Recognition();
    recognition.lang = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'ar-MA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const chatDir = language === 'ar' ? 'rtl' : 'ltr';
  const shellDir = language === 'ar' ? 'rtl' : 'ltr';

  const patientFullName = patientProfile.fullName || patientProfile.firstName || 'Patient';
  const patientInitials = patientFullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'P';

  return (
    <div className="app-shell" dir={shellDir}>
      <Header
        userName={patientFullName}
        userRole="Patient"
        userInitials={patientInitials}
        showBack={activeTab !== 'home'}
        onBack={activeTab !== 'home' ? handleBack : undefined}
        hideEpidemie
      />

      <nav className="tab-nav">
        {sectionButtons.map((section) => (
          <button
            key={section.key}
            className={`tab-item${activeTab === section.key ? ' active' : ''}`}
            onClick={() => (section.href ? router.push(section.href) : handleTabChange(section.key))}
          >
            {section.icon}
            {section.label}
            {section.key === 'notifs' && unreadNotifs > 0 ? (
              <span className={styles.sectionBadge}>{unreadNotifs}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <main className={styles.contentArea}>
        {activeTab === 'notifs' && (
          <section className={styles.stack}>
            <article className={styles.card}>
              <div className={styles.rowBetween}>
                <h3>Notifications</h3>
                <span className={styles.badgeOk}>1 nouvelle</span>
              </div>
              <div className={styles.accordionBody}>
                <div className={styles.medCard}>
                  <strong>Rappel rendez-vous</strong>
                  <p>Consultation cardiologie le 4 avril 2026 avec Dr. Alaoui.</p>
                </div>
              </div>
            </article>
          </section>
        )}

        {activeTab === 'home' && (
          <section className={styles.stack}>

            {/* ── Row 1: 4 KPI stat cards ── */}
            <div className={styles.statsRow}>
              <div className={styles.kpiCard}>
                <span className={styles.kpiIcon} style={{ background: '#e6f6fd' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#29a2dd" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <div>
                  <p className={styles.kpiLabel}>Prochain RDV</p>
                  <p className={styles.kpiValue}>4 avril</p>
                  <p className={styles.kpiSub}>Dr. Alaoui · Cardio</p>
                </div>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiIcon} style={{ background: '#f0fdf4' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </span>
                <div>
                  <p className={styles.kpiLabel}>Tension</p>
                  <p className={styles.kpiValue}>12/8</p>
                  <p className={styles.kpiSub} style={{ color: '#16a34a' }}>Normale</p>
                </div>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiIcon} style={{ background: '#fefce8' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                </span>
                <div>
                  <p className={styles.kpiLabel}>HbA1c</p>
                  <p className={styles.kpiValue}>7.8%</p>
                  <p className={styles.kpiSub}>Stable · Jan 2026</p>
                </div>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiIcon} style={{ background: '#fdf2f8' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <div>
                  <p className={styles.kpiLabel}>SpO2</p>
                  <p className={styles.kpiValue}>98%</p>
                  <p className={styles.kpiSub}>28 mars 2026</p>
                </div>
              </div>
            </div>

            {/* ── Row 2: main dashboard grid (3/5 + 2/5) ── */}
            <div className={styles.dashGrid}>

              {/* Left column */}
              <div className={styles.stack}>
                {/* Hero appointment card */}
                <article className={styles.appointmentCard}>
                  <div className={styles.appointmentCardHeader}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Prochaine consultation
                  </div>
                  <div className={styles.appointmentCardBody}>
                    <p className={styles.appointmentDate}>{patientProfile.nextAppointment.date}</p>
                    <p className={styles.appointmentMeta}>
                      {patientProfile.nextAppointment.doctor} · {patientProfile.nextAppointment.specialty}
                    </p>
                    <p className={styles.appointmentMeta} style={{ marginBottom: 14, opacity: 0.7 }}>
                      {patientProfile.nextAppointment.location}
                    </p>
                    <span className={styles.appointmentChip}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#4ade80"><circle cx="12" cy="12" r="10"/></svg>
                      Dans 3 jours
                    </span>
                  </div>
                </article>

                {/* Suivi glycemique compact */}
                <article className={styles.card}>
                  <div className={styles.rowBetween}>
                    <div>
                      <h3 style={{ marginBottom: 4 }}>Suivi glycemique</h3>
                      <p className={styles.muted}>Depuis 20 mars · Matin + Soir</p>
                    </div>
                    <span style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 999, padding: '4px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>Actif ✓</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
                    <button className={styles.primaryBtn} onClick={() => handleTabChange('rdv')} style={{ flex: 1 }}>Ouvrir mon suivi</button>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[{ s: 'done' }, { s: 'done' }, { s: 'done' }, { s: 'done' }, { s: 'missed' }, { s: 'empty' }, { s: 'empty' }].map((d, i) => (
                        <span key={i} className={`${styles.dayDot} ${d.s === 'done' ? styles.dayDotDone : d.s === 'missed' ? styles.dayDotMissed : styles.dayDotEmpty}`} style={{ width: 16, height: 16 }}>
                          {d.s === 'done' && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </div>

              {/* Right column: dossier rapide */}
              <article className={styles.card} style={{ height: '100%' }}>
                <h3 style={{ marginBottom: 4 }}>Mon dossier rapide</h3>
                <p className={styles.muted} style={{ marginBottom: 16 }}>Acces direct a vos informations de sante</p>
                <div className={styles.quickAccessList}>
                  <button className={styles.quickAccessItem} onClick={() => handleQuickAccess('diabete')}>
                    <span className={styles.quickAccessIcon} style={{ background: '#fef9c3' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Pathologies</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Diabete, Hypertension</div>
                    </div>
                    <svg className={styles.quickAccessChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                  <button className={styles.quickAccessItem} onClick={() => handleQuickAccess('meds')}>
                    <span className={styles.quickAccessIcon} style={{ background: '#d0eef9' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#29a2dd" strokeWidth="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Medicaments</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{patientProfile.medications.length} en cours</div>
                    </div>
                    <svg className={styles.quickAccessChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                  <button className={styles.quickAccessItem} onClick={() => handleQuickAccess('allergies')}>
                    <span className={styles.quickAccessIcon} style={{ background: '#fee2e2' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Allergies</div>
                      <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>{patientProfile.allergies.length} allergie connue</div>
                    </div>
                    <svg className={styles.quickAccessChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                  <button className={styles.quickAccessItem} onClick={() => handleTabChange('ordonnances')}>
                    <span className={styles.quickAccessIcon} style={{ background: '#f3e8ff' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Ordonnances</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{patientProfile.prescriptions.length} ordonnances</div>
                    </div>
                    <svg className={styles.quickAccessChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </article>
            </div>

          </section>
        )}

        {activeTab === 'dossier' && (
          <section className={styles.stack}>
            {dossierQuickFocus ? (
              <article className={styles.quickFocusBar}>
                <p>
                  Affichage rapide:{' '}
                  {dossierQuickFocus === 'diabete'
                    ? 'Diabete du patient'
                    : dossierQuickFocus === 'meds'
                      ? 'Medicaments du patient'
                      : 'Allergies du patient'}
                </p>
                <button className={styles.secondaryBtn} onClick={clearQuickFocus}>Voir tout</button>
              </article>
            ) : null}

            <div className={styles.threeCol}>
              <article className={styles.card}>
                <button className={styles.accordionHeader} onClick={() => toggleSection('allergies')}>
                  <span>ALLERGIES</span>
                  <span className={expandedSections.allergies ? styles.arrowOpen : styles.arrow}>›</span>
                </button>
                {expandedSections.allergies && (
                  <div className={styles.accordionBody}>
                    {patientProfile.allergies.map((a) => (
                      <div key={a} className={styles.medCard}>{a} • Allergie</div>
                    ))}
                  </div>
                )}
              </article>

              <article className={styles.card}>
                <button className={styles.accordionHeader} onClick={() => toggleSection('meds')}>
                  <span>MES MEDICAMENTS</span>
                  <span className={expandedSections.meds ? styles.arrowOpen : styles.arrow}>›</span>
                </button>
                {expandedSections.meds && (
                  <div className={styles.accordionBody}>
                    {patientProfile.medications.map((m) => (
                      <div key={m.name} className={styles.medCard}>
                        <strong>{m.name}</strong>
                        <p>{m.dosage} - {m.purpose}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className={styles.card}>
                <button className={styles.accordionHeader} onClick={() => toggleSection('conditions')}>
                  <span>MES PATHOLOGIES</span>
                  <span className={expandedSections.conditions ? styles.arrowOpen : styles.arrow}>›</span>
                </button>
                {expandedSections.conditions && (
                  <div className={styles.accordionBody}>
                    {patientProfile.conditions
                      .filter((c) => (dossierQuickFocus === 'diabete' ? c.name.toLowerCase().includes('diabet') : true))
                      .map((c) => (
                        <div key={c.name} className={styles.medCard}>
                          <strong>{c.name}</strong>
                          <p>Diagnostique en {c.since}</p>
                        </div>
                      ))}
                  </div>
                )}
              </article>
            </div>
          </section>
        )}

        {activeTab === 'ordonnances' && (
          <section className={styles.stack}>
            <div className={styles.twoCol}>
              <div className={styles.stack}>
                {patientProfile.prescriptions.map((p) => (
                  <article key={p.id} className={`${styles.card} ${selectedPrescriptionId === p.id ? styles.cardActive : ''}`}>
                    <div className={styles.rowBetween}>
                      <h3>Ordonnance du {p.date}</h3>
                      <span className={p.status.includes('Expiree') ? styles.badgeMuted : styles.badgeOk}>{p.status}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 10px' }}>{p.doctor} · {p.specialty}</p>
                    <ul className={styles.list}>
                      {p.items.map((item) => (
                        <li key={item} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>{item}</li>
                      ))}
                    </ul>
                    <button className={styles.primaryBtn} style={{ marginTop: 12, width: '100%' }} onClick={() => setSelectedPrescriptionId(p.id)}>Afficher QR code</button>
                  </article>
                ))}
              </div>

              {selectedPrescription && (
                <article className={styles.qrCard}>
                  <h3>QR code pharmacie</h3>
                  <p className={styles.muted} style={{ marginBottom: 16 }}>Montrez ce code au pharmacien.</p>
                  <div className={styles.qrBox} style={{ width: 200, height: 200, margin: '0 auto 16px' }}>
                    {qrDataUrl ? <img src={qrDataUrl} alt="QR ordonnance" width="196" height="196" className={styles.qrImage} /> : <p>Generation...</p>}
                  </div>
                  <p className={styles.muted}>Code: {selectedPrescription.id}</p>
                  <p className={styles.muted}>Valide jusqu&apos;au: {selectedPrescription.expiresAt}</p>
                </article>
              )}
            </div>
          </section>
        )}

        {activeTab === 'rdv' && (
          <section className={styles.stack}>
            <div className={styles.twoCol}>

            {/* Consultations */}
            <article className={styles.card}>
              <div className={styles.rowBetween}>
                <h3>Mes consultations</h3>
                <span className={styles.muted}>{patientProfile.consultations.length} au total</span>
              </div>
              <div className={styles.consultationList}>
                {patientProfile.consultations.map((c) => {
                  const parts = c.date.split(' ');
                  const day = parts[0];
                  const month = parts[1] ? parts[1].slice(0, 3) : '';
                  return (
                    <div key={`${c.date}-${c.title}`} className={`${styles.consultationCard} ${c.upcoming ? styles.consultationCardUpcoming : ''}`}>
                      <div className={`${styles.consultationDateBadge} ${c.upcoming ? styles.consultationDateBadgeUpcoming : ''}`}>
                        <span className={styles.consultationDateDay}>{day}</span>
                        <span className={styles.consultationDateMonth}>{month}</span>
                      </div>
                      <div className={styles.consultationInfo}>
                        <p className={styles.consultationTitle}>{c.title}</p>
                        <p className={styles.consultationDoctor}>{c.doctor}</p>
                        <p className={styles.consultationHospital}>{c.hospital}</p>
                        {c.upcoming && <span className={styles.upcomingBadge}>A venir</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Suivi glycemique */}
            <article className={styles.card}>
              <div className={styles.glycemicHeader}>
                <h3>Suivi glycemique</h3>
                <span className={styles.glycemicStreak}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                  5 jours de suite
                </span>
              </div>
              <p className={styles.muted} style={{ marginBottom: 14 }}>Actif depuis 20 mars · Frequence: matin + soir</p>

              <div className={styles.glycemicInputs}>
                <div>
                  <span className={styles.glycemicLabel}>A jeun (g/L)</span>
                  <input
                    className={styles.glycemicInput}
                    value={followupValues.fasting}
                    onChange={(e) => setFollowupValues((prev) => ({ ...prev, fasting: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <span className={styles.glycemicLabel}>Apres repas (g/L)</span>
                  <input
                    className={styles.glycemicInput}
                    value={followupValues.postMeal}
                    onChange={(e) => setFollowupValues((prev) => ({ ...prev, postMeal: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button className={styles.glycemicSubmit} onClick={handleFollowupSubmit}>Enregistrer la mesure</button>

              <div className={styles.weekTracker}>
                {[
                  { label: 'L', status: 'done' },
                  { label: 'M', status: 'done' },
                  { label: 'M', status: 'done' },
                  { label: 'J', status: 'done' },
                  { label: 'V', status: 'missed' },
                  { label: 'S', status: 'empty' },
                  { label: 'D', status: 'empty' },
                ].map((d, idx) => (
                  <div key={idx} className={styles.dayCell}>
                    <span className={styles.dayName}>{d.label}</span>
                    <span className={`${styles.dayDot} ${d.status === 'done' ? styles.dayDotDone : d.status === 'missed' ? styles.dayDotMissed : styles.dayDotEmpty}`}>
                      {d.status === 'done' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      {d.status === 'missed' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>}
                    </span>
                  </div>
                ))}
              </div>
              <p className={styles.streakText}>Bravo ! 5 jours de suivi consecutifs</p>
            </article>

            </div>
          </section>
        )}
      </main>

      <footer className="page-footer">© 2026 Alwarid. All rights reserved.</footer>

      {!chatOpen && (
        <button className={styles.chatFab} onClick={openChat} aria-label="Ouvrir le chat">
          <span className={styles.robotAvatar}>
            <span className={styles.robotHead}>
              <span className={styles.robotEye}></span>
            </span>
            <span className={styles.robotBody}></span>
          </span>
        </button>
      )}

      <div className={`${styles.chatBackdrop} ${chatOpen ? styles.chatBackdropOpen : ''}`} onClick={closeChat}></div>

      <aside className={`${styles.chatPanel} ${chatOpen ? styles.chatPanelOpen : ''}`} dir={chatDir}>
        <div className={styles.chatPanelHeader}>
          <div>
            <h3>💬 Assistant Alwarid</h3>
            <p className={styles.muted}>En ligne - Darija / Francais / Arabe</p>
          </div>
          <button className={styles.closeBtn} onClick={closeChat}>✕</button>
        </div>

        <div className={styles.languageRow}>
          <button className={language === 'darija' ? styles.langActive : styles.langBtn} onClick={() => setLanguage('darija')}>Darija</button>
          <button className={language === 'fr' ? styles.langActive : styles.langBtn} onClick={() => setLanguage('fr')}>Francais</button>
          <button className={language === 'ar' ? styles.langActive : styles.langBtn} onClick={() => setLanguage('ar')}>العربية</button>
          <button className={language === 'auto' ? styles.langActive : styles.langBtn} onClick={() => setLanguage('auto')}>Auto</button>
        </div>

        <span className={styles.badge}>Je suis un assistant, pas un medecin</span>

        <div className={styles.chatBox} ref={chatScrollRef}>
          {messages.map((m, idx) => (
            <div key={`${m.role}-${idx}`} className={m.role === 'assistant' ? styles.msgAi : styles.msgUser}>
              {m.role === 'assistant' && <span className={styles.botAvatar}>🧑‍⚕️</span>}
              <span>{m.text}</span>
            </div>
          ))}
          {isAskingAI && (
            <div className={styles.msgAi}>
              <span className={styles.botAvatar}>🧑‍⚕️</span>
              <span className={styles.typingDots}><i></i><i></i><i></i></span>
            </div>
          )}
        </div>

        <div className={styles.chatInputRow}>
          <button
            className={`${styles.micBtn} ${isListening ? styles.micActive : ''}`}
            type="button"
            onClick={handleVoiceInput}
            disabled={!speechSupported || isListening}
          >
            🎤
          </button>
          <input
            className={styles.chatInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ecris ton message..."
          />
          <button className={styles.sendBtn} type="button" onClick={handleSend} disabled={isAskingAI}>
            Envoyer →
          </button>
        </div>

        <button className={styles.contactDoctorBtn} type="button" onClick={() => setShowDoctorContactModal(true)}>
          Contacter mon medecin
        </button>

        {showDoctorContactModal ? (
          <>
            <button
              className={styles.doctorModalBackdrop}
              aria-label="Fermer les contacts medecin"
              type="button"
              onClick={() => setShowDoctorContactModal(false)}
            ></button>
            <section className={styles.doctorModal} role="dialog" aria-modal="true" aria-label="Contacts medecins">
              <div className={styles.rowBetween}>
                <h3>Contacts medecins</h3>
                <button className={styles.closeBtn} type="button" onClick={() => setShowDoctorContactModal(false)}>✕</button>
              </div>
              <div className={styles.accordionBody}>
                {doctorContacts.map((contact) => (
                  <div key={contact.doctor} className={styles.medCard}>
                    <strong>{contact.doctor}</strong>
                    <p>{contact.specialty}</p>
                    <p>{contact.location}</p>
                    <p>{contact.phone}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </aside>

    </div>
  );
}
