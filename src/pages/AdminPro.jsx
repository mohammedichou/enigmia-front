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
  { id: 'settings', label: 'Paramètres' },
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
        {tab === 'settings' && <SettingsTab />}
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

  const changePassword = async (id, name) => {
    const pwd = prompt(`Nouveau mot de passe pour "${name}" :`);
    if (!pwd) return;
    if (pwd.length < 4) { alert('4 caractères minimum.'); return; }
    try {
      await api.teams.update(id, { password: pwd });
      alert('Mot de passe mis à jour ✓');
    } catch (e) { alert(e.message); }
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
                    <div className="flex justify-end gap-3">
                      <button onClick={() => changePassword(t._id || t.id, t.displayName)} className="text-xs text-white/50 hover:text-enigmia-gold">🔑 Mot de passe</button>
                      <button onClick={() => deleteTeam(t._id || t.id)} className="text-xs text-red-400/70 hover:text-red-400">Supprimer</button>
                    </div>
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
const RES_TYPES = [
  { id: 'pdf',   label: 'PDF',           icon: '📄' },
  { id: 'link',  label: 'Lien externe',  icon: '🔗' },
  { id: 'video', label: 'Vidéo YouTube', icon: '▶️' },
];

function DocumentsTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('pdf');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setDocs(await api.documents.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const reset = () => { setTitle(''); setFile(null); setUrl(''); };

  const submit = async () => {
    if (!title) return;
    setSubmitting(true);
    try {
      if (type === 'pdf') {
        if (!file) { alert('Sélectionnez un fichier PDF.'); return; }
        await api.documents.upload(title, file);
      } else {
        if (!url.startsWith('http')) { alert('URL invalide (doit commencer par http).'); return; }
        if (type === 'video' && !/youtube\.com|youtu\.be/.test(url)) {
          alert('Vidéo : merci de coller un lien YouTube.');
          return;
        }
        await api.documents.addLink({ title, type, url });
      }
      reset();
      refresh();
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    try { await api.documents.delete(id); refresh(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Ressources pédagogiques</h2>
        <p className="mt-1 text-sm text-white/60">PDFs, liens externes ou vidéos YouTube — visibles côté équipe.</p>
      </div>

      <div className="mb-8 border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-enigmia-gold">+ Nouvelle ressource</h3>

        <div className="mb-4 flex gap-2">
          {RES_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setType(t.id); setFile(null); setUrl(''); }}
              className={`flex items-center gap-2 border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                type === t.id
                  ? 'border-enigmia-gold bg-enigmia-gold/10 text-enigmia-gold'
                  : 'border-white/15 text-white/50 hover:border-enigmia-gold/40 hover:text-white'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <input
            placeholder="Titre de la ressource"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold md:col-span-2"
          />

          {type === 'pdf' ? (
            <label className="flex cursor-pointer items-center justify-center border border-dashed border-white/20 px-3 py-2 text-sm text-white/60 hover:border-enigmia-gold hover:text-enigmia-gold">
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
              {file ? `📄 ${file.name}` : '📎 Choisir PDF'}
            </label>
          ) : (
            <input
              type="url"
              placeholder={type === 'video' ? 'https://youtu.be/…' : 'https://…'}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
            />
          )}

          <button
            onClick={submit}
            disabled={submitting || !title || (type === 'pdf' ? !file : !url)}
            className="border border-enigmia-gold bg-enigmia-gold py-2 text-xs font-semibold uppercase tracking-widest text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold disabled:opacity-30"
          >
            {submitting ? 'Envoi…' : 'Ajouter'}
          </button>
        </div>
      </div>

      {loading ? <p className="text-white/40">Chargement…</p> : docs.length === 0 ? (
        <p className="text-sm text-white/40">Aucune ressource.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => {
            const t = doc.type || 'pdf';
            const meta = RES_TYPES.find((x) => x.id === t) || RES_TYPES[0];
            return (
              <div key={doc._id || doc.id} className="flex items-center gap-4 border border-white/10 bg-white/[0.02] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-enigmia-gold/10 text-base text-enigmia-gold">{meta.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-poppins text-sm font-semibold">{doc.title}</p>
                  <p className="truncate text-xs text-white/40">
                    {t === 'pdf'
                      ? `${doc.originalName || doc.filename}${doc.size ? ` · ${Math.round(doc.size / 1024)} KB` : ''}`
                      : doc.url}
                  </p>
                </div>
                {t === 'pdf' ? (
                  <button
                    onClick={async () => {
                      try { await api.documents.download(doc._id || doc.id, doc.originalName || doc.filename); }
                      catch (e) { alert(`Téléchargement impossible : ${e.message}`); }
                    }}
                    className="text-xs text-enigmia-gold hover:underline"
                  >Télécharger</button>
                ) : (
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-enigmia-gold hover:underline">
                    Ouvrir →
                  </a>
                )}
                <button onClick={() => remove(doc._id || doc.id)} className="text-xs text-red-400/70 hover:text-red-400">Supprimer</button>
              </div>
            );
          })}
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

  const deleteMentor = async (id, name) => {
    if (!confirm(`Supprimer le mentor "${name}" ? Cela supprimera ses créneaux et annulera ses RDV.`)) return;
    try {
      await api.mentors.delete(id);
      if (selected === id) setSelected(null);
      refreshMentors();
    } catch (e) { alert(e.message); }
  };

  const changeMentorPassword = async (id, name) => {
    const pwd = prompt(`Nouveau mot de passe pour le mentor "${name}" :`);
    if (!pwd) return;
    if (pwd.length < 4) { alert('4 caractères minimum.'); return; }
    try {
      await api.mentors.update(id, { password: pwd });
      alert('Mot de passe du mentor mis à jour ✓');
    } catch (e) { alert(e.message); }
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
        {mentors.map((m) => {
          const mid = m._id || m.id;
          return (
            <div
              key={mid}
              onClick={() => setSelected(mid)}
              className={`relative cursor-pointer border p-4 transition-colors ${selected === mid ? 'border-enigmia-gold bg-enigmia-gold/10' : 'border-white/10 bg-white/[0.02] hover:border-enigmia-gold/40'}`}
            >
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); changeMentorPassword(mid, m.displayName); }}
                  className="text-xs text-white/40 hover:text-enigmia-gold"
                  title="Changer le mot de passe"
                >
                  🔑
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMentor(mid, m.displayName); }}
                  className="text-xs text-red-400/60 hover:text-red-400"
                  title="Supprimer ce mentor"
                >
                  ✕
                </button>
              </div>
              <div className="text-2xl">{m.avatar || '👤'}</div>
              <p className="mt-2 text-sm font-semibold">{m.displayName}</p>
              <p className="text-[0.65rem] uppercase tracking-widest text-enigmia-gold">{m.expertise}</p>
              <p className="mt-1 font-mono text-[0.65rem] text-white/40">@{m.username}</p>
            </div>
          );
        })}
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
                    <button
                      onClick={async () => {
                        try { await api.submissions.downloadPitch(s._id || s.id, s.pitchOriginalName || s.pitchFilename); }
                        catch (e) { alert(`Téléchargement impossible : ${e.message}`); }
                      }}
                      className="text-enigmia-gold underline hover:text-white"
                    >📄 {s.pitchOriginalName || s.pitchFilename}</button>
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

/* ─────────── PARAMÈTRES ─────────── */
function SettingsTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.settings.get()
      .then((s) => setSettings(s || { hackathonLaunched: false }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleLaunch = async () => {
    const next = !settings.hackathonLaunched;
    if (next && !confirm('Activer le lancement ? Le bouton "Lancer le hackathon" deviendra visible par tous les visiteurs de la landing page.')) return;
    if (!next && !confirm('Désactiver le lancement ? Le bouton disparaîtra de la landing page.')) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.settings.update({ hackathonLaunched: next });
      setSettings(updated || { ...settings, hackathonLaunched: next });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-white/40">Chargement…</p>;
  if (!settings) return <p className="text-red-400">{error || 'Erreur de chargement'}</p>;

  const launched = settings.hackathonLaunched;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-poppins text-2xl font-bold">Paramètres</h2>
        <p className="mt-1 text-sm text-white/60">Contrôles globaux de l'événement.</p>
      </div>

      <div className="border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="font-poppins text-lg font-semibold">Lancement du hackathon</h3>
            <p className="mt-2 text-sm text-white/60">
              Quand c'est activé, un bouton <span className="text-enigmia-gold">« ⚡ Lancer le hackathon »</span> apparaît sur la page d'accueil pour tous les visiteurs et mène à l'escape game.
            </p>
            <p className="mt-3 text-xs uppercase tracking-widest">
              Statut actuel :{' '}
              <span className={launched ? 'text-enigmia-gold' : 'text-white/40'}>
                {launched ? '● Activé — bouton visible' : '○ Désactivé — bouton caché'}
              </span>
            </p>
          </div>

          <button
            onClick={toggleLaunch}
            disabled={saving}
            className={`relative h-9 w-16 shrink-0 rounded-full border transition-colors disabled:opacity-50 ${
              launched ? 'border-enigmia-gold bg-enigmia-gold/30' : 'border-white/20 bg-white/5'
            }`}
            aria-label="Toggle lancement hackathon"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full transition-all ${
                launched ? 'left-8 bg-enigmia-gold' : 'left-1 bg-white/40'
              }`}
            />
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            onClick={toggleLaunch}
            disabled={saving}
            className={`border px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] transition-colors disabled:opacity-50 ${
              launched
                ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                : 'border-enigmia-gold bg-enigmia-gold text-enigmia-dark hover:bg-transparent hover:text-enigmia-gold'
            }`}
          >
            {saving ? 'Enregistrement…' : launched ? 'Désactiver le lancement' : '⚡ Lancer le hackathon'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
