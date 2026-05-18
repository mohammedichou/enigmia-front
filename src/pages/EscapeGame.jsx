import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function formatChrono(ms) {
  if (ms == null) return '00:00.0';
  const totalSec = Math.floor(ms / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const sec = String(totalSec % 60).padStart(2, '0');
  const tenth = Math.floor((ms % 1000) / 100);
  return `${min}:${sec}.${tenth}`;
}

function Chrono({ startedAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(i);
  }, []);
  const elapsed = startedAt ? now - startedAt : 0;
  return (
    <div className="fixed left-1/2 top-4 z-40 -translate-x-1/2 border border-enigmia-gold/40 bg-enigmia-dark/80 px-4 py-1.5 font-mono text-lg tracking-widest text-enigmia-gold backdrop-blur-sm">
      ⏱ {formatChrono(elapsed)}
    </div>
  );
}

// Mapping de chiffrement façon Enigma
const CIPHER = { 0: 6, 1: 2, 2: 1, 3: 9, 4: 3, 5: 2, 6: 4, 7: 5, 8: 0, 9: 8 };

const HACK_LINES = [
  '> Initialisation du système...',
  '> Connexion au réseau ENIGMIA',
  '> ALERTE : Activité suspecte détectée',
  '> Tentative d\'intrusion en cours...',
  '> ACCES NON AUTORISE',
  '> SYSTÈME COMPROMIS',
  '> Verrouillage des données...',
  '> ENIGMIA reprend le contrôle.',
];

const STEPS = {
  HACK: 'hack',
  WELCOME: 'welcome',
  CODE1: 'code1',
  CODE2: 'code2',
  CODE3: 'code3',
  CIPHER: 'cipher',
  FINAL: 'final',
  END: 'end',
};

export default function EscapeGame() {
  const [step, setStep] = useState(STEPS.HACK);
  const [teamName, setTeamName] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [durationMs, setDurationMs] = useState(null);
  const submittedRef = useRef(false);

  const showChrono = [
    STEPS.CODE1, STEPS.CODE2, STEPS.CODE3, STEPS.CIPHER, STEPS.FINAL,
  ].includes(step);

  const finish = () => {
    const d = startedAt ? Date.now() - startedAt : null;
    setDurationMs(d);
    setStep(STEPS.END);
    if (!submittedRef.current && d != null && teamName.trim()) {
      submittedRef.current = true;
      api.escape
        .submitScore({ teamName: teamName.trim(), durationMs: d })
        .catch(() => {}); // échec silencieux (l'écran final s'affiche quand même)
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-enigmia-dark font-inter text-white">
      {/* Scanlines overlay */}
      <div className="pointer-events-none fixed inset-0 z-30 bg-scanlines opacity-[0.08]" />
      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 z-20 bg-radial-vignette" />

      {/* Lien discret pour quitter */}
      <Link
        to="/"
        className="fixed top-4 right-4 z-40 font-inter text-xs uppercase tracking-widest text-white/30 hover:text-enigmia-gold"
      >
        × Quitter
      </Link>

      {showChrono && <Chrono startedAt={startedAt} />}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        {step === STEPS.HACK && <HackScreen onDone={() => setStep(STEPS.WELCOME)} />}

        {step === STEPS.WELCOME && (
          <WelcomeScreen
            teamName={teamName}
            setTeamName={setTeamName}
            onNext={() => {
              setInput('');
              setError(false);
              setStartedAt(Date.now());
              setStep(STEPS.CODE1);
            }}
          />
        )}

        {step === STEPS.CODE1 && (
          <CodeScreen
            key="c1"
            indexLabel="01 / 03"
            hint="Indice #1 — Qui est à l'origine de l'incident ?"
            sub="Un nom de code. Trois chiffres."
            placeholder="• • •"
            maxLength={3}
            expected="005"
            input={input}
            setInput={setInput}
            error={error}
            setError={setError}
            onSuccess={() => {
              setInput('');
              setError(false);
              setStep(STEPS.CODE2);
            }}
          />
        )}

        {step === STEPS.CODE2 && (
          <CodeScreen
            key="c2"
            indexLabel="02 / 03"
            hint="Indice #2 — Comment l'incident a-t-il eu lieu ?"
            sub="L'agent connaît la réponse."
            placeholder="• • •"
            maxLength={3}
            expected="007"
            input={input}
            setInput={setInput}
            error={error}
            setError={setError}
            onSuccess={() => {
              setInput('');
              setError(false);
              setStep(STEPS.CODE3);
            }}
          />
        )}

        {step === STEPS.CODE3 && (
          <CodeScreen
            key="c3"
            indexLabel="03 / 03"
            hint="Indice #3 — À quelle heure ?"
            sub="Format 24h, sans séparateur."
            placeholder="• • • •"
            maxLength={4}
            expected="2305"
            input={input}
            setInput={setInput}
            error={error}
            setError={setError}
            onSuccess={() => {
              setInput('');
              setError(false);
              setStep(STEPS.CIPHER);
            }}
          />
        )}

        {step === STEPS.CIPHER && (
          <CipherScreen onNext={() => setStep(STEPS.FINAL)} />
        )}

        {step === STEPS.FINAL && (
          <FinalCodeScreen
            input={input}
            setInput={setInput}
            error={error}
            setError={setError}
            onSuccess={() => {
              setInput('');
              setError(false);
              finish();
            }}
          />
        )}

        {step === STEPS.END && <EndScreen teamName={teamName} durationMs={durationMs} />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* ÉCRAN 0 — HACK                              */
/* ─────────────────────────────────────────── */
function HackScreen({ onDone }) {
  const [lines, setLines] = useState([]);
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    let mounted = true;
    HACK_LINES.forEach((line, i) => {
      setTimeout(() => {
        if (!mounted) return;
        setLines((prev) => [...prev, line]);
      }, 350 + i * 420);
    });

    const overrideAt = 350 + HACK_LINES.length * 420 + 600;
    setTimeout(() => mounted && setShowOverride(true), overrideAt);
    setTimeout(() => mounted && onDone(), overrideAt + 2200);

    return () => {
      mounted = false;
    };
  }, [onDone]);

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="font-inter text-[0.65rem] uppercase tracking-[0.3em] text-red-500">
          // Live · Connexion compromise
        </span>
      </div>

      <pre className="font-mono text-[0.85rem] leading-relaxed text-enigmia-gold/90">
        {lines.map((l, i) => {
          const isAlert = l.includes('ALERTE') || l.includes('ACCES') || l.includes('COMPROMIS');
          return (
            <div
              key={i}
              className={`animate-fade-in ${isAlert ? 'text-red-400' : 'text-enigmia-gold/90'}`}
            >
              {l}
              {i === lines.length - 1 && <span className="ml-1 animate-blink">▌</span>}
            </div>
          );
        })}
      </pre>

      {showOverride && (
        <div className="mt-10 animate-glitch text-center">
          <p className="font-poppins text-2xl font-bold tracking-widest text-enigmia-gold md:text-3xl">
            ENIGMIA
          </p>
          <p className="mt-2 font-inter text-xs uppercase tracking-[0.4em] text-white/60">
            prend le contrôle
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* ÉCRAN 1 — WELCOME                           */
/* ─────────────────────────────────────────── */
function WelcomeScreen({ teamName, setTeamName, onNext }) {
  const canSubmit = teamName.trim().length >= 2;

  return (
    <div className="w-full max-w-xl text-center animate-fade-up">
      <p className="mb-3 font-inter text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">
        // Mission · Briefing
      </p>
      <h1 className="font-poppins text-4xl font-bold tracking-tight md:text-5xl">
        Bienvenue dans <span className="text-enigmia-gold">ENIGMIA</span>
      </h1>
      <p className="mx-auto mt-6 max-w-md font-inter text-sm text-white/70">
        Votre mission : déchiffrer le code secret pour accéder au hackathon.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onNext();
        }}
        className="mx-auto mt-12 max-w-md"
      >
        <label className="block text-left font-inter text-xs uppercase tracking-widest text-white/50">
          Nom de l'équipe
        </label>
        <input
          autoFocus
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="mt-2 w-full border-b border-enigmia-gold/40 bg-transparent py-3 font-poppins text-2xl text-white outline-none transition-colors placeholder:text-white/20 focus:border-enigmia-gold"
          placeholder="The Cipher Squad"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-10 inline-block border border-enigmia-gold px-8 py-3 font-inter text-xs uppercase tracking-[0.3em] text-enigmia-gold transition-all duration-300 hover:bg-enigmia-gold hover:text-enigmia-dark disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-enigmia-gold"
        >
          Lancer la mission →
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* ÉCRANS 2-4 — CODES                          */
/* ─────────────────────────────────────────── */
function CodeScreen({
  indexLabel,
  hint,
  sub,
  placeholder,
  maxLength,
  expected,
  input,
  setInput,
  error,
  setError,
  onSuccess,
}) {
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);

  const submit = (e) => {
    e.preventDefault();
    if (input === expected) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="w-full max-w-xl text-center animate-fade-up">
      <p className="mb-3 font-inter text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">
        // {indexLabel} · Déchiffrement
      </p>
      <h2 className="font-poppins text-2xl font-semibold leading-tight md:text-3xl">{hint}</h2>
      <p className="mt-3 font-inter text-sm text-white/50">{sub}</p>

      <form onSubmit={submit} className={`mt-12 ${error ? 'animate-shake' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={input}
          maxLength={maxLength}
          onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))}
          placeholder={placeholder}
          className={`w-full bg-transparent text-center font-mono text-5xl tracking-[0.6em] text-enigmia-gold outline-none transition-all placeholder:text-white/15 md:text-7xl ${
            error ? 'text-red-400' : ''
          }`}
        />
        <div
          className={`mx-auto mt-2 h-px w-64 transition-colors ${
            error ? 'bg-red-500' : 'bg-enigmia-gold/40'
          }`}
        />
        <p className="mt-4 h-4 font-inter text-xs uppercase tracking-widest text-red-400">
          {error ? '× Code incorrect' : ''}
        </p>
        <button
          type="submit"
          disabled={input.length !== maxLength}
          className="mt-8 inline-block border border-enigmia-gold px-8 py-3 font-inter text-xs uppercase tracking-[0.3em] text-enigmia-gold transition-all duration-300 hover:bg-enigmia-gold hover:text-enigmia-dark disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-enigmia-gold"
        >
          Valider
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* ÉCRAN 5 — CIPHER ENIGMA                     */
/* ─────────────────────────────────────────── */
function CipherScreen({ onNext }) {
  const original = '2305';
  const transformed = useMemo(
    () => original.split('').map((d) => CIPHER[d]).join(''),
    [],
  );
  const [revealedIndex, setRevealedIndex] = useState(-1);

  useEffect(() => {
    const t = original.split('').map((_, i) =>
      setTimeout(() => setRevealedIndex(i), 1400 + i * 600),
    );
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-3xl text-center animate-fade-up">
      <p className="mb-3 font-inter text-[0.65rem] uppercase tracking-[0.4em] text-red-400">
        // Anomalie détectée
      </p>
      <h2 className="font-poppins text-3xl font-semibold md:text-4xl">
        Oups… le code vient de changer.
      </h2>
      <p className="mx-auto mt-3 max-w-lg font-inter text-sm italic text-white/60">
        Comme la machine Enigma dans les années 1930…
      </p>

      {/* Table de correspondance */}
      <div className="mx-auto mt-10 grid max-w-md grid-cols-5 gap-3 md:grid-cols-10">
        {Object.entries(CIPHER).map(([k, v]) => (
          <div
            key={k}
            className="flex flex-col items-center border border-enigmia-gold/20 bg-white/[0.02] px-2 py-3 font-mono text-sm"
          >
            <span className="text-white/50">{k}</span>
            <span className="my-1 text-enigmia-gold/40">↓</span>
            <span className="font-bold text-enigmia-gold">{v}</span>
          </div>
        ))}
      </div>

      {/* Transformation */}
      <div className="mt-12 flex items-center justify-center gap-6 md:gap-10">
        <div>
          <p className="mb-2 font-inter text-[0.65rem] uppercase tracking-widest text-white/40">
            Code original
          </p>
          <p className="font-mono text-4xl tracking-[0.3em] text-white/80 line-through decoration-red-500/70 md:text-5xl">
            {original}
          </p>
        </div>
        <span className="font-mono text-3xl text-enigmia-gold">→</span>
        <div>
          <p className="mb-2 font-inter text-[0.65rem] uppercase tracking-widest text-enigmia-gold">
            Code recalculé
          </p>
          <p className="font-mono text-4xl tracking-[0.3em] text-enigmia-gold md:text-5xl">
            {original.split('').map((_, i) => (
              <span
                key={i}
                className={`inline-block transition-all duration-500 ${
                  i <= revealedIndex
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-2 opacity-30'
                }`}
              >
                {i <= revealedIndex ? transformed[i] : '?'}
              </span>
            ))}
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={revealedIndex < original.length - 1}
        className="mt-12 inline-block border border-enigmia-gold px-8 py-3 font-inter text-xs uppercase tracking-[0.3em] text-enigmia-gold transition-all duration-300 hover:bg-enigmia-gold hover:text-enigmia-dark disabled:cursor-not-allowed disabled:opacity-30"
      >
        Continuer →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* ÉCRAN 6 — CODE FINAL                        */
/* ─────────────────────────────────────────── */
function FinalCodeScreen({ input, setInput, error, setError, onSuccess }) {
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);

  const submit = (e) => {
    e.preventDefault();
    const cleaned = input.replace(/\s/g, '');
    if (cleaned === '0050071962') {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="w-full max-w-2xl text-center animate-fade-up">
      <p className="mb-3 font-inter text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">
        // Décodage final
      </p>
      <h2 className="font-poppins text-3xl font-semibold md:text-4xl">
        Entrez le code final
      </h2>
      <p className="mt-3 font-inter text-sm text-white/50">
        Reconstituez la séquence complète.
      </p>

      <form onSubmit={submit} className={`mt-12 ${error ? 'animate-shake' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))}
          placeholder="• • •  • • •  • • • •"
          className={`w-full bg-transparent text-center font-mono text-3xl tracking-[0.4em] text-enigmia-gold outline-none placeholder:text-white/15 md:text-5xl ${
            error ? 'text-red-400' : ''
          }`}
        />
        <div
          className={`mx-auto mt-2 h-px w-80 transition-colors ${
            error ? 'bg-red-500' : 'bg-enigmia-gold/40'
          }`}
        />
        <p className="mt-4 h-4 font-inter text-xs uppercase tracking-widest text-red-400">
          {error ? '× Code incorrect' : ''}
        </p>
        <button
          type="submit"
          className="mt-8 inline-block border border-enigmia-gold px-8 py-3 font-inter text-xs uppercase tracking-[0.3em] text-enigmia-gold transition-all duration-300 hover:bg-enigmia-gold hover:text-enigmia-dark"
        >
          Déchiffrer
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* ÉCRAN FINAL — RÉVÉLATION                    */
/* ─────────────────────────────────────────── */
function EndScreen({ teamName, durationMs }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl text-center">
      <div className="animate-fade-up">
        <p className="font-mono text-4xl tracking-[0.3em] text-enigmia-gold md:text-6xl">
          005 · 007 · 1962
        </p>

        {phase >= 1 && (
          <div className="mt-10 animate-fade-up">
            <p className="font-poppins text-2xl font-semibold md:text-3xl">
              5 juillet 1962
            </p>
            <p className="mt-2 flex items-center justify-center gap-2 font-inter text-sm text-white/70">
              <span className="text-2xl">🇩🇿</span>
              Jour de l'indépendance de l'Algérie
            </p>
          </div>
        )}
      </div>

      {phase >= 2 && (
        <div className="mt-16 animate-fade-up">
          <p className="font-poppins text-xl italic text-white/80 md:text-2xl">
            Ce n'est pas un hasard.
          </p>
          <p className="mt-3 font-poppins text-3xl font-bold text-enigmia-gold md:text-4xl">
            Votre défi commence ici.
          </p>
          {durationMs != null && (
            <div className="mt-8 inline-block border border-enigmia-gold/40 bg-enigmia-gold/[0.05] px-6 py-3">
              <p className="font-inter text-[0.6rem] uppercase tracking-[0.3em] text-white/50">
                Temps de résolution
              </p>
              <p className="mt-1 font-mono text-3xl text-enigmia-gold">
                {formatChrono(durationMs)}
              </p>
            </div>
          )}
          {teamName && (
            <p className="mt-6 font-inter text-xs uppercase tracking-[0.3em] text-white/50">
              Bravo, équipe <span className="text-enigmia-gold">{teamName}</span> — score enregistré
            </p>
          )}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/classement"
              className="inline-block border border-enigmia-gold bg-enigmia-gold px-8 py-4 font-inter text-xs font-semibold uppercase tracking-[0.3em] text-enigmia-dark transition-all duration-300 hover:bg-transparent hover:text-enigmia-gold"
            >
              Voir le classement →
            </Link>
            <Link
              to="/login"
              className="inline-block border border-enigmia-gold/40 px-8 py-4 font-inter text-xs font-semibold uppercase tracking-[0.3em] text-enigmia-gold transition-all duration-300 hover:bg-enigmia-gold hover:text-enigmia-dark"
            >
              Accéder à l'épreuve →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
