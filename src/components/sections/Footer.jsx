import React from 'react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-enigmia-gold/20 bg-enigmia-dark px-6 py-6 md:px-[60px] ">
      
      {/* Effet lumineux de fond */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-enigmia-gold/5 blur-[80px]" />

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
        
        {/* Section Gauche : Logo & Infos */}
        <div className="flex flex-col items-center md:items-start">
          <img 
            src="/Logo.png" 
            alt="EnigmIA Logo" 
            className="mb-6 h-10 w-auto object-contain md:h-12" 
          />
          <p className="font-poppins text-lg font-bold text-white">
            Hackathon Intelligence Artificielle
          </p>
          <p className="mt-2 font-inter text-[0.7rem] uppercase tracking-widest text-enigmia-gold">
            Alger · 3–8 Mai 2026
          </p>
        </div>

        {/* Section Droite : Bouton Retour en haut */}
        <button 
          onClick={scrollToTop}
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-enigmia-gold/20 bg-transparent transition-all duration-300 hover:border-enigmia-gold hover:bg-enigmia-gold/10"
          aria-label="Retour en haut"
        >
          <svg 
            className="h-6 w-6 text-enigmia-gold transition-transform duration-300 group-hover:-translate-y-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Copyright */}
      <div className="relative z-10 mt-12 border-t border-enigmia-gold/10 pt-8 text-center">
        <p className="font-inter text-xs text-gray-500">
          &copy; {new Date().getFullYear()} EnigmIA. Tous droits réservés. <br className="md:hidden" />
          Conçu pour décoder le futur.
        </p>
      </div>
    </footer>
  );
}