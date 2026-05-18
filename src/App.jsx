import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Routes, Route } from 'react-router-dom'; // On a retiré BrowserRouter d'ici

// Import de vos pages
import Home from './pages/Home';
import InscriptionPage from './pages/Inscription';
import AdminDashboard from './pages/Admin';
import EscapeGame from './pages/EscapeGame';
import Login from './pages/Login';
import TeamDashboard from './pages/TeamDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminPro from './pages/AdminPro';
import Leaderboard from './pages/Leaderboard';

/* ── Custom cursor optimisé avec GSAP ── */
function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });

    const xDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
    
    const xRing = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

    const onMouseMove = (e) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove);

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, input, select, textarea, label, .drag-floating, .drag-item')) {
        gsap.to(dot, { scale: 2.5, duration: 0.3, ease: "power2.out" });
        gsap.to(ring, { scale: 1.5, opacity: 0.3, duration: 0.3, ease: "power2.out" });
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, input, select, textarea, label, .drag-floating, .drag-item')) {
        gsap.to(dot, { scale: 1, duration: 0.3, ease: "power2.out" });
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef} 
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-2.5 w-2.5 rounded-full bg-enigmia-gold md:block" 
      />
      <div 
        ref={ringRef} 
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-9 w-9 rounded-full border border-enigmia-gold/40 md:block" 
      />
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen cursor-none bg-enigmia-dark text-white selection:bg-enigmia-gold selection:text-enigmia-dark">
      <Cursor />
      
      {/* On utilise directement Routes ici ! */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/escape" element={<EscapeGame />} />
        <Route path="/login" element={<Login />} />
        <Route path="/team/dashboard" element={<TeamDashboard />} />
        <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        <Route path="/pro" element={<AdminPro />} />
        <Route path="/classement" element={<Leaderboard />} />
      </Routes>
    </div>
  );
}