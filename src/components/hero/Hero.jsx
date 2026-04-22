import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { EVENT_DATE } from '../../data';
import { Link } from 'react-router-dom';

// Enregistrement du plugin Draggable pour GSAP
gsap.registerPlugin(Draggable);

/* ── Hook Compte à rebours ── */
function useCountdown(target) {
  const [time, setTime] = useState({ d: '00', h: '00', m: '00', s: '00' });

  useEffect(() => {
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTime({
        d: String(d).padStart(2, '0'),
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

/* ── Bloc Unité du Compte à Rebours ── */
function CdUnit({ value, label, showColon }) {
  return (
    <div className="relative flex items-center">
      <div className="flex w-[70px] flex-col items-center justify-center border border-enigmia-gold/20 bg-enigmia-dark/80 px-2 py-4 backdrop-blur-md transition-colors hover:bg-enigmia-gold/10 md:w-[100px] md:px-4 md:py-6">
        <span className="font-poppins text-3xl font-black text-enigmia-gold drop-shadow-[0_0_15px_rgba(225,193,153,0.4)] md:text-5xl">
          {value}
        </span>
        <span className="mt-2 font-inter text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-gray-400 md:text-[0.65rem]">
          {label}
        </span>
      </div>
      {showColon && (
        <span className="absolute -right-2 top-1/2 -translate-y-[60%] font-poppins text-xl font-bold text-enigmia-gold/50 md:-right-3 md:text-3xl">
          :
        </span>
      )}
    </div>
  );
}

export default function SplitHero() {
  const { d, h, m, s } = useCountdown(EVENT_DATE.getTime());
  
  // Références pour les animations GSAP
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const contentRef = useRef(null);
  const countdownRef = useRef(null);
  const btnsRef = useRef(null);
  
  // Éléments Draggable (mots clés de l'événement)
  const dragItems = [
    { text: "{ INNOVATION }", top: "15%", left: "10%", delay: 0.2 },
    { text: "AI_MODELS", top: "70%", left: "5%", delay: 0.4 },
    { text: "<CODE_THE_FUTURE/>", top: "20%", left: "75%", delay: 0.6 },
    { text: "1936_TURING", top: "65%", left: "80%", delay: 0.8 },
  ];

  /* ── Animation d'entrée et Setup Draggable ── */
  useEffect(() => {
    // 1. Initialisation des éléments déplaçables
    Draggable.create(".drag-floating", {
      bounds: containerRef.current,
      inertia: true,
      onPress: function() {
        gsap.to(this.target, { scale: 1.1, cursor: 'grabbing', zIndex: 50, duration: 0.2 });
      },
      onRelease: function() {
        gsap.to(this.target, { scale: 1, cursor: 'grab', zIndex: 10, duration: 0.2 });
      }
    });

    // 2. Animation d'entrée principale (Timeline)
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(logoRef.current, 
        { opacity: 0, scale: 0.8, y: -30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "elastic.out(1, 0.7)" }
      )
      .fromTo(contentRef.current.children, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" },
        "-=0.6"
      )
      .fromTo(countdownRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(btnsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      );

    // 3. Animation de flottement continu pour les éléments drag
    gsap.utils.toArray('.drag-floating').forEach((el, index) => {
      gsap.fromTo(el, 
        { opacity: 0, scale: 0 },
        { opacity: 0.6, scale: 1, duration: 1, delay: dragItems[index].delay + 1, ease: "back.out(1.5)" }
      );
      
      // Mouvement perpétuel
      gsap.to(el, {
        y: "random(-15, 15)",
        x: "random(-15, 15)",
        rotation: "random(-5, 5)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

  }, []);

  return (
    <section 
      id="hero" 
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-enigmia-dark px-6 pb-20 pt-32 md:px-10"
    >
      {/* ── Background Elements ── */}
      {/* Halo central lumineux */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[50vw] w-[50vw] rounded-full bg-enigmia-gold/5 opacity-50 blur-[100px]" />
      </div>
      
      {/* Grille technique en fond */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(var(--color-enigmia-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-enigmia-gold) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)'
        }}
      />

      {/* ── Draggable Floating Elements ── */}
      {dragItems.map((item, idx) => (
        <div
          key={idx}
          className="drag-floating absolute z-10 cursor-grab select-none font-inter text-[0.65rem] font-bold tracking-widest text-enigmia-gold opacity-0 mix-blend-screen md:text-[0.85rem]"
          style={{ top: item.top, left: item.left }}
        >
          {item.text}
        </div>
      ))}

      {/* ── Contenu Principal ── */}
      <div className="relative z-20 flex w-full max-w-5xl flex-col items-center text-center">
        
        {/* Label Date / Lieu */}
        <div className="mb-2 inline-block border border-enigmia-gold/30 bg-enigmia-dark/50 px-6 py-2 font-inter text-xs font-semibold uppercase tracking-[0.25em] text-enigmia-gold backdrop-blur-sm">
          Alger · 21–24 Mai 2026
        </div>

        {/* Le Logo Officiel (Image) */}
        <div ref={logoRef} className=" flex w-full max-w-[600px] justify-center px-4">
          <img 
            src="/Logo.png" 
            alt="EnigmIA Logo Officiel" 
            className="h-16 mb-3 w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Textes (Title & Tagline) */}
        <div ref={contentRef} className="mb-6 max-w-2xl">
          <h2 className="mb-3 font-poppins text-3xl font-bold leading-tight text-white md:text-5xl">
            Décryptez le futur grâce à l'<span className="text-enigmia-gold">Intelligence Collective</span>.
          </h2>
          <p className="font-inter text-sm leading-relaxed text-gray-400 md:text-lg">
            Un hackathon immersif inspiré de la machine Enigma. Transformez une idée en prototype fonctionnel en un temps limité. Équipes, défis, IA.
          </p>
        </div>

        {/* Compte à rebours */}
        <div ref={countdownRef} className="mb-7 flex justify-center gap-1 md:gap-3">
          <CdUnit value={d} label="Jours" showColon={true} />
          <CdUnit value={h} label="Heures" showColon={true} />
          <CdUnit value={m} label="Minutes" showColon={true} />
          <CdUnit value={s} label="Secondes" showColon={false} />
        </div>

        {/* Boutons d'Action */}
        <div ref={btnsRef} className="flex flex-col gap-4 sm:flex-row">
          <Link
            to="/inscription"
           
            className="group relative overflow-hidden bg-enigmia-gold px-10 py-4 font-inter text-sm font-bold uppercase tracking-widest text-enigmia-dark transition-all duration-300 hover:scale-105 hover:bg-white"
          >
            🚀 Je participe
          </Link>
          <a 
            href="#concept" 
            className="px-10 py-4 font-inter text-sm font-bold uppercase tracking-widest text-enigmia-gold transition-all duration-300 hover:text-white"
          >
            Le Concept
          </a>
        </div>

      </div>

      {/* Scroll Hint en bas */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 opacity-60">
        <span className="font-inter text-[0.6rem] uppercase tracking-widest text-enigmia-gold">Défiler</span>
        <div className="h-12 w-px animate-pulse bg-gradient-to-b from-enigmia-gold to-transparent" />
      </div>

    </section>
  );
}