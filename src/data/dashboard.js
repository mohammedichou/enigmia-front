// Données mockées pour le dashboard - à remplacer par l'API plus tard

export const ROOMS = [
  { id: 'chill', name: 'Chill Room', icon: '🛋️', desc: 'Détente, jeux, gain de points techniques' },
  { id: 'creative', name: 'Creative Room', icon: '🎨', desc: 'Idéation, prototypage, créativité' },
  { id: 'tech', name: 'Tech Room', icon: '💻', desc: 'Échanges avec les mentors' },
  { id: 'pitch', name: 'Pitch Room', icon: '🎤', desc: 'Travail et entraînement au pitch' },
];

export const COST_PER_BOOKING = 20; // points techniques pour un RDV de 15 min (cf. règlement)

export const MOCK_TEAMS = [
  { id: 't1', name: 'cipher-squad', password: 'demo', displayName: 'The Cipher Squad', points: 60 },
  { id: 't2', name: 'neural-knights', password: 'demo', displayName: 'Neural Knights', points: 40 },
  { id: 't3', name: 'data-pirates', password: 'demo', displayName: 'Data Pirates', points: 25 },
];

export const MOCK_MENTORS = [
  {
    id: 'm1',
    name: 'sarah-belkacem',
    password: 'demo',
    displayName: 'Sarah Belkacem',
    expertise: 'IA & Machine Learning',
    avatar: '👩‍💻',
    bio: '10 ans en data science, ex-Google Brain.',
  },
  {
    id: 'm2',
    name: 'karim-hadj',
    password: 'demo',
    displayName: 'Karim Hadj',
    expertise: 'Architecture Backend',
    avatar: '👨‍💻',
    bio: 'Lead engineer, microservices et scalabilité.',
  },
  {
    id: 'm3',
    name: 'lina-bouzid',
    password: 'demo',
    displayName: 'Lina Bouzid',
    expertise: 'UX / Product Design',
    avatar: '🎨',
    bio: 'Designer senior, focus produit IA.',
  },
  {
    id: 'm4',
    name: 'youcef-rahmani',
    password: 'demo',
    displayName: 'Youcef Rahmani',
    expertise: 'DevOps & Cloud',
    avatar: '☁️',
    bio: 'Infra, CI/CD, AWS / GCP.',
  },
  {
    id: 'm5',
    name: 'amina-sellal',
    password: 'demo',
    displayName: 'Amina Sellal',
    expertise: 'Pitch & Storytelling',
    avatar: '🎤',
    bio: 'Coach communication et présentation investisseurs.',
  },
];

// Slots disponibles par mentor (date ISO + heure début + heure fin)
// Le hackathon a lieu du 21 au 24 mai 2026
const days = ['2026-05-21', '2026-05-22', '2026-05-23', '2026-05-24'];
const hours = ['09:30', '10:00', '11:00', '14:00', '14:30', '15:00', '16:00', '17:00'];

export const MOCK_SLOTS = MOCK_MENTORS.flatMap((mentor) =>
  days.flatMap((day) =>
    hours.map((hour, idx) => ({
      id: `${mentor.id}-${day}-${hour}`,
      mentorId: mentor.id,
      date: day,
      time: hour,
      duration: 15,
      // On ne propose pas tous les slots tout le temps
      available: (mentor.id.charCodeAt(1) + idx + days.indexOf(day)) % 3 !== 0,
    })),
  ),
);

const DEFAULT_DOCUMENTS = [
  { id: 'd1', title: 'Sujet officiel du hackathon', filename: 'sujet-hackathon-2026.pdf', size: '2.4 MB', uploadedAt: '2026-05-21' },
  { id: 'd2', title: 'Règlement & barème', filename: 'reglement.pdf', size: '180 KB', uploadedAt: '2026-05-21' },
  { id: 'd3', title: 'Datasets fournis', filename: 'datasets-readme.pdf', size: '420 KB', uploadedAt: '2026-05-21' },
  { id: 'd4', title: 'Template de pitch deck', filename: 'pitch-template.pdf', size: '3.1 MB', uploadedAt: '2026-05-22' },
  { id: 'd5', title: 'Critères d\'évaluation finale', filename: 'evaluation.pdf', size: '120 KB', uploadedAt: '2026-05-23' },
];

const DEFAULT_EVENTS = [
  { id: 'e1', date: '2026-05-21', time: '09:00', duration: 60, title: 'Cérémonie d\'ouverture', location: 'Main Room' },
  { id: 'e2', date: '2026-05-21', time: '10:30', duration: 30, title: 'Briefing technique', location: 'Tech Room' },
  { id: 'e3', date: '2026-05-21', time: '12:30', duration: 60, title: 'Lunch & networking', location: 'Chill Room' },
  { id: 'e4', date: '2026-05-22', time: '09:00', duration: 30, title: 'Daily standup', location: 'Main Room' },
  { id: 'e5', date: '2026-05-22', time: '15:00', duration: 90, title: 'Workshop : LLMs en production', location: 'Tech Room' },
  { id: 'e6', date: '2026-05-23', time: '09:00', duration: 30, title: 'Daily standup', location: 'Main Room' },
  { id: 'e7', date: '2026-05-23', time: '14:00', duration: 60, title: 'Mid-event check-in', location: 'Main Room' },
  { id: 'e8', date: '2026-05-24', time: '14:00', duration: 180, title: 'Pitch final & jury', location: 'Main Room' },
];

/* ─── localStorage helpers ─── */

const LS_KEYS = {
  AUTH: 'enigmia.auth',
  TEAMS: 'enigmia.teams',
  BOOKINGS: 'enigmia.bookings',
  SLOTS: 'enigmia.slots',
  DOCUMENTS: 'enigmia.documents',
  EVENTS: 'enigmia.events',
  SUBMISSIONS: 'enigmia.submissions',
};

export function getStoredTeams() {
  const raw = localStorage.getItem(LS_KEYS.TEAMS);
  if (!raw) {
    localStorage.setItem(LS_KEYS.TEAMS, JSON.stringify(MOCK_TEAMS));
    return MOCK_TEAMS;
  }
  return JSON.parse(raw);
}

export function setStoredTeams(teams) {
  localStorage.setItem(LS_KEYS.TEAMS, JSON.stringify(teams));
}

export function getStoredSlots() {
  const raw = localStorage.getItem(LS_KEYS.SLOTS);
  if (!raw) {
    localStorage.setItem(LS_KEYS.SLOTS, JSON.stringify(MOCK_SLOTS));
    return MOCK_SLOTS;
  }
  return JSON.parse(raw);
}

export function setStoredSlots(slots) {
  localStorage.setItem(LS_KEYS.SLOTS, JSON.stringify(slots));
}

export function getStoredBookings() {
  const raw = localStorage.getItem(LS_KEYS.BOOKINGS);
  return raw ? JSON.parse(raw) : [];
}

export function setStoredBookings(bookings) {
  localStorage.setItem(LS_KEYS.BOOKINGS, JSON.stringify(bookings));
}

export function getStoredDocuments() {
  const raw = localStorage.getItem(LS_KEYS.DOCUMENTS);
  if (!raw) {
    localStorage.setItem(LS_KEYS.DOCUMENTS, JSON.stringify(DEFAULT_DOCUMENTS));
    return DEFAULT_DOCUMENTS;
  }
  return JSON.parse(raw);
}

export function setStoredDocuments(docs) {
  localStorage.setItem(LS_KEYS.DOCUMENTS, JSON.stringify(docs));
}

export function getStoredEvents() {
  const raw = localStorage.getItem(LS_KEYS.EVENTS);
  if (!raw) {
    localStorage.setItem(LS_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
    return DEFAULT_EVENTS;
  }
  return JSON.parse(raw);
}

export function setStoredEvents(events) {
  localStorage.setItem(LS_KEYS.EVENTS, JSON.stringify(events));
}

export function getStoredSubmissions() {
  const raw = localStorage.getItem(LS_KEYS.SUBMISSIONS);
  return raw ? JSON.parse(raw) : [];
}

export function setStoredSubmissions(subs) {
  localStorage.setItem(LS_KEYS.SUBMISSIONS, JSON.stringify(subs));
}

export function submitDeliverable({ teamId, projectUrl, pitchFilename, pitchSize }) {
  const subs = getStoredSubmissions();
  const existing = subs.findIndex((s) => s.teamId === teamId);
  const submission = {
    id: existing >= 0 ? subs[existing].id : `s-${Date.now()}`,
    teamId,
    projectUrl,
    pitchFilename,
    pitchSize,
    submittedAt: new Date().toISOString(),
  };
  if (existing >= 0) {
    subs[existing] = submission;
  } else {
    subs.push(submission);
  }
  setStoredSubmissions(subs);
  return submission;
}

export function getAuth() {
  const raw = localStorage.getItem(LS_KEYS.AUTH);
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(auth) {
  if (auth) {
    localStorage.setItem(LS_KEYS.AUTH, JSON.stringify(auth));
  } else {
    localStorage.removeItem(LS_KEYS.AUTH);
  }
}

/* ─── Auth (mock) ─── */

export function mockLogin(username, password) {
  const teams = getStoredTeams();
  const team = teams.find((t) => t.name === username && t.password === password);
  if (team) return { role: 'team', id: team.id };
  const mentor = MOCK_MENTORS.find((m) => m.name === username && m.password === password);
  if (mentor) return { role: 'mentor', id: mentor.id };
  return null;
}

/* ─── Booking ─── */

export function bookSlot({ teamId, slotId, room, expertise, problem }) {
  const teams = getStoredTeams();
  const slots = getStoredSlots();
  const bookings = getStoredBookings();

  const team = teams.find((t) => t.id === teamId);
  const slot = slots.find((s) => s.id === slotId);

  if (!team || !slot || !slot.available) {
    return { success: false, error: 'Slot indisponible' };
  }
  if (team.points < COST_PER_BOOKING) {
    return { success: false, error: 'Solde de points techniques insuffisant' };
  }

  team.points -= COST_PER_BOOKING;
  slot.available = false;

  const booking = {
    id: `b-${Date.now()}`,
    teamId,
    mentorId: slot.mentorId,
    slotId,
    room,
    expertise: expertise || '',
    problem: problem || '',
    date: slot.date,
    time: slot.time,
    duration: slot.duration,
    cost: COST_PER_BOOKING,
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);

  setStoredTeams(teams);
  setStoredSlots(slots);
  setStoredBookings(bookings);

  return { success: true, booking };
}
