import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const POLL_MS = 8000; // rafraîchissement temps réel

const TABS = [
  { id: 'escape', label: 'Escape Game' },
  { id: 'points', label: 'Points équipes' },
  { id: 'results', label: 'Résultats finaux' },
];

function formatChrono(ms) {
  if (ms == null) return '—';
  const totalSec = Math.floor(ms / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const sec = String(totalSec % 60).padStart(2, '0');
  const tenth = Math.floor((ms % 1000) / 100);
  return `${min}:${sec}.${tenth}`;
}

export default function Leaderboard() {
  const [tab, setTab] = useState('escape');

  return (
    <div className="min-h-screen bg-enigmia-dark font-inter text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-scanlines opacity-[0.05]" />

      <header className="relative z-10 border-b border-white/5 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.4em] text-enigmia-gold">// Classement live</p>
            <h1 className="mt-1 font-poppins text-2xl font-bold md:text-3xl">
              ENIGMIA — Tableau des scores
            </h1>
          </div>
          <Link to="/" className="text-xs uppercase tracking-widest text-white/40 hover:text-enigmia-gold">
            ← Accueil
          </Link>
        </div>
      </header>

      <div className="relative z-10 border-b border-white/10 px-6 md:px-12">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-5 py-3 text-sm transition-colors ${
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

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-10 md:px-12">
        {tab === 'escape' && <EscapeBoard />}
        {tab === 'points' && <PointsBoard />}
        {tab === 'results' && <ResultsBoard />}
      </main>
    </div>
  );
}

function useLivePoll(fetcher) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetcher()
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    load();
    const i = setInterval(load, POLL_MS);
    return () => clearInterval(i);
  }, [load]);

  return { data, error, loading };
}

/* ─── Escape game ranking ─── */
function EscapeBoard() {
  const { data, error, loading } = useLivePoll(api.escape.scores);
  const scores = (data || []).slice().sort((a, b) => a.durationMs - b.durationMs);

  return (
    <div>
      <Header title="Escape Game — Classement par temps" hint="Plus le temps est court, mieux c'est." />
      {loading && !data ? <Loading /> : error ? <ErrorMsg msg={error} /> : scores.length === 0 ? (
        <Empty msg="Aucune équipe n'a encore terminé l'escape game." />
      ) : (
        <div className="space-y-2">
          {scores.map((s, i) => (
            <div
              key={s._id || s.id || i}
              className={`flex items-center gap-4 border p-4 ${
                i === 0
                  ? 'border-enigmia-gold bg-enigmia-gold/[0.08]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <Rank i={i} />
              <p className="flex-1 font-poppins font-semibold">{s.teamName}</p>
              <p className="font-mono text-lg text-enigmia-gold">{formatChrono(s.durationMs)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Live team points ─── */
function PointsBoard() {
  const { data, error, loading } = useLivePoll(api.leaderboard.teams);
  const teams = (data || []).slice().sort((a, b) => (b.points || 0) - (a.points || 0));

  return (
    <div>
      <Header title="Points techniques — Temps réel" hint="Gagnés à la Chill Room, dépensés en RDV mentors." />
      {loading && !data ? <Loading /> : error ? <ErrorMsg msg={error} /> : teams.length === 0 ? (
        <Empty msg="Aucune équipe enregistrée." />
      ) : (
        <div className="space-y-2">
          {teams.map((t, i) => (
            <div
              key={t._id || t.id || i}
              className={`flex items-center gap-4 border p-4 ${
                i === 0 ? 'border-enigmia-gold bg-enigmia-gold/[0.08]' : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <Rank i={i} />
              <p className="flex-1 font-poppins font-semibold">{t.displayName}</p>
              <p className="font-mono text-lg text-enigmia-gold">{t.points || 0} pts</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Final results ─── */
function ResultsBoard() {
  const { data, error, loading } = useLivePoll(api.results.get);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  const published = data?.published !== false && Array.isArray(data?.results || data);
  const results = (data?.results || (Array.isArray(data) ? data : [])).slice()
    .sort((a, b) => (a.finalRank || 99) - (b.finalRank || 99));

  if (!published || results.length === 0) {
    return (
      <div>
        <Header title="Résultats finaux" />
        <Empty msg="Les résultats ne sont pas encore publiés. Reviens après les pitchs finaux." />
      </div>
    );
  }

  return (
    <div>
      <Header title="Résultats finaux du hackathon" hint="Classement officiel + pitchs des équipes." />
      <div className="space-y-3">
        {results.map((r, i) => (
          <div
            key={r._id || r.id || i}
            className={`border p-5 ${
              i === 0 ? 'border-enigmia-gold bg-enigmia-gold/[0.08]' : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Rank i={i} />
              <div className="flex-1">
                <p className="font-poppins text-lg font-semibold">{r.displayName || r.teamName}</p>
                {r.finalScore != null && (
                  <p className="text-xs text-white/50">Score : {r.finalScore}</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 border-t border-white/10 pt-3 text-sm">
              {r.projectUrl && (
                <a href={r.projectUrl} target="_blank" rel="noreferrer" className="text-enigmia-gold underline hover:text-white">
                  🔗 Projet
                </a>
              )}
              {r.pitchUrl && (
                <a href={r.pitchUrl} target="_blank" rel="noreferrer" className="text-enigmia-gold underline hover:text-white">
                  📄 Pitch (PDF)
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── UI helpers ─── */
function Header({ title, hint }) {
  return (
    <div className="mb-6">
      <h2 className="font-poppins text-xl font-bold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-white/50">{hint}</p>}
      <p className="mt-2 text-[0.65rem] uppercase tracking-widest text-enigmia-gold/60">
        ● Mise à jour automatique toutes les {POLL_MS / 1000}s
      </p>
    </div>
  );
}

function Rank({ i }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center font-mono text-lg">
      {medals[i] || <span className="text-white/40">{i + 1}</span>}
    </span>
  );
}

function Loading() {
  return <p className="text-white/40">Chargement…</p>;
}

function ErrorMsg({ msg }) {
  return (
    <div className="border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-400">
      Erreur : {msg}
    </div>
  );
}

function Empty({ msg }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/50">
      {msg}
    </div>
  );
}
