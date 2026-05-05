import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockLogin, setAuth } from '../data/dashboard';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const result = mockLogin(username.trim(), password);
    if (!result) {
      setError('Identifiants invalides');
      return;
    }
    setAuth(result);
    if (result.role === 'team') navigate('/team/dashboard');
    else if (result.role === 'mentor') navigate('/mentor/dashboard');
  };

  return (
    <div className="min-h-screen bg-enigmia-dark font-inter text-white">
      <Link
        to="/"
        className="absolute top-6 left-6 text-xs uppercase tracking-widest text-white/40 hover:text-enigmia-gold"
      >
        ← Retour à l'accueil
      </Link>

      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center">
            <p className="font-inter text-[0.65rem] uppercase tracking-[0.4em] text-enigmia-gold">
              // Espace participant
            </p>
            <h1 className="mt-3 font-poppins text-3xl font-bold tracking-tight md:text-4xl">
              Connexion <span className="text-enigmia-gold">ENIGMIA</span>
            </h1>
            <p className="mt-3 text-sm text-white/60">
              Équipes & mentors — accédez à votre tableau de bord
            </p>
          </div>

          <form onSubmit={submit} className="mt-10 space-y-5 border border-enigmia-gold/15 bg-white/[0.02] p-8">
            {error && (
              <div className="rounded-md border border-red-900/40 bg-red-950/30 px-3 py-2 text-center text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/50">
                Identifiant
              </label>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cipher-squad"
                className="mt-2 w-full border-b border-enigmia-gold/30 bg-transparent py-2 text-base outline-none transition-colors focus:border-enigmia-gold"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/50">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="mt-2 w-full border-b border-enigmia-gold/30 bg-transparent py-2 text-base outline-none transition-colors focus:border-enigmia-gold"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full border border-enigmia-gold bg-enigmia-gold py-3 text-xs font-semibold uppercase tracking-[0.3em] text-enigmia-dark transition-colors hover:bg-transparent hover:text-enigmia-gold"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 rounded border border-white/10 bg-white/[0.02] p-4 text-xs text-white/50">
            <p className="mb-2 font-semibold uppercase tracking-widest text-enigmia-gold">
              Comptes de démo
            </p>
            <p>
              Équipe : <span className="text-white/80">cipher-squad</span> / <span className="text-white/80">demo</span>
            </p>
            <p>
              Mentor : <span className="text-white/80">sarah-belkacem</span> / <span className="text-white/80">demo</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
