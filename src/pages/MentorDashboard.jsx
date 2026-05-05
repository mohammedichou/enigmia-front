import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROOMS } from '../data/dashboard';
import { api, getAuth, setAuth } from '../api';

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const a = getAuth();
    if (!a || a.role !== 'mentor') {
      navigate('/login');
      return;
    }
    Promise.all([api.auth.me(), api.bookings.listMentor()])
      .then(([meData, bks]) => {
        setMe(meData.user || meData);
        setBookings(bks);
      })
      .catch(() => {
        setAuth(null);
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = () => {
    setAuth(null);
    navigate('/login');
  };

  const partition = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const sorted = [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return {
      upcoming: sorted.filter((b) => b.date >= today),
      past: sorted.filter((b) => b.date < today),
    };
  }, [bookings]);

  if (loading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-enigmia-dark font-inter text-white/40">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-enigmia-dark font-inter text-white">
      <header className="border-b border-white/5 bg-black/30 px-6 py-5 md:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{me.avatar || '👤'}</div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-enigmia-gold">// Mentor</p>
              <h1 className="font-poppins text-lg font-bold">{me.displayName}</h1>
              <p className="text-xs text-enigmia-gold">{me.expertise}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden text-xs text-white/40 hover:text-white md:inline">← Site</Link>
            <button onClick={logout} className="text-xs uppercase tracking-widest text-white/40 hover:text-red-400">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">// Dashboard</p>
          <h2 className="mt-2 font-poppins text-3xl font-bold md:text-4xl">
            Bonjour, <span className="text-enigmia-gold">{me.displayName?.split(' ')[0]}</span>
          </h2>
          <p className="mt-2 text-sm text-white/60">Voici tes RDV à venir avec les équipes.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="RDV à venir" value={partition.upcoming.length} />
          <Stat label="RDV passés" value={partition.past.length} />
          <Stat label="Total" value={bookings.length} />
        </div>

        <div className="mt-10 flex gap-1 border-b border-white/10">
          <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>À venir ({partition.upcoming.length})</TabButton>
          <TabButton active={tab === 'past'} onClick={() => setTab('past')}>Passés ({partition.past.length})</TabButton>
        </div>

        <div className="mt-6">
          {tab === 'upcoming' && <BookingsList bookings={partition.upcoming} empty="Aucun RDV à venir." />}
          {tab === 'past' && <BookingsList bookings={partition.past} empty="Aucun RDV passé." />}
        </div>
      </main>
    </div>
  );
}

function BookingsList({ bookings, empty }) {
  if (bookings.length === 0) return <p className="text-sm text-white/50">{empty}</p>;
  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const team = b.team || {};
        const room = ROOMS.find((r) => r.id === b.room);
        return (
          <div key={b._id || b.id} className="border border-white/10 bg-white/[0.02] p-5">
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-12 md:col-span-2">
                <p className="font-mono text-sm text-enigmia-gold">{b.time}</p>
                <p className="text-xs text-white/40">{formatDate(b.date)}</p>
              </div>
              <div className="col-span-12 md:col-span-5">
                <p className="text-[0.6rem] uppercase tracking-widest text-white/40">Équipe</p>
                <p className="font-poppins font-semibold">{team.displayName || '—'}</p>
              </div>
              <div className="col-span-6 md:col-span-3">
                <p className="text-[0.6rem] uppercase tracking-widest text-white/40">Room</p>
                <p className="text-sm"><span className="mr-1 text-base">{room?.icon}</span>{room?.name}</p>
              </div>
              <div className="col-span-6 text-right md:col-span-2">
                <p className="text-[0.6rem] uppercase tracking-widest text-white/40">Durée</p>
                <p className="font-mono text-sm">{b.duration} min</p>
              </div>
            </div>
            {(b.expertise || b.problem) && (
              <div className="mt-4 space-y-1 border-t border-white/10 pt-3 text-xs">
                {b.expertise && <p><span className="text-white/40">Expertise : </span><span className="text-white/80">{b.expertise}</span></p>}
                {b.problem && <p><span className="text-white/40">Problématique : </span><span className="text-white/80">{b.problem}</span></p>}
              </div>
            )}
          </div>
        );
      })}
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
        active ? 'border-b-2 border-enigmia-gold text-enigmia-gold' : 'border-b-2 border-transparent text-white/50 hover:text-white'
      }`}
    >{children}</button>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
