// ── Mock data — Module Épidémie ──────────────────────────────────────────────

export const kpis = {
  total_passages_aujourd_hui: 134,
  alertes_actives: 2,
  salles_surveillees: 10,
  taux_anomalies_7j: 4.8,
};

export const alertes = [
  {
    id: 'ALT-001',
    niveau: 'critique',
    salle: 'Urgences-A',
    service: 'Urgences',
    n_passages_suspects: 8,
    symptomes_dominants: ['fièvre', 'toux'],
    premiere_detection: '2026-03-27 14:12',
    derniere_detection: '2026-03-29 16:34',
    message: 'Comportement anormal détecté — vérifiez',
    statut: 'en_attente', // 'en_attente' | 'confirme' | 'rejete'
  },
  {
    id: 'ALT-002',
    niveau: 'surveillance',
    salle: 'Pédiatrie-B',
    service: 'Pédiatrie',
    n_passages_suspects: 3,
    symptomes_dominants: ['vomissements', 'diarrhée'],
    premiere_detection: '2026-03-28 09:00',
    derniere_detection: '2026-03-29 11:20',
    message: 'Comportement anormal détecté — vérifiez',
    statut: 'en_attente',
  },
];

// Historique 5 semaines (S-4 → S0) + prévisions S+1 / S+2
export const historiqueSemaines = [
  { semaine: 'S-4', total: 498, grippe_IRA: 8,  gastro: 82, respiratoire: 35 },
  { semaine: 'S-3', semaine_label: 'S-3', total: 521, grippe_IRA: 10, gastro: 88, respiratoire: 40 },
  { semaine: 'S-2', total: 543, grippe_IRA: 11, gastro: 91, respiratoire: 44 },
  { semaine: 'S-1', total: 557, grippe_IRA: 12, gastro: 92, respiratoire: 43 },
  { semaine: 'S0 (actuel)', total: 568, grippe_IRA: 13, gastro: 90, respiratoire: 42 },
  { semaine: 'S+1', total: 612, grippe_IRA: 18, gastro: 88, respiratoire: 38, prevision: true, ic_low_total: 490, ic_high_total: 734 },
  { semaine: 'S+2', total: 645, grippe_IRA: 22, gastro: 85, respiratoire: 35, prevision: true, ic_low_total: 480, ic_high_total: 810 },
];

export const previsions = {
  total_passages: {
    actuel: 568,
    'S+1': { valeur: 612, ic_low: 490, ic_high: 734 },
    'S+2': { valeur: 645, ic_low: 480, ic_high: 810 },
    tendance: 'hausse',
  },
  grippe_IRA: {
    actuel: 13,
    'S+1': { valeur: 18, ic_low: 10, ic_high: 26 },
    'S+2': { valeur: 22, ic_low: 9,  ic_high: 35 },
    tendance: 'hausse',
  },
  gastro: {
    actuel: 90,
    'S+1': { valeur: 88, ic_low: 72, ic_high: 104 },
    'S+2': { valeur: 85, ic_low: 68, ic_high: 102 },
    tendance: 'stable',
  },
  respiratoire: {
    actuel: 42,
    'S+1': { valeur: 38, ic_low: 28, ic_high: 48 },
    'S+2': { valeur: 35, ic_low: 24, ic_high: 46 },
    tendance: 'baisse',
  },
};

// 7 derniers jours — labels
export const joursLabels = ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Auj.'];

export const heatmapData = {
  'Urgences-A':  [0.1, 0.2, 0.8, 0.9, 0.7, 0.3, 0.2],
  'Urgences-B':  [0.1, 0.1, 0.2, 0.1, 0.2, 0.1, 0.1],
  'Pédiatrie-B': [0.2, 0.3, 0.2, 0.6, 0.7, 0.4, 0.2],
  'Med-2':       [0.1, 0.1, 0.1, 0.2, 0.1, 0.8, 0.9],
  'Cardio-1':    [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  'Ortho-3':     [0.1, 0.2, 0.1, 0.1, 0.2, 0.1, 0.1],
};

// Passages suspects par cellule heatmap (pour tooltip)
export const heatmapPassages = {
  'Urgences-A':  [1, 2, 7, 8, 6, 2, 2],
  'Urgences-B':  [0, 0, 1, 0, 1, 0, 0],
  'Pédiatrie-B': [1, 2, 1, 4, 5, 3, 1],
  'Med-2':       [0, 0, 0, 1, 0, 7, 8],
  'Cardio-1':    [0, 0, 0, 0, 0, 0, 0],
  'Ortho-3':     [0, 1, 0, 0, 1, 0, 0],
};
