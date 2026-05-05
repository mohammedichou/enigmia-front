// Constantes partagées (rooms, coût mentor) — données dynamiques via l'API

export const ROOMS = [
  { id: 'chill', name: 'Chill Room', icon: '🛋️', desc: 'Détente, jeux, gain de points techniques' },
  { id: 'creative', name: 'Creative Room', icon: '🎨', desc: 'Idéation, prototypage, créativité' },
  { id: 'tech', name: 'Tech Room', icon: '💻', desc: 'Échanges avec les mentors' },
  { id: 'pitch', name: 'Pitch Room', icon: '🎤', desc: 'Travail et entraînement au pitch' },
];

export const COST_PER_BOOKING = 20; // points techniques pour un RDV de 15 min (cf. règlement)
