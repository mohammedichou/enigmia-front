import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROOMS } from '../data/dashboard';
import { api, getAuth, setAuth } from '../api';

const TABS = [
  { id: 'teams', label: 'Équipes & Points' },
  { id: 'documents', label: 'Ressources pédagogiques' },
  { id: 'events', label: 'Calendrier' },
  { id: 'mentors', label: 'Mentors & Slots' },
  { id: 'submissions', label: 'Livrables' },
];

export default function AdminPro() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('teams');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const a = getAuth();
    if (!a || a.role !== 'admin') {
      navigate('/login');
      return;
    }
    setAuthChecked(true);
  }, [navigate]);

  const logout = () => {
    setAuth(null);
    navigate('/login');
  };

  if (!authChecked) return null;

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
            <button onClick={logout} className="text-red-400/70 hover:text-red-400">Déconnexion</button>
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
            >{t.label}</button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        {tab === 'teams' && <TeamsTab />}
        {tab === 'documents' && <DocumentsTab />}
        {tab === 'events' && <EventsTab />}
        {tab === 'mentors' && <MentorsTab />}
        {tab === 'submissions' && <SubmissionsTab />}
      </main>
    </div>
  );
}

/* ─────────── ÉQUIPES ─────────── */
function TeamsTab() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeam, setNewTeam] = useState({ username: '', displayName: '', password: '', points: 0 });
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.teams.list();
      setTeams(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const adjustPoints = async (id, delta) => {
    try { await api.teams.adjustPoints(id, delta); refresh(); }
    catch (e) { alert(e.message); }
  };

  const addTeam = async () => {
    if (!newTeam.username || !newTeam.displayName || !newTeam.password) return;
    try {
      await api.teams.create({ ...newTeam, points: parseInt(newTeam.points) || 0 });
      setNewTeam({ username: '', displayName: '', password: '', points: 0 });
      refresh();
    } catch (e) { alert(e.message); }
  };

  const deleteTeam = async (id) => {
    if (!confirm('Supprimer cette équipe ? Cela annulera ses bookings.')) return;
    try { await api.teams.delete(id); refresh(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Équipes inscrites</h2>
        <p className="mt-1 text-sm text-white/60">Gérer les équipes et leurs points techniques.</p>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="mb-8 border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouvelle équipe</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <input placeholder="Identifiant" value={newTeam.username} onChange={(e) => setNewTeam({ ...newTeam, username: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input placeholder="Nom affiché" value={newTeam.displayName} onChange={(e) => setNewTeam({ ...newTeam, displayName: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input placeholder="Mot de passe" value={newTeam.password} onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input type="number" placeholder="Points" value={newTeam.points} onChange={(e) => setNewTeam({ ...newTeam, points: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <button onClick={addTeam} className="border border-enigmia-gold bg-enigmia-gold py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold">Ajouter</button>
        </div>
      </div>

      {loading ? <p className="text-white/40">Chargement…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[0.65rem] uppercase tracking-widest text-white/50">
                <th className="px-3 py-3 text-left">Équipe</th>
                <th className="px-3 py-3 text-left">Identifiant</th>
                <th className="px-3 py-3 text-right">Points</th>
                <th className="px-3 py-3 text-center">Ajuster</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t._id || t.id} className="border-b border-white/5">
                  <td className="px-3 py-3 font-poppins font-semibold">{t.displayName}</td>
                  <td className="px-3 py-3 font-mono text-white/60">{t.username}</td>
                  <td className="px-3 py-3 text-right font-mono text-enigmia-gold">{t.points || 0}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-1">
                      {[-20, -5, +5, +10, +20].map((d) => (
                        <button key={d} onClick={() => adjustPoints(t._id || t.id, d)} className={`border px-2 py-1 font-mono text-xs ${d > 0 ? 'border-enigmia-gold/50 text-enigmia-gold hover:bg-enigmia-gold/10' : 'border-red-500/40 text-red-400 hover:bg-red-500/10'}`}>{d > 0 ? `+${d}` : d}</button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button onClick={() => deleteTeam(t._id || t.id)} className="text-xs text-red-400/70 hover:text-red-400">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────── DOCUMENTS ─────────── */
function DocumentsTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setDocs(await api.documents.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const upload = async () => {
    if (!title || !file) return;
    setUploading(true);
    try { await api.documents.upload(title, file); setTitle(''); setFile(null); refresh(); }
    catch (e) { alert(e.message); }
    finally { setUploading(false); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce document ?')) return;
    try { await api.documents.delete(id); refresh(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Ressources pédagogiques</h2>
        <p className="mt-1 text-sm text-white/60">PDFs téléchargeables par les équipes.</p>
      </div>

      <div className="mb-8 border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouveau document</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold md:col-span-2" />
          <label className="flex cursor-pointer items-center justify-center border border-dashed border-white/20 px-3 py-2 text-sm text-white/60 hover:border-enigmia-gold hover:text-enigmia-gold">
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
            {file ? `📄 ${file.name}` : '📎 Choisir PDF'}
          </label>
          <button onClick={upload} disabled={uploading || !title || !file} className="border border-enigmia-gold bg-enigmia-gold py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold disabled:opacity-30">{uploading ? 'Upload…' : 'Uploader'}</button>
        </div>
      </div>

      {loading ? <p className="text-white/40">Chargement…</p> : docs.length === 0 ? (
        <p className="text-sm text-white/40">Aucun document.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc._id || doc.id} className="flex items-center gap-4 border border-white/10 bg-white/[0.02] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-enigmia-gold/10 text-enigmia-gold">⎙</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-poppins text-sm font-semibold">{doc.title}</p>
                <p className="text-xs text-white/40">{doc.originalName || doc.filename} · {doc.size && `${Math.round(doc.size / 1024)} KB`}</p>
              </div>
              <a href={api.documents.downloadUrl(doc._id || doc.id)} target="_blank" rel="noreferrer" className="text-xs text-enigmia-gold hover:underline">Télécharger</a>
              <button onClick={() => remove(doc._id || doc.id)} className="text-xs text-red-400/70 hover:text-red-400">Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── ÉVÉNEMENTS ─────────── */
function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: '2026-05-21', time: '09:00', duration: 60, title: '', location: 'Main Room' });

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setEvents(await api.events.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addEvent = async () => {
    if (!form.title) return;
    try { await api.events.create({ ...form, duration: parseInt(form.duration) || 60 }); setForm({ ...form, title: '' }); refresh(); }
    catch (e) { alert(e.message); }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try { await api.events.delete(id); refresh(); }
    catch (e) { alert(e.message); }
  };

  const grouped = {};
  [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).forEach((e) => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Calendrier</h2>
      </div>

      <div className="mb-8 border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouvel événement</h3>
        <div className="grid gap-3 md:grid-cols-6">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input type="number" placeholder="Durée" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold md:col-span-2" />
          <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold">
            {ROOMS.map((r) => <option key={r.id} value={r.name} className="bg-enigmia-dark">{r.name}</option>)}
            <option className="bg-enigmia-dark">Autre</option>
          </select>
        </div>
        <button onClick={addEvent} disabled={!form.title} className="mt-3 border border-enigmia-gold bg-enigmia-gold px-6 py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold disabled:opacity-30">Ajouter</button>
      </div>

      {loading ? <p className="text-white/40">Chargement…</p> : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date}>
              <h3 className="mb-3 font-poppins text-sm font-semibold text-enigmia-gold">{formatDate(date)}</h3>
              <div className="space-y-2">
                {dayEvents.map((e) => (
                  <div key={e._id || e.id} className="flex items-center gap-4 border-l-2 border-enigmia-gold/40 bg-white/[0.02] py-3 pl-4 pr-3">
                    <div className="font-mono text-sm text-enigmia-gold">{e.time}</div>
                    <div className="flex-1">
                      <p className="font-poppins text-sm font-semibold">{e.title}</p>
                      <p className="text-xs text-white/40">{e.location} · {e.duration} min</p>
                    </div>
                    <button onClick={() => deleteEvent(e._id || e.id)} className="text-xs text-red-400/70 hover:text-red-400">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── MENTORS & SLOTS ─────────── */
function MentorsTab() {
  const [mentors, setMentors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ date: '2026-05-21', time: '10:00', duration: 15 });
  const [newMentor, setNewMentor] = useState({ username: '', displayName: '', password: '', expertise: '', avatar: '👤', bio: '' });

  const refreshMentors = useCallback(async () => {
    try {
      const data = await api.mentors.listAdmin();
      setMentors(data);
      if (!selected && data[0]) setSelected(data[0]._id || data[0].id);
    } catch (e) { console.error(e); }
  }, [selected]);

  const refreshDetails = useCallback(async () => {
    if (!selected) return;
    try {
      const [s, allBookings] = await Promise.all([
        api.mentors.slots(selected),
        api.bookings.listAll({ mentorId: selected }),
      ]);
      setSlots(s);
      setBookings(allBookings);
    } catch (e) { console.error(e); }
  }, [selected]);

  useEffect(() => { refreshMentors(); }, [refreshMentors]);
  useEffect(() => { refreshDetails(); }, [refreshDetails]);

  const addMentor = async () => {
    if (!newMentor.username || !newMentor.displayName || !newMentor.password) return;
    try { await api.mentors.create(newMentor); setNewMentor({ username: '', displayName: '', password: '', expertise: '', avatar: '👤', bio: '' }); refreshMentors(); }
    catch (e) { alert(e.message); }
  };

  const addSlot = async () => {
    try { await api.mentors.addSlot(selected, { ...form, duration: parseInt(form.duration) || 15 }); refreshDetails(); }
    catch (e) { alert(e.message); }
  };

  const toggleSlot = async (id, available) => {
    try { await api.mentors.toggleSlot(id, !available); refreshDetails(); }
    catch (e) { alert(e.message); }
  };

  const deleteSlot = async (id) => {
    if (!confirm('Supprimer ce créneau ?')) return;
    try { await api.mentors.deleteSlot(id); refreshDetails(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Mentors & créneaux</h2>
      </div>

      <details className="mb-6 border border-white/10 bg-white/[0.02] p-4">
        <summary className="cursor-pointer text-xs uppercase tracking-widest text-enigmia-gold">+ Nouveau mentor</summary>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input placeholder="Identifiant" value={newMentor.username} onChange={(e) => setNewMentor({ ...newMentor, username: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input placeholder="Nom affiché" value={newMentor.displayName} onChange={(e) => setNewMentor({ ...newMentor, displayName: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input placeholder="Mot de passe" value={newMentor.password} onChange={(e) => setNewMentor({ ...newMentor, password: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input placeholder="Expertise" value={newMentor.expertise} onChange={(e) => setNewMentor({ ...newMentor, expertise: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input placeholder="Avatar (emoji)" value={newMentor.avatar} onChange={(e) => setNewMentor({ ...newMentor, avatar: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
          <input placeholder="Bio courte" value={newMentor.bio} onChange={(e) => setNewMentor({ ...newMentor, bio: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
        </div>
        <button onClick={addMentor} className="mt-3 border border-enigmia-gold bg-enigmia-gold px-6 py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold">Ajouter le mentor</button>
      </details>

      <div className="grid gap-3 md:grid-cols-5">
        {mentors.map((m) => (
          <button key={m._id || m.id} onClick={() => setSelected(m._id || m.id)} className={`border p-4 text-left transition-colors ${selected === (m._id || m.id) ? 'border-enigmia-gold bg-enigmia-gold/10' : 'border-white/10 bg-white/[0.02] hover:border-enigmia-gold/40'}`}>
            <div className="text-2xl">{m.avatar || '👤'}</div>
            <p className="mt-2 text-sm font-semibold">{m.displayName}</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-enigmia-gold">{m.expertise}</p>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="mt-8 border border-white/10 bg-white/[0.02] p-5">
            <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouveau créneau</h3>
            <div className="grid gap-3 md:grid-cols-4">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
              <input type="number" placeholder="Durée" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold" />
              <button onClick={addSlot} className="border border-enigmia-gold bg-enigmia-gold py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold">Ajouter</button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-poppins font-semibold">Créneaux ({slots.length})</h3>
              <div className="max-h-96 space-y-1 overflow-y-auto">
                {slots.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map((s) => (
                  <div key={s._id || s.id} className={`flex items-center justify-between border px-3 py-2 text-sm ${s.available ? 'border-enigmia-gold/30 bg-enigmia-gold/[0.05]' : 'border-white/10 bg-white/[0.02] text-white/40 line-through'}`}>
                    <span className="font-mono">{formatDate(s.date)} · {s.time} ({s.duration}min)</span>
                    <div className="flex gap-2">
                      <button onClick={() => toggleSlot(s._id || s.id, s.available)} className="text-xs text-white/50 hover:text-enigmia-gold">{s.available ? 'Désactiver' : 'Activer'}</button>
                      <button onClick={() => deleteSlot(s._id || s.id)} className="text-xs text-red-400/70 hover:text-red-400">×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-poppins font-semibold">RDV réservés ({bookings.length})</h3>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {bookings.length === 0 ? <p className="text-sm text-white/40">Aucun RDV.</p> : (
                  bookings.map((b) => {
                    const room = ROOMS.find((r) => r.id === b.room);
                    return (
                      <div key={b._id || b.id} className="border border-enigmia-gold/20 bg-enigmia-gold/[0.05] p-3 text-sm">
                        <p className="font-poppins font-semibold">{b.team?.displayName || '—'}</p>
                        <p className="mt-1 text-xs text-white/50">{formatDate(b.date)} · {b.time} · {room?.icon} {room?.name}</p>
                        {b.problem && <p className="mt-1 text-xs text-white/60">→ {b.problem}</p>}
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

/* ─────────── LIVRABLES ─────────── */
function SubmissionsTab() {
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.submissions.listAll(), api.teams.list()])
      .then(([subs, ts]) => { setSubmissions(subs); setTeams(ts); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-white/40">Chargement…</p>;

  const enriched = submissions.map((s) => ({ ...s, team: teams.find((t) => (t._id || t.id) === (s.team?._id || s.team?.id || s.teamId)) || s.team }));
  const teamsWithoutSub = teams.filter((t) => !submissions.some((s) => (s.team?._id || s.team?.id || s.teamId) === (t._id || t.id)));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Livrables</h2>
        <p className="mt-1 text-sm text-white/60">Deadline : <span className="text-enigmia-gold">dimanche 24 mai, 14h</span>.</p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Stat label="Soumis" value={submissions.length} />
        <Stat label="En attente" value={teamsWithoutSub.length} />
        <Stat label="Total équipes" value={teams.length} />
      </div>

      {enriched.length === 0 ? <p className="text-sm text-white/40">Aucune soumission pour l'instant.</p> : (
        <div className="space-y-3">
          {enriched.map((s) => (
            <div key={s._id || s.id} className="border border-enigmia-gold/20 bg-enigmia-gold/[0.03] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-poppins text-lg font-semibold">{s.team?.displayName || '—'}</p>
                  <p className="mt-2 break-all text-sm">
                    <span className="text-white/40">URL : </span>
                    <a href={s.projectUrl} target="_blank" rel="noreferrer" className="text-enigmia-gold underline hover:text-white">{s.projectUrl}</a>
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="text-white/40">Pitch : </span>
                    <a href={api.submissions.pitchUrl(s._id || s.id)} target="_blank" rel="noreferrer" className="text-enigmia-gold underline hover:text-white">📄 {s.pitchOriginalName || s.pitchFilename}</a>
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-white/50">
                  Soumis<br />{new Date(s.submittedAt || s.updatedAt).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {teamsWithoutSub.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-red-400/80">Équipes sans livrable ({teamsWithoutSub.length})</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {teamsWithoutSub.map((t) => (
              <div key={t._id || t.id} className="border border-red-500/20 bg-red-500/[0.03] px-4 py-2 text-sm">{t.displayName}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className="mt-2 font-poppins text-2xl font-bold text-enigmia-gold">{value}</p>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
