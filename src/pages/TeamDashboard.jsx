import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MOCK_MENTORS,
  ROOMS,
  COST_PER_BOOKING,
  getAuth,
  setAuth,
  getStoredTeams,
  getStoredSlots,
  getStoredBookings,
  getStoredDocuments,
  getStoredEvents,
  bookSlot,
} from '../data/dashboard';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: '⌘' },
  { id: 'calendar', label: 'Calendrier', icon: '◷' },
  { id: 'documents', label: 'Documents', icon: '◫' },
  { id: 'mentors', label: 'Mentors', icon: '◉' },
  { id: 'bookings', label: 'Mes RDV', icon: '✓' },
];

export default function TeamDashboard() {
  const navigate = useNavigate();
  const [auth, setAuthState] = useState(() => getAuth());
  const [team, setTeam] = useState(null);
  const [tab, setTab] = useState('overview');
  const [bookingMentor, setBookingMentor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const a = getAuth();
    if (!a || a.role !== 'team') {
      navigate('/login');
      return;
    }
    const teams = getStoredTeams();
    const t = teams.find((x) => x.id === a.id);
    if (t) setTeam(t);
  }, [navigate, refreshKey]);

  const logout = () => {
    setAuth(null);
    setAuthState(null);
    navigate('/login');
  };

  if (!team) return null;

  return (
    <div className="min-h-screen bg-enigmia-dark font-inter text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-black/30 p-6 md:flex md:flex-col">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-enigmia-gold">// Équipe</p>
            <h2 className="mt-1 font-poppins text-lg font-bold leading-tight">
              {team.displayName}
            </h2>
          </div>

          <PointsCard points={team.points} className="mt-6" />

          <nav className="mt-8 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  tab === t.id
                    ? 'bg-enigmia-gold/10 text-enigmia-gold'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-base">{t.icon}</span>
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

        {/* Main */}
        <main className="flex-1 overflow-auto p-6 md:p-10">
          {/* Mobile header */}
          <div className="mb-6 flex items-center justify-between md:hidden">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-enigmia-gold">// Équipe</p>
              <h2 className="font-poppins text-base font-bold">{team.displayName}</h2>
            </div>
            <PointsBadge points={team.points} />
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

          {tab === 'overview' && <Overview team={team} onSwitch={setTab} />}
          {tab === 'calendar' && <CalendarTab />}
          {tab === 'documents' && <DocumentsTab />}
          {tab === 'mentors' && (
            <MentorsTab onBook={(m) => setBookingMentor(m)} teamPoints={team.points} />
          )}
          {tab === 'bookings' && <BookingsTab teamId={team.id} />}
        </main>
      </div>

      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          team={team}
          onClose={() => setBookingMentor(null)}
          onSuccess={() => {
            setBookingMentor(null);
            setRefreshKey((k) => k + 1);
            setTab('bookings');
          }}
        />
      )}
    </div>
  );
}

/* ─────── Overview ─────── */
function Overview({ team, onSwitch }) {
  const today = '2026-05-21';
  const todayEvents = getStoredEvents().filter((e) => e.date === today);
  const bookings = getStoredBookings().filter((b) => b.teamId === team.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Dashboard</p>
        <h1 className="mt-2 font-poppins text-3xl font-bold md:text-4xl">
          Bonjour, équipe <span className="text-enigmia-gold">{team.displayName}</span>
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Voici l'essentiel pour aujourd'hui — bonne journée.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Solde de points" value={team.points} sub="utilisables pour les RDV mentors" />
        <StatCard label="RDV pris" value={bookings.length} sub={`${bookings.length * COST_PER_BOOKING} pts dépensés`} />
        <StatCard label="Documents" value={getStoredDocuments().length} sub="disponibles au téléchargement" />
      </div>

      <Section
        title="Aujourd'hui · 21 mai 2026"
        action={<button onClick={() => onSwitch('calendar')} className="text-xs text-enigmia-gold hover:underline">Voir le planning →</button>}
      >
        {todayEvents.length === 0 ? (
          <p className="text-sm text-white/50">Aucun événement aujourd'hui.</p>
        ) : (
          <div className="space-y-2">
            {todayEvents.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ─────── Calendar ─────── */
function CalendarTab() {
  const days = useMemo(() => {
    const dates = [...new Set(getStoredEvents().map((e) => e.date))].sort();
    return dates.map((d) => ({
      date: d,
      events: getStoredEvents().filter((e) => e.date === d).sort((a, b) => a.time.localeCompare(b.time)),
    }));
  }, []);

  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Calendrier</p>
      <h1 className="mt-2 mb-8 font-poppins text-3xl font-bold">Planning du hackathon</h1>

      <div className="space-y-8">
        {days.map((d) => (
          <div key={d.date}>
            <h3 className="mb-3 font-poppins text-base font-semibold text-enigmia-gold">
              {formatDate(d.date)}
            </h3>
            <div className="space-y-2">
              {d.events.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────── Documents ─────── */
function DocumentsTab() {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Documents</p>
      <h1 className="mt-2 mb-8 font-poppins text-3xl font-bold">Ressources & PDFs</h1>

      <div className="grid gap-3 md:grid-cols-2">
        {getStoredDocuments().map((doc) => (
          <div
            key={doc.id}
            className="group flex items-center gap-4 border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-enigmia-gold/40"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-enigmia-gold/10 text-xl text-enigmia-gold">
              ⎙
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-poppins text-sm font-semibold">{doc.title}</p>
              <p className="text-xs text-white/40">
                {doc.filename} · {doc.size} · {formatDate(doc.uploadedAt)}
              </p>
            </div>
            <button
              onClick={() => alert('Téléchargement (mock) — sera branché au backend')}
              className="shrink-0 border border-enigmia-gold/40 px-3 py-1.5 text-xs uppercase tracking-widest text-enigmia-gold transition-colors hover:bg-enigmia-gold hover:text-enigmia-dark"
            >
              Télécharger
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────── Mentors ─────── */
function MentorsTab({ onBook, teamPoints }) {
  const slots = getStoredSlots();

  const availableByMentor = useMemo(() => {
    const map = {};
    MOCK_MENTORS.forEach((m) => {
      map[m.id] = slots.filter((s) => s.mentorId === m.id && s.available).length;
    });
    return map;
  }, [slots]);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Mentors</p>
          <h1 className="mt-2 font-poppins text-3xl font-bold">Réserver un RDV mentor</h1>
          <p className="mt-2 text-sm text-white/60">
            <span className="text-enigmia-gold">{COST_PER_BOOKING} pts</span> = 15 min · choisis ton mentor + une room
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_MENTORS.map((mentor) => {
          const available = availableByMentor[mentor.id];
          const canAfford = teamPoints >= COST_PER_BOOKING;
          return (
            <div
              key={mentor.id}
              className="flex flex-col border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-enigmia-gold/40"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{mentor.avatar}</div>
                <div>
                  <h3 className="font-poppins font-semibold">{mentor.displayName}</h3>
                  <p className="mt-0.5 text-xs uppercase tracking-widest text-enigmia-gold">
                    {mentor.expertise}
                  </p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm text-white/60">{mentor.bio}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                <span>
                  {available} {available > 1 ? 'créneaux' : 'créneau'} dispo
                </span>
                <span>{COST_PER_BOOKING} pts / 15 min</span>
              </div>
              <button
                onClick={() => onBook(mentor)}
                disabled={available === 0 || !canAfford}
                className="mt-4 border border-enigmia-gold py-2 text-xs uppercase tracking-widest text-enigmia-gold transition-colors hover:bg-enigmia-gold hover:text-enigmia-dark disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30 disabled:hover:bg-transparent"
              >
                {!canAfford ? 'Solde insuffisant' : available === 0 ? 'Complet' : 'Réserver →'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────── Bookings ─────── */
function BookingsTab({ teamId }) {
  const bookings = getStoredBookings()
    .filter((b) => b.teamId === teamId)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Mes RDV</p>
      <h1 className="mt-2 mb-8 font-poppins text-3xl font-bold">Rendez-vous mentors</h1>

      {bookings.length === 0 ? (
        <p className="text-sm text-white/50">Tu n'as encore aucun RDV. Va dans l'onglet Mentors pour réserver.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const mentor = MOCK_MENTORS.find((m) => m.id === b.mentorId);
            const room = ROOMS.find((r) => r.id === b.room);
            return (
              <div key={b.id} className="flex items-center gap-5 border border-enigmia-gold/20 bg-enigmia-gold/[0.03] p-5">
                <div className="text-3xl">{mentor?.avatar}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-poppins font-semibold">{mentor?.displayName}</p>
                  <p className="text-xs text-enigmia-gold">{mentor?.expertise}</p>
                  <p className="mt-1 text-xs text-white/50">
                    {formatDate(b.date)} · {b.time} · {b.duration} min · {room?.icon} {room?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg text-enigmia-gold">−{b.cost} pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────── Booking Modal ─────── */
function BookingModal({ mentor, team, onClose, onSuccess }) {
  const slots = getStoredSlots().filter((s) => s.mentorId === mentor.id && s.available);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState('');

  const slotsByDay = useMemo(() => {
    const map = {};
    slots.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [slots]);

  const confirm = () => {
    if (!selectedSlot || !selectedRoom) return;
    const result = bookSlot({ teamId: team.id, slotId: selectedSlot.id, room: selectedRoom });
    if (!result.success) {
      setError(result.error);
      return;
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-auto border border-enigmia-gold/30 bg-enigmia-dark p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{mentor.avatar}</div>
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
          <div className="space-y-4">
            {Object.entries(slotsByDay).map(([date, daySlots]) => (
              <div key={date}>
                <p className="mb-2 text-xs text-enigmia-gold">{formatDate(date)}</p>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSlot(s)}
                      className={`border px-3 py-1.5 font-mono text-sm transition-colors ${
                        selectedSlot?.id === s.id
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
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-white/60">2 · Choisis une room</h3>
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
            Solde après : <span className={team.points - COST_PER_BOOKING >= 0 ? 'text-white' : 'text-red-400'}>
              {team.points - COST_PER_BOOKING} pts
            </span>
          </div>
          <button
            onClick={confirm}
            disabled={!selectedSlot || !selectedRoom}
            className="border border-enigmia-gold bg-enigmia-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-enigmia-dark transition-colors hover:bg-transparent hover:text-enigmia-gold disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/30 disabled:hover:bg-white/5"
          >
            Confirmer la réservation
          </button>
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

/* ─────── Helpers UI ─────── */
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
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
