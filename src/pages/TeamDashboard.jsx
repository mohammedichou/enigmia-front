import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROOMS, COST_PER_BOOKING } from '../data/dashboard';
import { api, getAuth, setAuth } from '../api';

const TABS = [
  { id: 'challenge', label: 'Épreuve', icon: '⚑' },
  { id: 'rules', label: 'Règlement intérieur', icon: '§' },
  { id: 'chillroom', label: 'Chill Room — Débloquer un mentor', icon: '⚄' },
  { id: 'overview', label: 'Vue d\'ensemble', icon: '⌘' },
  { id: 'calendar', label: 'Calendrier', icon: '◷' },
  { id: 'resources', label: 'Ressources pédagogiques', icon: '◫' },
  { id: 'mentors', label: 'Mentors', icon: '◉' },
  { id: 'bookings', label: 'Mes RDV', icon: '✓' },
  { id: 'submission', label: 'Votre livrable finalisé', icon: '⏏' },
];

export default function TeamDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('challenge');
  const [bookingMentor, setBookingMentor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    const a = getAuth();
    if (!a || a.role !== 'team') {
      navigate('/login');
      return;
    }
    api.auth.me()
      .then((data) => setMe(data.user || data))
      .catch(() => {
        setAuth(null);
        navigate('/login');
      });
  }, [navigate, refreshKey]);

  const logout = () => {
    setAuth(null);
    navigate('/login');
  };

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-enigmia-dark font-inter text-white/40">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-enigmia-dark font-inter text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-black/30 p-6 md:flex md:flex-col">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-enigmia-gold">// Équipe</p>
            <h2 className="mt-1 font-poppins text-lg font-bold leading-tight">
              {me.displayName}
            </h2>
          </div>

          <PointsCard points={me.points || 0} className="mt-6" />

          <nav className="mt-8 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-xs transition-colors ${
                  tab === t.id
                    ? 'bg-enigmia-gold/10 text-enigmia-gold'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-2 pt-6">
            <Link to="/" className="block text-xs text-white/40 hover:text-white">
              ← Retour au site
            </Link>
            <button
              onClick={logout}
              className="text-xs uppercase tracking-widest text-white/40 hover:text-red-400"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6 md:p-10">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-enigmia-gold">// Équipe</p>
              <h2 className="font-poppins text-base font-bold">{me.displayName}</h2>
            </div>
            <PointsBadge points={me.points || 0} />
          </div>
          <div className="mb-6 flex gap-1 overflow-x-auto md:hidden">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs ${
                  tab === t.id ? 'bg-enigmia-gold text-enigmia-dark' : 'bg-white/5 text-white/70'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'challenge' && <ChallengeTab />}
          {tab === 'rules' && <RulesTab />}
          {tab === 'chillroom' && <ChillRoomTab />}
          {tab === 'overview' && <Overview team={me} onSwitch={setTab} />}
          {tab === 'calendar' && <CalendarTab />}
          {tab === 'resources' && <ResourcesTab />}
          {tab === 'mentors' && (
            <MentorsTab onBook={(m) => setBookingMentor(m)} teamPoints={me.points || 0} />
          )}
          {tab === 'bookings' && <BookingsTab />}
          {tab === 'submission' && <SubmissionTab />}
        </main>
      </div>

      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          team={me}
          onClose={() => setBookingMentor(null)}
          onSuccess={() => {
            setBookingMentor(null);
            refresh();
            setTab('bookings');
          }}
        />
      )}
    </div>
  );
}

/* ─────── Overview ─────── */
function Overview({ team, onSwitch }) {
  const [data, setData] = useState({ events: [], bookings: [], docs: [] });

  useEffect(() => {
    Promise.all([api.events.list(), api.bookings.listTeam(), api.documents.list()])
      .then(([events, bookings, docs]) => setData({ events, bookings, docs }))
      .catch(console.error);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = data.events.filter((e) => e.date === today);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Dashboard</p>
        <h1 className="mt-2 font-poppins text-3xl font-bold md:text-4xl">
          Bonjour, équipe <span className="text-enigmia-gold">{team.displayName}</span>
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Solde de points" value={team.points || 0} sub="utilisables pour les RDV mentors" />
        <StatCard label="RDV pris" value={data.bookings.length} sub={`${data.bookings.length * COST_PER_BOOKING} pts dépensés`} />
        <StatCard label="Ressources" value={data.docs.length} sub="documents disponibles" />
      </div>

      <Section
        title={`Aujourd'hui · ${formatDate(today)}`}
        action={<button onClick={() => onSwitch('calendar')} className="text-xs text-enigmia-gold hover:underline">Voir le planning →</button>}
      >
        {todayEvents.length === 0 ? (
          <p className="text-sm text-white/50">Aucun événement aujourd'hui.</p>
        ) : (
          <div className="space-y-2">
            {todayEvents.map((e) => <EventRow key={e._id || e.id} event={e} />)}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ─────── Calendar ─────── */
function CalendarTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.events.list().then(setEvents).catch(console.error).finally(() => setLoading(false));
  }, []);

  const days = useMemo(() => {
    const dates = [...new Set(events.map((e) => e.date))].sort();
    return dates.map((d) => ({
      date: d,
      events: events.filter((e) => e.date === d).sort((a, b) => a.time.localeCompare(b.time)),
    }));
  }, [events]);

  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Calendrier</p>
      <h1 className="mt-2 mb-8 font-poppins text-3xl font-bold">Planning du hackathon</h1>
      {loading ? (
        <p className="text-white/40">Chargement…</p>
      ) : (
        <div className="space-y-8">
          {days.map((d) => (
            <div key={d.date}>
              <h3 className="mb-3 font-poppins text-base font-semibold text-enigmia-gold">{formatDate(d.date)}</h3>
              <div className="space-y-2">
                {d.events.map((e) => <EventRow key={e._id || e.id} event={e} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────── Resources ─────── */
function ResourcesTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.documents.list().then(setDocs).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Ressources pédagogiques</p>
      <h1 className="mt-2 mb-8 font-poppins text-3xl font-bold">Ressources pédagogiques</h1>
      <p className="mb-6 text-sm text-white/60">
        Contenus mobilisables pendant le hackathon. <span className="text-enigmia-gold">L'autonomie consiste à choisir ses ressources.</span>
      </p>

      {loading ? (
        <p className="text-white/40">Chargement…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-white/50">Aucune ressource disponible pour le moment.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {docs.map((doc) => (
            <ResourceCard key={doc._id || doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

function getYouTubeId(url = '') {
  const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return m ? m[1] : null;
}

function ResourceCard({ doc }) {
  const type = doc.type || 'pdf';

  if (type === 'video') {
    const id = getYouTubeId(doc.url);
    const thumb = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
    return (
      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-4 border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-enigmia-gold/40"
      >
        <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-black">
          {thumb ? (
            <img src={thumb} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-enigmia-gold/60">▶</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/60 px-2 py-1 text-xs text-enigmia-gold">▶</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-poppins text-sm font-semibold">{doc.title}</p>
          <p className="text-xs text-white/40">Vidéo YouTube · clique pour ouvrir →</p>
        </div>
      </a>
    );
  }

  if (type === 'link') {
    return (
      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-4 border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-enigmia-gold/40"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-enigmia-gold/10 text-xl text-enigmia-gold">🔗</div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-poppins text-sm font-semibold">{doc.title}</p>
          <p className="truncate text-xs text-white/40">{doc.url}</p>
        </div>
        <span className="shrink-0 text-xs uppercase tracking-widest text-enigmia-gold">Ouvrir →</span>
      </a>
    );
  }

  // PDF (default)
  return (
    <div className="group flex items-center gap-4 border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-enigmia-gold/40">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-enigmia-gold/10 text-xl text-enigmia-gold">⎙</div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-poppins text-sm font-semibold">{doc.title}</p>
        <p className="text-xs text-white/40">
          {doc.originalName || doc.filename}
          {doc.size ? ` · ${Math.round(doc.size / 1024)} KB` : ''}
          {doc.uploadedAt ? ` · ${formatDate(doc.uploadedAt.slice(0, 10))}` : ''}
        </p>
      </div>
      <button
        onClick={async () => {
          try { await api.documents.download(doc._id || doc.id, doc.originalName || doc.filename); }
          catch (e) { alert(`Téléchargement impossible : ${e.message}`); }
        }}
        className="shrink-0 border border-enigmia-gold/40 px-3 py-1.5 text-xs uppercase tracking-widest text-enigmia-gold transition-colors hover:bg-enigmia-gold hover:text-enigmia-dark"
      >
        Télécharger
      </button>
    </div>
  );
}

/* ─────── Mentors ─────── */
function MentorsTab({ onBook, teamPoints }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.mentors.list().then(setMentors).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Mentors</p>
        <h1 className="mt-2 font-poppins text-3xl font-bold">Réserver un RDV mentor</h1>
        <p className="mt-2 text-sm text-white/60">
          <span className="text-enigmia-gold">{COST_PER_BOOKING} pts</span> = 15 min · choisis ton mentor + room
        </p>
      </div>

      {loading ? (
        <p className="text-white/40">Chargement…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => {
            const available = mentor.availableSlots ?? mentor.slotsAvailable ?? 0;
            const canAfford = teamPoints >= COST_PER_BOOKING;
            return (
              <div
                key={mentor._id || mentor.id}
                className="flex flex-col border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-enigmia-gold/40"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{mentor.avatar || '👤'}</div>
                  <div>
                    <h3 className="font-poppins font-semibold">{mentor.displayName}</h3>
                    <p className="mt-0.5 text-xs uppercase tracking-widest text-enigmia-gold">{mentor.expertise}</p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm text-white/60">{mentor.bio}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                  <span>{available} créneau(x) dispo</span>
                  <span>{COST_PER_BOOKING} pts / 15 min</span>
                </div>
                <button
                  onClick={() => onBook(mentor)}
                  disabled={!canAfford}
                  className="mt-4 border border-enigmia-gold py-2 text-xs uppercase tracking-widest text-enigmia-gold transition-colors hover:bg-enigmia-gold hover:text-enigmia-dark disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30 disabled:hover:bg-transparent"
                >
                  {!canAfford ? 'Solde insuffisant' : 'Réserver →'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────── Bookings ─────── */
function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bookings.listTeam().then(setBookings).catch(console.error).finally(() => setLoading(false));
  }, []);

  const sorted = [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Mes RDV</p>
      <h1 className="mt-2 mb-8 font-poppins text-3xl font-bold">Rendez-vous mentors</h1>

      {loading ? (
        <p className="text-white/40">Chargement…</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-white/50">Tu n'as encore aucun RDV.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((b) => {
            const mentor = b.mentor || {};
            const room = ROOMS.find((r) => r.id === b.room);
            return (
              <div key={b._id || b.id} className="border border-enigmia-gold/20 bg-enigmia-gold/[0.03] p-5">
                <div className="flex items-start gap-5">
                  <div className="text-3xl">{mentor.avatar || '👤'}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-poppins font-semibold">{mentor.displayName}</p>
                    <p className="text-xs text-enigmia-gold">{mentor.expertise}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {formatDate(b.date)} · {b.time} · {b.duration} min · {room?.icon} {room?.name}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-lg text-enigmia-gold">−{b.cost} pts</p>
                  </div>
                </div>
                {(b.expertise || b.problem) && (
                  <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-xs">
                    {b.expertise && <p><span className="text-white/40">Expertise : </span><span className="text-white/80">{b.expertise}</span></p>}
                    {b.problem && <p><span className="text-white/40">Problématique : </span><span className="text-white/80">{b.problem}</span></p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────── Submission ─────── */
function SubmissionTab() {
  const [existing, setExisting] = useState(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [file, setFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.submissions.me()
      .then((s) => {
        if (s) {
          setExisting(s);
          setProjectUrl(s.projectUrl || '');
        }
      })
      .catch(() => setExisting(null))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!projectUrl) return;
    if (!existing && !file) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await api.submissions.upsert({ projectUrl, pitchFile: file });
      setExisting(result);
      setFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-white/40">Chargement…</p>;

  return (
    <div className="max-w-2xl">
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Livrable</p>
      <h1 className="mt-2 mb-2 font-poppins text-3xl font-bold">Votre livrable finalisé</h1>
      <p className="mb-8 text-sm text-white/60">
        Déposez l'URL de votre projet et le PDF de votre pitch. Vous pouvez modifier votre soumission jusqu'à la deadline.
      </p>

      {existing && (
        <div className="mb-6 border border-enigmia-gold/30 bg-enigmia-gold/[0.05] p-4 text-sm">
          <p className="text-xs uppercase tracking-widest text-enigmia-gold">Soumission actuelle</p>
          <p className="mt-2 break-all text-white/80">
            URL : <a href={existing.projectUrl} target="_blank" rel="noreferrer" className="text-enigmia-gold underline">{existing.projectUrl}</a>
          </p>
          <p className="text-white/80">PDF : {existing.pitchOriginalName || existing.pitchFilename}</p>
          <p className="mt-2 text-xs text-white/50">Mis à jour : {existing.updatedAt && new Date(existing.updatedAt).toLocaleString('fr-FR')}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/60">URL du projet</label>
          <input
            type="url"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="https://github.com/votre-equipe/projet"
            className="mt-2 w-full border-b border-enigmia-gold/30 bg-transparent py-2 text-sm outline-none transition-colors focus:border-enigmia-gold"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-white/60">PDF du pitch</label>
          <label className="mt-2 flex cursor-pointer items-center justify-between border border-dashed border-white/20 px-4 py-3 text-sm text-white/70 hover:border-enigmia-gold hover:text-enigmia-gold">
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
            <span>{file ? `📄 ${file.name}` : existing ? '📎 Remplacer le PDF (optionnel)' : '📎 Choisir un fichier PDF'}</span>
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          {saved ? (
            <p className="text-sm text-enigmia-gold">✓ Soumission enregistrée</p>
          ) : (
            <p className="text-xs text-white/40">Visible immédiatement par les organisateurs.</p>
          )}
          <button
            type="submit"
            disabled={submitting || !projectUrl || (!existing && !file)}
            className="border border-enigmia-gold bg-enigmia-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-enigmia-dark transition-colors hover:bg-transparent hover:text-enigmia-gold disabled:cursor-not-allowed disabled:opacity-30"
          >
            {submitting ? 'Envoi…' : existing ? 'Mettre à jour' : 'Soumettre'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────── Booking Modal ─────── */
function BookingModal({ mentor, team, onClose, onSuccess }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [expertise, setExpertise] = useState(mentor.expertise || '');
  const [problem, setProblem] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.mentors.slots(mentor._id || mentor.id)
      .then((data) => setSlots(data.filter((s) => s.available !== false)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [mentor]);

  const slotsByDay = useMemo(() => {
    const map = {};
    slots.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [slots]);

  const confirm = async () => {
    if (!selectedSlot || !selectedRoom || !problem.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.bookings.create({
        slotId: selectedSlot._id || selectedSlot.id,
        room: selectedRoom,
        expertise: expertise.trim(),
        problem: problem.trim(),
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto border border-enigmia-gold/30 bg-enigmia-dark p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{mentor.avatar || '👤'}</div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-enigmia-gold">// Réservation</p>
              <h2 className="font-poppins text-2xl font-bold">{mentor.displayName}</h2>
              <p className="text-xs uppercase tracking-widest text-enigmia-gold">{mentor.expertise}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-xl text-white/40 hover:text-white">×</button>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-white/60">1 · Choisis un créneau</h3>
          {loading ? (
            <p className="text-white/40">Chargement des créneaux…</p>
          ) : slots.length === 0 ? (
            <p className="text-white/40">Aucun créneau disponible pour ce mentor.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(slotsByDay).map(([date, daySlots]) => (
                <div key={date}>
                  <p className="mb-2 text-xs text-enigmia-gold">{formatDate(date)}</p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => (
                      <button
                        key={s._id || s.id}
                        onClick={() => setSelectedSlot(s)}
                        className={`border px-3 py-1.5 font-mono text-sm transition-colors ${
                          (selectedSlot?._id || selectedSlot?.id) === (s._id || s.id)
                            ? 'border-enigmia-gold bg-enigmia-gold text-enigmia-dark'
                            : 'border-white/20 text-white/70 hover:border-enigmia-gold/50 hover:text-white'
                        }`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-white/60">2 · Type d'expertise recherchée</h3>
          <input
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="ex : Machine Learning, API, front, data…"
            className="w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-white/60">3 · Décris ta problématique concrète</h3>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={3}
            placeholder="Sur quoi tu bloques ?"
            className="w-full resize-none border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-enigmia-gold"
          />
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-white/60">4 · Choisis une room</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ROOMS.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`flex flex-col items-center border p-4 transition-colors ${
                  selectedRoom === room.id
                    ? 'border-enigmia-gold bg-enigmia-gold/10'
                    : 'border-white/15 hover:border-enigmia-gold/40'
                }`}
              >
                <span className="text-3xl">{room.icon}</span>
                <span className="mt-2 font-poppins text-sm font-semibold">{room.name}</span>
                <span className="mt-1 text-[0.65rem] text-white/40">{room.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <div className="text-sm text-white/60">
            Coût : <span className="text-enigmia-gold">{COST_PER_BOOKING} pts</span>
            {' · '}
            Solde après : <span className={(team.points || 0) - COST_PER_BOOKING >= 0 ? 'text-white' : 'text-red-400'}>
              {(team.points || 0) - COST_PER_BOOKING} pts
            </span>
          </div>
          <button
            onClick={confirm}
            disabled={submitting || !selectedSlot || !selectedRoom || !problem.trim()}
            className="border border-enigmia-gold bg-enigmia-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-enigmia-dark transition-colors hover:bg-transparent hover:text-enigmia-gold disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/30 disabled:hover:bg-white/5"
          >
            {submitting ? 'Réservation…' : 'Confirmer la réservation'}
          </button>
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

/* ─────── UI helpers ─────── */
function StatCard({ label, value, sub }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className="mt-2 font-poppins text-3xl font-bold text-enigmia-gold">{value}</p>
      <p className="mt-1 text-xs text-white/40">{sub}</p>
    </div>
  );
}

function PointsCard({ points, className = '' }) {
  return (
    <div className={`border border-enigmia-gold/30 bg-enigmia-gold/[0.05] p-4 ${className}`}>
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-enigmia-gold">Solde</p>
      <p className="mt-1 font-poppins text-2xl font-bold text-enigmia-gold">{points} pts</p>
    </div>
  );
}

function PointsBadge({ points }) {
  return (
    <div className="rounded border border-enigmia-gold/30 bg-enigmia-gold/10 px-3 py-1.5">
      <span className="font-mono text-sm text-enigmia-gold">{points} pts</span>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-poppins text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

function EventRow({ event }) {
  return (
    <div className="flex items-center gap-4 border-l-2 border-enigmia-gold/40 bg-white/[0.02] py-3 pl-4 pr-3">
      <div className="font-mono text-sm text-enigmia-gold">{event.time}</div>
      <div className="flex-1">
        <p className="font-poppins text-sm font-semibold">{event.title}</p>
        <p className="text-xs text-white/40">{event.location} · {event.duration} min</p>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ─────── Static content (Règlement & Épreuve) ─────── */
function RulesTab() {
  return (
    <div className="max-w-4xl">
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Règlement</p>
      <h1 className="mt-2 mb-2 font-poppins text-3xl font-bold">Règlement intérieur</h1>
      <p className="mb-10 text-sm italic text-white/60">Hackathon EnigmIA — Espace d'expérimentation, de création et de collaboration.</p>

      <Block title="Esprit général">
        <p>Le hackathon EnigmIA est un espace d'expérimentation, de création et de collaboration. Il repose sur un équilibre entre <strong className="text-enigmia-gold">liberté d'exploration</strong>, <strong className="text-enigmia-gold">exigence collective</strong> et <strong className="text-enigmia-gold">responsabilité individuelle</strong>.</p>
      </Block>

      <Block title="Valeurs">
        <ValuesGrid items={[
          { label: 'Respect', desc: 'des personnes, des idées, des rythmes et des espaces' },
          { label: 'Fun', desc: 'apprendre, tester, se tromper et recommencer avec plaisir' },
          { label: 'Exigence', desc: 'viser la qualité, aller au bout des idées, challenger sans détruire' },
          { label: 'Autonomie', desc: 'prendre des initiatives, s\'organiser, faire des choix' },
        ]} />
      </Block>

      <Block title="Règles de vie">
        <ul className="space-y-2 text-sm text-white/80">
          <Li>Bienveillance et tolérance dans les échanges</Li>
          <Li>Droit à l'erreur garanti</Li>
          <Li>Respect des différences de niveau, de posture et d'expression</Li>
          <Li>Capacité à débattre sans imposer</Li>
        </ul>
      </Block>

      <Block title="Espaces & usages">
        <p className="mb-4 text-sm text-white/70">Les espaces sont librement accessibles, dans le respect des autres participants.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <RoomCard icon="🛋️" name="Chill Room" lines={['Espace de détente, de jeux', 'C\'est ici que vous gagnez les points techniques pour débloquer les mentors', '20 pts = 1 RDV mentor (15 min)']} />
          <RoomCard icon="🎨" name="Creative Room" lines={['Espace dédié à la créativité', 'Idéal pour débloquer une idée ou prototyper autrement']} />
          <RoomCard icon="💻" name="Tech Room" lines={['Espace d\'échange avec les mentors', 'Discussions techniques, résolution de problèmes, accompagnement expert']} />
          <RoomCard icon="🎤" name="Pitch Room" lines={['Espace réservable pour travailler la présentation', 'Entraînement, feedback, structuration du pitch']} />
        </div>
        <p className="mt-4 text-xs text-white/50">ⓘ Certains espaces peuvent être signalés comme silencieux — merci de respecter ce cadre.</p>
      </Block>

      <Block title="Respect des lieux">
        <ul className="space-y-2 text-sm text-white/80">
          <Li>Les espaces doivent être laissés dans l'état dans lequel vous les avez trouvés</Li>
          <Li>Le matériel est partagé → usage responsable attendu</Li>
        </ul>
      </Block>

      <Block title="Déroulé du hackathon">
        <ul className="space-y-2 text-sm text-white/80">
          <Li><strong className="text-enigmia-gold">Jeudi 21 — 10h</strong> · lancement + escape game</Li>
          <Li><strong className="text-enigmia-gold">Vendredi 22 — Samedi 23</strong> · compétition, tests techniques, accès aux mentors</Li>
          <Li><strong className="text-enigmia-gold">Dimanche 24 — 14h</strong> · rendu des livrables (URL projet + PDF pitch)</Li>
          <Li><strong className="text-enigmia-gold">Dimanche 24 — 16h</strong> · pitchs finaux</Li>
        </ul>
      </Block>

      <Block title="Attendus">
        <ul className="space-y-2 text-sm text-white/80">
          <Li>Une proposition fonctionnelle et démontrable</Li>
          <Li>Un pitch clair, structuré et impactant</Li>
          <Li>Une capacité à expliquer vos choix (techniques et métier)</Li>
        </ul>
      </Block>

      <div className="mt-12 border border-enigmia-gold/30 bg-enigmia-gold/[0.05] p-6 text-center">
        <p className="font-poppins text-xl font-bold uppercase tracking-widest text-enigmia-gold">Que la meilleure équipe gagne</p>
      </div>
    </div>
  );
}

function ChallengeTab() {
  return (
    <div className="max-w-4xl">
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Épreuve</p>
      <h1 className="mt-2 mb-2 font-poppins text-3xl font-bold">L'épreuve</h1>
      <p className="mb-10 text-sm italic text-white/60">Nous sommes en 2035…</p>

      <Block title="Contexte">
        <p>Depuis plusieurs années, les intelligences artificielles sont devenues des outils incontournables de création culturelle.</p>
        <p className="mt-3"><strong className="text-enigmia-gold">Mais quelque chose a dérapé.</strong></p>
        <p className="mt-3">Une IA malveillante, connue sous le nom de <strong className="text-red-400">KDR</strong>, a infiltré encore une fois de plus le système ENIGMIA.</p>
        <p className="mt-3 text-white/60">Son objectif n'est pas de détruire la culture. KDR <em>optimise. standardise. lisse.</em></p>
      </Block>

      <Block title="Votre mission">
        <p className="text-sm text-white/80">Vous n'êtes pas là pour détruire l'IA. Vous devez apprendre à coexister avec elle.</p>
        <ul className="mt-4 space-y-2 text-sm text-white/80">
          <Li>Comprendre comment KDR manipule les contenus</Li>
          <Li>Identifier ce qui fait l'essence d'une culture vivante</Li>
          <Li>Concevoir des usages de l'IA qui préservent la diversité sans bloquer l'innovation</Li>
        </ul>
      </Block>

      <Block title="Domaines d'intervention (1 seul à choisir)">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {['🍽️ Gastronomie', '⚽ Sport', '🎬 Cinéma', '🎭 Art'].map((d) => (
            <div key={d} className="border border-enigmia-gold/30 bg-enigmia-gold/[0.05] p-4 text-center text-sm">{d}</div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/50">Art = musique, design, mode, artisanat</p>
      </Block>

      <Block title="Mission technique">
        <p className="text-sm text-white/80">Concevoir un <strong className="text-enigmia-gold">prototype fonctionnel (MVP)</strong> capable de résister aux logiques de KDR.</p>
        <p className="mt-3 text-sm font-semibold text-enigmia-gold">Obligatoire :</p>
        <ul className="mt-2 space-y-2 text-sm text-white/80">
          <Li>Une <strong>composante IA</strong> (générative, prédictive, adaptative…)</Li>
          <Li>Une <strong>solution technique utilisable</strong></Li>
        </ul>
      </Block>

      <Block title="Question clé du jury">
        <div className="border-l-4 border-enigmia-gold bg-enigmia-gold/[0.05] p-5 italic text-white/90">
          "Votre solution protège-t-elle la culture… ou participe-t-elle, même inconsciemment, à sa standardisation ?"
        </div>
      </Block>

      <Block title="Accès aux mentors techniques">
        <p className="text-sm text-white/80">Pour débloquer un mentor, votre équipe devra accumuler <strong className="text-enigmia-gold">20 points techniques</strong>.</p>
        <p className="mt-3 text-sm text-white/70">Ces points se gagnent à la <strong className="text-enigmia-gold">Chill Room</strong>.</p>
      </Block>

      <Block title="Critères d'évaluation">
        <div className="space-y-3">
          {[
            { pct: '60 %', title: 'Performance technique', desc: 'Solution fonctionnelle, pertinente et intégrant réellement l\'IA' },
            { pct: '25 %', title: 'Intelligence collective', desc: 'Collaboration, répartition des rôles, prise de décision' },
            { pct: '15 %', title: 'Pitch & storytelling', desc: 'Clarté, force narrative' },
          ].map((c) => (
            <div key={c.title} className="flex items-center gap-5 border border-white/10 bg-white/[0.02] p-4">
              <div className="font-poppins text-2xl font-bold text-enigmia-gold">{c.pct}</div>
              <div>
                <p className="font-poppins font-semibold">{c.title}</p>
                <p className="text-xs text-white/60">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Livrables attendus">
        <p className="text-sm text-white/80">À déposer dans l'onglet "Votre livrable finalisé" avant <strong className="text-enigmia-gold">dimanche 24 mai, 14h</strong> :</p>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <Li>L'<strong>URL du projet</strong> (repo Git, démo en ligne, organisation…)</Li>
          <Li>Le <strong>PDF du pitch</strong></Li>
        </ul>
      </Block>
    </div>
  );
}

/* ─────── Chill Room — Débloquer un mentor ─────── */
function ChillRoomTab() {
  const bareme = [
    ['Rubik\'s Cube', 'Résoudre le cube', '3 pts'],
    ['Code cadenas dates', 'Trouver le bon code', '3 pts'],
    ['Fléchettes', 'Réussir le défi fixé par l\'animateur', '3 pts'],
    ['Jeu de dames', 'Gagner une partie', '3 pts'],
    ['Domino', 'Gagner 3 parties', '5 pts'],
    ['Mikado', 'Gagner 3 parties', '5 pts'],
    ['EnigmIA Ciné', 'Répondre correctement à une carte', '1 pt'],
    ['EnigmIA Musique', 'Répondre correctement à une carte', '1 pt'],
    ['EnigmIA Foot', 'Réussir le défi Action/Vérité', '1 pt'],
    ['EnigmIA Fashion', 'Réussir le challenge Memory', '1 pt'],
  ];

  return (
    <div className="max-w-4xl">
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Chill Room</p>
      <h1 className="mt-2 mb-2 font-poppins text-3xl font-bold">Débloque ton mentor technique</h1>
      <p className="mb-10 text-sm italic text-white/60">
        Un espace pour souffler, jouer, collaborer… et gagner des points pour débloquer l'accès à un mentor technique pendant le hackathon.
      </p>

      <Block title="Objectif">
        <p>
          Accumuler <strong className="text-enigmia-gold">15 points</strong> pour débloquer :
        </p>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <Li>un mentor IA</Li>
          <Li>un expert technique</Li>
          <Li>ou un coaching stratégique de 15 minutes</Li>
        </ul>
        <p className="mt-3 text-sm text-white/60">
          Les points se gagnent via des mini-jeux, défis culturels et jeux de société.
        </p>
      </Block>

      <Block title="Règles générales">
        <ul className="space-y-2 text-sm text-white/80">
          <Li>Les participants peuvent jouer librement pendant les temps d'ouverture de la Chill Room</Li>
          <Li>Chaque activité permet de gagner un nombre précis de points</Li>
          <Li>Les points sont validés par un animateur ou un bénévole</Li>
          <Li>Certains jeux nécessitent plusieurs victoires avant validation</Li>
          <Li>Le fair-play est obligatoire</Li>
          <Li>Toute triche entraîne l'annulation des points de l'activité concernée</Li>
        </ul>
      </Block>

      <Block title="Barème des points">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-enigmia-gold/30 text-[0.65rem] uppercase tracking-widest text-enigmia-gold">
                <th className="py-2 pr-4 text-left">Activité</th>
                <th className="py-2 pr-4 text-left">Condition</th>
                <th className="py-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {bareme.map(([act, cond, pts]) => (
                <tr key={act} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 font-poppins font-semibold">{act}</td>
                  <td className="py-2.5 pr-4 text-white/70">{cond}</td>
                  <td className="py-2.5 text-right font-mono text-enigmia-gold">{pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="Règles des jeux">
        <div className="grid gap-3 md:grid-cols-2">
          <RoomCard icon="🧩" name="Rubik's Cube" lines={['Le cube doit être entièrement résolu', 'Temps max : 10 minutes', 'Mélangé par l\'animateur', 'Récompense : 3 points']} />
          <RoomCard icon="🔒" name="Code Cadenas Dates" lines={['Résoudre une énigme IA & culture', 'Trouver le code du cadenas à 3 chiffres', 'Récompense : 3 points']} />
          <RoomCard icon="🎯" name="Fléchettes" lines={['3 lancers par participant', 'Score minimum annoncé sur place', 'Récompense : 3 points']} />
          <RoomCard icon="♟️" name="Jeu de Dames" lines={['Partie classique', 'La victoire rapporte les points', 'Récompense : 3 points']} />
          <RoomCard icon="🁢" name="Domino" lines={['Format rapide', 'Remporter 3 parties pour valider', 'Récompense : 5 points']} />
          <RoomCard icon="🥢" name="Mikado" lines={['Jeu individuel ou en duel', 'Remporter 3 parties pour valider', 'Récompense : 5 points']} />
          <RoomCard icon="⚽" name="EnigmIA Foot" lines={['Format : Action / Vérité', 'Culture football, anecdotes, IA & stats sportives', 'Défi réussi = 1 point']} />
          <RoomCard icon="👗" name="EnigmIA Fashion" lines={['Format : Memory', 'Paires : mode algérienne, motifs traditionnels, IA & design', 'Challenge réussi = 1 point']} />
        </div>
      </Block>

      <Block title="Débloquer un mentor">
        <p className="text-sm text-white/80">À partir de <strong className="text-enigmia-gold">15 points</strong>, une équipe peut :</p>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <Li>demander un mentor technique</Li>
          <Li>obtenir une aide stratégique</Li>
          <Li>débloquer un coaching IA</Li>
          <Li>ou demander une revue de prototype</Li>
        </ul>
        <p className="mt-4 text-sm italic text-enigmia-gold">
          → Les points sont consommés lors de l'utilisation du mentor.
        </p>
      </Block>

      <Block title="Esprit de la Chill Room">
        <p className="text-sm text-white/80">
          La Chill Room n'est pas seulement un espace de détente. C'est aussi :
        </p>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <Li>un laboratoire social</Li>
          <Li>un espace de rencontre</Li>
          <Li>un lieu d'entraide</Li>
          <Li>et une autre manière d'explorer l'IA à travers le jeu et la culture</Li>
        </ul>
        <p className="mt-4 text-sm text-white/80">Le but n'est pas uniquement de gagner, mais :</p>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <Li>de créer du lien</Li>
          <Li>de stimuler la curiosité</Li>
          <Li>et de faire émerger des idées inattendues</Li>
        </ul>
      </Block>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 border-l-2 border-enigmia-gold pl-3 font-poppins text-lg font-semibold uppercase tracking-widest text-enigmia-gold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-white/80">{children}</div>
    </section>
  );
}

function Li({ children }) {
  return (
    <li className="flex gap-2">
      <span className="mt-[0.4em] block h-1 w-1 shrink-0 rounded-full bg-enigmia-gold" />
      <span>{children}</span>
    </li>
  );
}

function ValuesGrid({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="border border-white/10 bg-white/[0.02] p-4">
          <p className="font-poppins text-base font-semibold text-enigmia-gold">{it.label}</p>
          <p className="mt-1 text-sm text-white/70">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}

function RoomCard({ icon, name, lines }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <p className="font-poppins font-semibold">{name}</p>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-white/70">
        {lines.map((l, i) => <li key={i}>• {l}</li>)}
      </ul>
    </div>
  );
}
