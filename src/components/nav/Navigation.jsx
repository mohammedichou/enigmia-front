import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { navLinks } from '../../data';
import { Link } from 'react-router-dom';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // 1. Gestion du scroll pour changer le fond de la navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 2. Animation d'entrée GSAP
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  // 3. Bloquer le scroll du corps de la page quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Petite animation d'apparition des liens mobiles
      gsap.fromTo(
        '.mobile-link',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ── BARRE DE NAVIGATION PRINCIPALE ── */}
      <nav
        ref={navRef}
        className={`fixed left-0 right-0 top-0 z-[900] transition-all duration-500 bg-enigmia-dark/90    py-4
          `}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 md:px-10">
          
         <img src="/Logo.png" className='h-12' alt="" />

          {/* Menu Desktop */}
          <ul className="hidden items-center gap-8 md:flex lg:gap-12">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="group relative font-inter text-[0.75rem] font-medium uppercase tracking-[0.15em] text-gray-300 transition-colors duration-300 hover:text-enigmia-gold"
                >
                  {label}
                  {/* Point doré au survol */}
                  <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-enigmia-gold opacity-0 transition-all duration-300 group-hover:bottom-[-6px] group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>

          {/* Boutons Desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/classement"
              className="font-inter text-[0.75rem] font-bold uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-enigmia-gold"
            >
              Classement
            </Link>
            <Link
              to="/inscription"
              className="border border-enigmia-gold bg-enigmia-gold/5 px-6 py-2.5 font-inter text-[0.75rem] font-bold uppercase tracking-[0.15em] text-enigmia-gold transition-all duration-300 hover:bg-enigmia-gold hover:text-enigmia-dark"
            >
              Je participe
            </Link>
          </div>

          {/* Bouton Hamburger Mobile */}
          <button
            className="relative z-[901] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span className={`h-px w-6 bg-enigmia-gold transition-all duration-300 ${isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-px w-6 bg-enigmia-gold transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-px w-6 bg-enigmia-gold transition-all duration-300 ${isMobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* ── OVERLAY MENU MOBILE ── */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-0 z-[899] flex flex-col items-center justify-center bg-enigmia-dark/98 backdrop-blur-xl transition-all duration-500 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ul className="flex w-full flex-col items-center gap-8 px-6 text-center">
          {navLinks.map(({ label, href }) => (
            <li key={href} className="mobile-link overflow-hidden">
              <a
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-poppins text-3xl font-bold tracking-widest text-white transition-colors hover:text-enigmia-gold"
              >
                {label}
              </a>
            </li>
          ))}
          <li className="mobile-link overflow-hidden">
            <Link
              to="/classement"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-poppins text-3xl font-bold tracking-widest text-white transition-colors hover:text-enigmia-gold"
            >
              Classement
            </Link>
          </li>
          <li className="mobile-link mt-8 w-full max-w-[250px]">
            <a
              href="#inscription"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full bg-enigmia-gold py-4 font-inter text-sm font-bold uppercase tracking-widest text-enigmia-dark shadow-[0_0_20px_rgba(225,193,153,0.3)] transition-transform hover:scale-105"
            >
              🚀 Je participe
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}