import { apiFetch, API_URL, getToken } from './client';

const json = (method) => (data) => ({
  method,
  body: JSON.stringify(data),
});

export const api = {
  /* ───── Auth ───── */
  auth: {
    login: (username, password) =>
      apiFetch('/api/auth/login', json('POST')({ username, password })),
    me: () => apiFetch('/api/auth/me'),
  },

  /* ───── Teams ───── */
  teams: {
    list: () => apiFetch('/api/admin/teams'),
    create: (data) => apiFetch('/api/admin/teams', json('POST')(data)),
    update: (id, data) => apiFetch(`/api/admin/teams/${id}`, json('PATCH')(data)),
    adjustPoints: (id, delta, reason = 'admin-adjust') =>
      apiFetch(`/api/admin/teams/${id}/points`, json('PATCH')({ delta, reason })),
    delete: (id) => apiFetch(`/api/admin/teams/${id}`, { method: 'DELETE' }),
  },

  /* ───── Mentors ───── */
  mentors: {
    list: () => apiFetch('/api/mentors'),
    listAdmin: () => apiFetch('/api/admin/mentors'),
    create: (data) => apiFetch('/api/admin/mentors', json('POST')(data)),
    update: (id, data) => apiFetch(`/api/admin/mentors/${id}`, json('PATCH')(data)),
    delete: (id) => apiFetch(`/api/admin/mentors/${id}`, { method: 'DELETE' }),
    slots: (mentorId) => apiFetch(`/api/mentors/${mentorId}/slots`),
    addSlot: (mentorId, data) =>
      apiFetch(`/api/admin/mentors/${mentorId}/slots`, json('POST')(data)),
    toggleSlot: (slotId, available) =>
      apiFetch(`/api/admin/slots/${slotId}`, json('PATCH')({ available })),
    deleteSlot: (slotId) => apiFetch(`/api/admin/slots/${slotId}`, { method: 'DELETE' }),
  },

  /* ───── Events ───── */
  events: {
    list: () => apiFetch('/api/events'),
    create: (data) => apiFetch('/api/admin/events', json('POST')(data)),
    update: (id, data) => apiFetch(`/api/admin/events/${id}`, json('PATCH')(data)),
    delete: (id) => apiFetch(`/api/admin/events/${id}`, { method: 'DELETE' }),
  },

  /* ───── Documents (ressources pédagogiques) ───── */
  documents: {
    list: () => apiFetch('/api/documents'),
    downloadUrl: (id) => `${API_URL}/api/documents/${id}/download`,
    upload: (title, file) => {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('file', file);
      return apiFetch('/api/admin/documents', { method: 'POST', body: fd });
    },
    delete: (id) => apiFetch(`/api/admin/documents/${id}`, { method: 'DELETE' }),
  },

  /* ───── Bookings ───── */
  bookings: {
    create: ({ slotId, room, expertise, problem }) =>
      apiFetch('/api/bookings', json('POST')({ slotId, room, expertise, problem })),
    listTeam: () => apiFetch('/api/team/bookings'),
    listMentor: () => apiFetch('/api/mentor/bookings'),
    listAll: (filters = {}) => {
      const qs = new URLSearchParams(filters).toString();
      return apiFetch(`/api/admin/bookings${qs ? `?${qs}` : ''}`);
    },
    cancel: (id) => apiFetch(`/api/admin/bookings/${id}`, { method: 'DELETE' }),
  },

  /* ───── Escape game ───── */
  escape: {
    register: ({ teamName, password }) =>
      apiFetch('/api/escape/register', json('POST')({ teamName, password })),
    submitScore: ({ teamName, durationMs }) =>
      apiFetch('/api/escape/scores', json('POST')({ teamName, durationMs })),
    scores: () => apiFetch('/api/escape/scores'),
  },

  /* ───── Leaderboard & résultats (public) ───── */
  leaderboard: {
    teams: () => apiFetch('/api/leaderboard'),
  },
  results: {
    get: () => apiFetch('/api/results'),
  },

  /* ───── Settings (global) ───── */
  settings: {
    get: () => apiFetch('/api/settings'),
    update: (data) => apiFetch('/api/admin/settings', json('PATCH')(data)),
  },

  /* ───── Submissions (livrables) ───── */
  submissions: {
    me: () => apiFetch('/api/team/submission'),
    upsert: ({ projectUrl, pitchFile }) => {
      const fd = new FormData();
      fd.append('projectUrl', projectUrl);
      if (pitchFile) fd.append('pitchFile', pitchFile);
      return apiFetch('/api/team/submission', { method: 'PUT', body: fd });
    },
    listAll: () => apiFetch('/api/admin/submissions'),
    pitchUrl: (id) => `${API_URL}/api/admin/submissions/${id}/pitch?token=${getToken()}`,
  },
};

export { API_URL, getAuth, setAuth, getToken } from './client';
