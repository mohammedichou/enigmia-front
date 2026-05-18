import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

// Bouton flottant affiché sur la landing UNIQUEMENT quand l'admin
// a activé le lancement du hackathon depuis le dashboard pro.
export default function HackathonLaunchButton() {
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    let active = true;
    api.settings
      .get()
      .then((s) => {
        if (active) setLaunched(Boolean(s?.hackathonLaunched));
      })
      .catch(() => {
        // API indisponible → on n'affiche rien (dégradation silencieuse)
      });
    return () => {
      active = false;
    };
  }, []);

  if (!launched) return null;

  return (
    <Link
      to="/escape"
      className="group fixed bottom-6 left-1/2 z-[9990] -translate-x-1/2 animate-fade-up"
    >
      <span className="relative flex items-center gap-3 border border-enigmia-gold bg-enigmia-gold px-8 py-4 font-inter text-xs font-semibold uppercase tracking-[0.3em] text-enigmia-dark shadow-[0_0_30px_rgba(225,193,153,0.4)] transition-all duration-300 hover:bg-transparent hover:text-enigmia-gold md:text-sm">
        <span className="absolute -left-1 -top-1 h-2 w-2 animate-ping rounded-full bg-enigmia-gold" />
        <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-enigmia-gold" />
        ⚡ Lancer le hackathon
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
