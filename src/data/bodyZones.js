// Zones cliquables du corps 3D et examens liés (données de démonstration, patient Youssef Kacimi).
// Les coordonnées sont en mètres, dans le repère du modèle /models/body.glb :
// y vers le haut (0 = pieds, 1,75 = sommet du crâne), +z devant le patient, +x côté gauche du patient.

export const ZONES = [
    {
        id: 'head', label: 'Mémoire', sub: 'Cerveau et mémoire', color: '#29a2dd', tone: '#196185', bg: '#e6f1fb',
        anchor: [0.0, 1.69, 0.08], target: [0.0, 1.63, 0.0], dist: 0.95, organs: ['brain'],
        items: [
            { n: 'Rapport WassIA', d: 'Reçu hier soir', href: '/doctor/patient/report', tag: 'Nouveau' },
            { n: 'Scanner cérébral', d: '14 sept. 2021, normal', img: '/scan-brain.png' },
        ],
    },
    {
        id: 'chest', label: 'Cœur', sub: 'Critique', color: '#dc2626', tone: '#b91c1c', bg: '#fef2f2',
        anchor: [0.05, 1.33, 0.14], target: [0.02, 1.3, 0.04], dist: 1.25, organs: ['heart', 'lungs'],
        items: [
            { n: 'ECG', d: '20 juin 2024, arythmie sinusale', img: '/scan-ecg.png' },
            { n: 'Échocardiographie', d: "5 juil. 2024, fraction d'éjection 55 %", img: '/scan-echo-cardio.png' },
            { n: 'Radiographie thoracique', d: '12 janv. 2023, normale', img: '/scan-thorax.png' },
        ],
    },
    {
        id: 'abdomen', label: 'Métabolisme', sub: 'Critique', color: '#dc2626', tone: '#b91c1c', bg: '#fef2f2',
        anchor: [0.0, 1.07, 0.14], target: [0.0, 1.07, 0.03], dist: 1.35, organs: ['liver', 'stomach', 'intestines', 'kidneys'],
        items: [
            { n: 'Bilan sanguin', d: '8 janv. 2026, HbA1c 7,8 %', img: '/scan-bilan.png' },
            { n: 'Échographie abdominale', d: '3 nov. 2022, stéatose grade 1', img: '/scan-abdomen.png' },
        ],
    },
    {
        id: 'knee', label: 'Genou gauche', sub: 'À surveiller', color: '#d97706', tone: '#b45309', bg: '#fffbeb',
        anchor: [0.08, 0.45, 0.07], target: [0.08, 0.45, 0.02], dist: 1.0, organs: [],
        items: [
            { n: 'IRM du genou', d: '18 avr. 2023, gonarthrose grade 2', img: '/scan-genou.png' },
            { n: 'EMG des membres inférieurs', d: '10 févr. 2025, neuropathie débutante', img: '/scan-emg.png' },
        ],
    },
];

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));

// Régions utilisées par les modes Urgence et Consultation (clés de patient.bodyRegions).
export const REGION_ZONES = [
    { id: 'head', label: 'Tête', anchor: [0.0, 1.69, 0.08], target: [0.0, 1.63, 0.0], dist: 0.95, organs: ['brain'] },
    { id: 'chest', label: 'Thorax', anchor: [0.05, 1.33, 0.14], target: [0.02, 1.3, 0.04], dist: 1.25, organs: ['heart', 'lungs'] },
    { id: 'abdomen', label: 'Abdomen', anchor: [0.0, 1.07, 0.14], target: [0.0, 1.07, 0.03], dist: 1.35, organs: ['liver', 'stomach', 'intestines', 'kidneys'] },
    { id: 'rightArm', label: 'Bras droit', anchor: [-0.2, 1.22, 0.05], target: [-0.2, 1.2, 0.0], dist: 1.15, organs: [] },
    { id: 'leftArm', label: 'Bras gauche', anchor: [0.2, 1.22, 0.05], target: [0.2, 1.2, 0.0], dist: 1.15, organs: [] },
    { id: 'rightLeg', label: 'Jambe droite', anchor: [-0.09, 0.62, 0.07], target: [-0.09, 0.6, 0.0], dist: 1.5, organs: [] },
    { id: 'leftLeg', label: 'Jambe gauche', anchor: [0.09, 0.62, 0.07], target: [0.09, 0.6, 0.0], dist: 1.5, organs: [] },
];
