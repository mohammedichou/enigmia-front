import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MOCK_MENTORS,
  ROOMS,
  getStoredTeams,
  setStoredTeams,
  getStoredDocuments,
  setStoredDocuments,
  getStoredEvents,
  setStoredEvents,
  getStoredSlots,
  setStoredSlots,
  getStoredBookings,
} from '../data/dashboard';

const TABS = [
  { id: 'teams', label: 'Équipes & Points' },
  { id: 'documents', label: 'Documents' },
  { id: 'events', label: 'Calendrier' },
  { id: 'mentors', label: 'Mentors & Slots' },
];

export default function AdminPro() {
  const [tab, setTab] = useState('teams');

  return (
    <div className="min-h-screen bg-enigmia-dark font-inter text-white">
      <header className="border-b border-white/5 bg-black/30 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-enigmia-gold">// Dashboard Pro</p>
            <h1 className="font-poppins text-lg font-bold">Espace organisateurs</h1>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="text-white/40 hover:text-white">← Site</Link>
            <Link to="/login" className="text-white/40 hover:text-white">Login participant</Link>
            <button
              onClick={() => {
                if (confirm('Réinitialiser toutes les données mock ?')) {
                  Object.keys(localStorage)
                    .filter((k) => k.startsWith('enigmia.'))
                    .forEach((k) => localStorage.removeItem(k));
                  window.location.reload();
                }
              }}
              className="text-red-400/70 hover:text-red-400"
            >
              Reset mock
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-white/10 px-6 md:px-10">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-3 text-sm transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-enigmia-gold text-enigmia-gold'
                  : 'border-b-2 border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        {tab === 'teams' && <TeamsTab />}
        {tab === 'documents' && <DocumentsTab />}
        {tab === 'events' && <EventsTab />}
        {tab === 'mentors' && <MentorsTab />}
      </main>
    </div>
  );
}

/* ─────────── ÉQUIPES ─────────── */
function TeamsTab() {
  const [teams, setTeams] = useState(() => getStoredTeams());
  const [newTeam, setNewTeam] = useState({ name: '', displayName: '', password: '', points: 1000 });

  const refresh = () => setTeams(getStoredTeams());

  const adjustPoints = (id, delta) => {
    const updated = getStoredTeams().map((t) =>
      t.id === id ? { ...t, points: Math.max(0, t.points + delta) } : t,
    );
    setStoredTeams(updated);
    refresh();
  };

  const setPointsExact = (id, value) => {
    const v = Math.max(0, parseInt(value) || 0);
    const updated = getStoredTeams().map((t) => (t.id === id ? { ...t, points: v } : t));
    setStoredTeams(updated);
    refresh();
  };

  const addTeam = () => {
    if (!newTeam.name || !newTeam.displayName || !newTeam.password) return;
    const updated = [
      ...getStoredTeams(),
      {
        id: `t-${Date.now()}`,
        name: newTeam.name.toLowerCase().replace(/\s+/g, '-'),
        displayName: newTeam.displayName,
        password: newTeam.password,
        points: parseInt(newTeam.points) || 0,
      },
    ];
    setStoredTeams(updated);
    setNewTeam({ name: '', displayName: '', password: '', points: 1000 });
    refresh();
  };

  const deleteTeam = (id) => {
    if (!confirm('Supprimer cette équipe ?')) return;
    setStoredTeams(getStoredTeams().filter((t) => t.id !== id));
    refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Équipes inscrites</h2>
        <p className="mt-1 text-sm text-white/60">Gérer les équipes et leurs points.</p>
      </div>

      <div className="mb-8 border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouvelle équipe</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <input
            placeholder="Identifiant (ex: my-team)"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
          <input
            placeholder="Nom affiché"
            value={newTeam.displayName}
            onChange={(e) => setNewTeam({ ...newTeam, displayName: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
          <input
            placeholder="Mot de passe"
            value={newTeam.password}
            onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
          <input
            type="number"
            placeholder="Points initiaux"
            value={newTeam.points}
            onChange={(e) => setNewTeam({ ...newTeam, points: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
          <button
            onClick={addTeam}
            className="border border-enigmia-gold bg-enigmia-gold py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold"
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[0.65rem] uppercase tracking-widest text-white/50">
              <th className="px-3 py-3 text-left">Équipe</th>
              <th className="px-3 py-3 text-left">Identifiant</th>
              <th className="px-3 py-3 text-left">Mot de passe</th>
              <th className="px-3 py-3 text-right">Points</th>
              <th className="px-3 py-3 text-center">Ajuster</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="border-b border-white/5">
                <td className="px-3 py-3 font-poppins font-semibold">{t.displayName}</td>
                <td className="px-3 py-3 font-mono text-white/60">{t.name}</td>
                <td className="px-3 py-3 font-mono text-white/40">{t.password}</td>
                <td className="px-3 py-3 text-right">
                  <input
                    type="number"
                    value={t.points}
                    onChange={(e) => setPointsExact(t.id, e.target.value)}
                    className="w-24 border border-white/15 bg-transparent px-2 py-1 text-right font-mono text-enigmia-gold outline-none focus:border-enigmia-gold"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-center gap-1">
                    {[-100, -50, +50, +100, +300].map((d) => (
                      <button
                        key={d}
                        onClick={() => adjustPoints(t.id, d)}
                        className={`border px-2 py-1 font-mono text-xs ${
                          d > 0
                            ? 'border-enigmia-gold/50 text-enigmia-gold hover:bg-enigmia-gold/10'
                            : 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        {d > 0 ? `+${d}` : d}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    onClick={() => deleteTeam(t.id)}
                    className="text-xs text-red-400/70 hover:text-red-400"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────── DOCUMENTS ─────────── */
function DocumentsTab() {
  const [docs, setDocs] = useState(() => getStoredDocuments());
  const [form, setForm] = useState({ title: '', filename: '', size: '' });
  const [file, setFile] = useState(null);

  const refresh = () => setDocs(getStoredDocuments());

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setForm({
      title: form.title || f.name.replace(/\.[^.]+$/, ''),
      filename: f.name,
      size: formatBytes(f.size),
    });
  };

  const upload = () => {
    if (!form.title || !form.filename) return;
    const updated = [
      ...getStoredDocuments(),
      {
        id: `d-${Date.now()}`,
        title: form.title,
        filename: form.filename,
        size: form.size || '—',
        uploadedAt: new Date().toISOString().slice(0, 10),
      },
    ];
    setStoredDocuments(updated);
    setForm({ title: '', filename: '', size: '' });
    setFile(null);
    refresh();
  };

  const deleteDoc = (id) => {
    if (!confirm('Supprimer ce document ?')) return;
    setStoredDocuments(getStoredDocuments().filter((d) => d.id !== id));
    refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Documents PDF</h2>
        <p className="mt-1 text-sm text-white/60">
          Ressources téléchargeables par les équipes. <span className="text-enigmia-gold">Note :</span> en mode mock, le fichier n'est pas réellement uploadé — seules les métadonnées sont enregistrées.
        </p>
      </div>

      <div className="mb-8 border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouveau document</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            placeholder="Titre"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold md:col-span-2"
          />
          <label className="flex cursor-pointer items-center justify-center border border-dashed border-white/20 px-3 py-2 text-sm text-white/60 hover:border-enigmia-gold hover:text-enigmia-gold">
            <input type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />
            {file ? `📄 ${file.name}` : '📎 Choisir un fichier PDF'}
          </label>
          <button
            onClick={upload}
            disabled={!form.title || !form.filename}
            className="border border-enigmia-gold bg-enigmia-gold py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold disabled:cursor-not-allowed disabled:opacity-30"
          >
            Uploader
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {docs.length === 0 ? (
          <p className="text-sm text-white/40">Aucun document.</p>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 border border-white/10 bg-white/[0.02] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-enigmia-gold/10 text-enigmia-gold">
                ⎙
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-poppins text-sm font-semibold">{doc.title}</p>
                <p className="text-xs text-white/40">
                  {doc.filename} · {doc.size} · ajouté le {doc.uploadedAt}
                </p>
              </div>
              <button
                onClick={() => deleteDoc(doc.id)}
                className="text-xs text-red-400/70 hover:text-red-400"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────── ÉVÉNEMENTS ─────────── */
function EventsTab() {
  const [events, setEvents] = useState(() => getStoredEvents());
  const [form, setForm] = useState({
    date: '2026-05-21',
    time: '09:00',
    duration: 60,
    title: '',
    location: 'Main Room',
  });

  const refresh = () => setEvents(getStoredEvents());

  const addEvent = () => {
    if (!form.title) return;
    const updated = [
      ...getStoredEvents(),
      { id: `e-${Date.now()}`, ...form, duration: parseInt(form.duration) || 60 },
    ];
    setStoredEvents(updated);
    setForm({ ...form, title: '' });
    refresh();
  };

  const deleteEvent = (id) => {
    if (!confirm('Supprimer cet événement ?')) return;
    setStoredEvents(getStoredEvents().filter((e) => e.id !== id));
    refresh();
  };

  const grouped = {};
  events
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .forEach((e) => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Calendrier des événements</h2>
        <p className="mt-1 text-sm text-white/60">Cérémonies, workshops, deadlines — visibles par toutes les équipes.</p>
      </div>

      <div className="mb-8 border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouvel événement</h3>
        <div className="grid gap-3 md:grid-cols-6">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
          <input
            type="number"
            placeholder="Durée (min)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
          <input
            placeholder="Titre de l'événement"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold md:col-span-2"
          />
          <select
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          >
            {ROOMS.map((r) => (
              <option key={r.id} value={r.name} className="bg-enigmia-dark">
                {r.name}
              </option>
            ))}
            <option className="bg-enigmia-dark">Autre</option>
          </select>
        </div>
        <button
          onClick={addEvent}
          disabled={!form.title}
          className="mt-3 border border-enigmia-gold bg-enigmia-gold px-6 py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold disabled:cursor-not-allowed disabled:opacity-30"
        >
          Ajouter au planning
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dayEvents]) => (
          <div key={date}>
            <h3 className="mb-3 font-poppins text-sm font-semibold text-enigmia-gold">
              {formatDate(date)}
            </h3>
            <div className="space-y-2">
              {dayEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-4 border-l-2 border-enigmia-gold/40 bg-white/[0.02] py-3 pl-4 pr-3">
                  <div className="font-mono text-sm text-enigmia-gold">{e.time}</div>
                  <div className="flex-1">
                    <p className="font-poppins text-sm font-semibold">{e.title}</p>
                    <p className="text-xs text-white/40">{e.location} · {e.duration} min</p>
                  </div>
                  <button
                    onClick={() => deleteEvent(e.id)}
                    className="text-xs text-red-400/70 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── MENTORS & SLOTS ─────────── */
function MentorsTab() {
  const [slots, setSlots] = useState(() => getStoredSlots());
  const [selectedMentor, setSelectedMentor] = useState(MOCK_MENTORS[0]?.id || null);
  const [form, setForm] = useState({ date: '2026-05-21', time: '10:00', duration: 15 });

  const refresh = () => setSlots(getStoredSlots());

  const bookings = getStoredBookings();
  const teams = getStoredTeams();

  const mentorSlots = slots
    .filter((s) => s.mentorId === selectedMentor)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const mentorBookings = bookings.filter((b) => b.mentorId === selectedMentor);

  const addSlot = () => {
    const newSlot = {
      id: `${selectedMentor}-${form.date}-${form.time}-${Date.now()}`,
      mentorId: selectedMentor,
      date: form.date,
      time: form.time,
      duration: parseInt(form.duration) || 15,
      available: true,
    };
    setStoredSlots([...getStoredSlots(), newSlot]);
    refresh();
  };

  const deleteSlot = (id) => {
    if (!confirm('Supprimer ce créneau ?')) return;
    setStoredSlots(getStoredSlots().filter((s) => s.id !== id));
    refresh();
  };

  const toggleSlot = (id) => {
    const updated = getStoredSlots().map((s) =>
      s.id === id ? { ...s, available: !s.available } : s,
    );
    setStoredSlots(updated);
    refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Mentors & créneaux</h2>
        <p className="mt-1 text-sm text-white/60">Sélectionne un mentor pour gérer ses slots et voir ses réservations.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {MOCK_MENTORS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMentor(m.id)}
            className={`border p-4 text-left transition-colors ${
              selectedMentor === m.id
                ? 'border-enigmia-gold bg-enigmia-gold/10'
                : 'border-white/10 bg-white/[0.02] hover:border-enigmia-gold/40'
            }`}
          >
            <div className="text-2xl">{m.avatar}</div>
            <p className="mt-2 text-sm font-semibold">{m.displayName}</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-enigmia-gold">{m.expertise}</p>
          </button>
        ))}
      </div>

      {selectedMentor && (
        <>
          <div className="mt-8 border border-white/10 bg-white/[0.02] p-5">
            <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouveau créneau</h3>
            <div className="grid gap-3 md:grid-cols-4">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
              />
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
              />
              <input
                type="number"
                placeholder="Durée (min)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
              />
              <button
                onClick={addSlot}
                className="border border-enigmia-gold bg-enigmia-gold py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold"
              >
                Ajouter
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-poppins font-semibold">Tous les créneaux ({mentorSlots.length})</h3>
              <div className="max-h-96 space-y-1 overflow-y-auto">
                {mentorSlots.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between border px-3 py-2 text-sm ${
                      s.available
                        ? 'border-enigmia-gold/30 bg-enigmia-gold/[0.05]'
                        : 'border-white/10 bg-white/[0.02] text-white/40 line-through'
                    }`}
                  >
                    <span className="font-mono">
                      {formatDate(s.date)} · {s.time} ({s.duration} min)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSlot(s.id)}
                        className="text-xs text-white/50 hover:text-enigmia-gold"
                      >
                        {s.available ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => deleteSlot(s.id)}
                        className="text-xs text-red-400/70 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-poppins font-semibold">RDV réservés ({mentorBookings.length})</h3>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {mentorBookings.length === 0 ? (
                  <p className="text-sm text-white/40">Aucun RDV pour ce mentor.</p>
                ) : (
                  mentorBookings.map((b) => {
                    const team = teams.find((t) => t.id === b.teamId);
                    const room = ROOMS.find((r) => r.id === b.room);
                    return (
                      <div key={b.id} className="border border-enigmia-gold/20 bg-enigmia-gold/[0.05] p-3 text-sm">
                        <p className="font-poppins font-semibold">{team?.displayName || '—'}</p>
                        <p className="mt-1 text-xs text-white/50">
                          {formatDate(b.date)} · {b.time} · {b.duration} min · {room?.icon} {room?.name}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
