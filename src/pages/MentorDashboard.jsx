import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MOCK_MENTORS,
  ROOMS,
  getAuth,
  setAuth,
  getStoredTeams,
  getStoredBookings,
  getStoredSlots,
} from '../data/dashboard';

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const a = getAuth();
    if (!a || a.role !== 'mentor') {
      navigate('/login');
      return;
    }
    const m = MOCK_MENTORS.find((x) => x.id === a.id);
    if (m) setMentor(m);
  }, [navigate]);

  const logout = () => {
    setAuth(null);
    navigate('/login');
  };

  const data = useMemo(() => {
    if (!mentor) return null;
    const teams = getStoredTeams();
    const bookings = getStoredBookings()
      .filter((b) => b.mentorId === mentor.id)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const enriched = bookings.map((b) => ({
      ...b,
      team: teams.find((t) => t.id === b.teamId),
      roomData: ROOMS.find((r) => r.id === b.room),
    }));
    const allSlots = getStoredSlots().filter((s) => s.mentorId === mentor.id);
    return {
      bookings: enriched,
      slotsTotal: allSlots.length,
      slotsAvailable: allSlots.filter((s) => s.available).length,
      slotsBooked: allSlots.filter((s) => !s.available).length,
    };
  }, [mentor]);

  if (!mentor || !data) return null;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.bookings.filter((b) => b.date >= today);
  const past = data.bookings.filter((b) => b.date < today);

  return (
    <div className="min-h-screen bg-enigmia-dark font-inter text-white">
      <header className="border-b border-white/5 bg-black/30 px-6 py-5 md:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{mentor.avatar}</div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-enigmia-gold">// Mentor</p>
              <h1 className="font-poppins text-lg font-bold">{mentor.displayName}</h1>
              <p className="text-xs text-enigmia-gold">{mentor.expertise}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden text-xs text-white/40 hover:text-white md:inline">
              ← Site
            </Link>
            <button onClick={logout} className="text-xs uppercase tracking-widest text-white/40 hover:text-red-400">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Dashboard</p>
          <h2 className="mt-2 font-poppins text-3xl font-bold md:text-4xl">
            Bonjour, <span className="text-enigmia-gold">{mentor.displayName.split(' ')[0]}</span>
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Voici tes RDV à venir avec les équipes du hackathon.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="RDV à venir" value={upcoming.length} />
          <Stat label="Créneaux réservés" value={data.slotsBooked} sub={`sur ${data.slotsTotal}`} />
          <Stat label="Créneaux libres" value={data.slotsAvailable} />
        </div>

        <div className="mt-10 flex gap-1 border-b border-white/10">
          <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
            À venir ({upcoming.length})
          </TabButton>
          <TabButton active={tab === 'past'} onClick={() => setTab('past')}>
            Passés ({past.length})
          </TabButton>
        </div>

        <div className="mt-6">
          {tab === 'upcoming' && <BookingsList bookings={upcoming} empty="Aucun RDV à venir." />}
          {tab === 'past' && <BookingsList bookings={past} empty="Aucun RDV passé." />}
        </div>
      </main>
    </div>
  );
}

function BookingsList({ bookings, empty }) {
  if (bookings.length === 0) {
    return <p className="text-sm text-white/50">{empty}</p>;
  }
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="grid grid-cols-12 items-center gap-4 border border-white/10 bg-white/[0.02] p-5">
          <div className="col-span-12 md:col-span-2">
            <p className="font-mono text-sm text-enigmia-gold">{b.time}</p>
            <p className="text-xs text-white/40">{formatDate(b.date)}</p>
          </div>
          <div className="col-span-12 md:col-span-5">
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40">Équipe</p>
            <p className="font-poppins font-semibold">{b.team?.displayName || '—'}</p>
          </div>
          <div className="col-span-6 md:col-span-3">
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40">Room</p>
            <p className="text-sm">
              <span className="mr-1 text-base">{b.roomData?.icon}</span>
              {b.roomData?.name}
            </p>
          </div>
          <div className="col-span-6 text-right md:col-span-2">
            <p className="text-[0.6rem] uppercase tracking-widest text-white/40">Durée</p>
            <p className="font-mono text-sm">{b.duration} min</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className="mt-2 font-poppins text-3xl font-bold text-enigmia-gold">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm transition-colors ${
        active
          ? 'border-b-2 border-enigmia-gold text-enigmia-gold'
          : 'border-b-2 border-transparent text-white/50 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
