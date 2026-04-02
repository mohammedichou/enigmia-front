import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function InscriptionPage() {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const successRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [selectedProfils, setSelectedProfils] = useState([]);

  const toggleProfil = (profil) => {
  if (selectedProfils.includes(profil)) {
    // On l'enlève
    setSelectedProfils(selectedProfils.filter(p => p !== profil));
  } else {
    // On l'ajoute
    setSelectedProfils([...selectedProfils, profil]);
  }
};
  
  // 🟢 NOUVEAU : État pour gérer le chargement pendant l'envoi
  const [isLoading, setIsLoading] = useState(false);

  // Animation d'apparition au scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      }
    );
  }, []);

  // 🟢 MIS À JOUR : Gestion de la soumission du formulaire vers le BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // On désactive le bouton
    
    // Récupération automatique de toutes les données du formulaire (y compris le fichier)
    const formData = new FormData(e.target);

    try {
      // ⚠️ Envoi au backend (assure-toi que ton backend tourne sur le port 5000)
      const response = await fetch('http://localhost:5001/api/candidatures', {
        method: 'POST',
        body: formData, // Pas besoin de Content-Type, le navigateur gère le multipart/form-data
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la transmission des données.');
      }
      
      // Animation de transition vers le message de succès si tout est bon
      gsap.to(formRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        onComplete: () => {
          formRef.current.style.display = 'none';
          successRef.current.style.display = 'block';
          gsap.fromTo(
            successRef.current,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }
          );
        },
      });

    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer.");
    } finally {
      setIsLoading(false); // On réactive le bouton si besoin
    }
  };

  // Gestion du nom de fichier pour le CV
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  return (
    <div ref={containerRef} id="inscription" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-enigmia-dark px-6 py-24 md:px-[60px] md:py-[120px]">
      
      {/* ── ARRIÈRE-PLAN (Backgrounds) ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[50vw] w-[50vw] rounded-full bg-enigmia-gold/5 opacity-50 blur-[100px]" />
      </div>
      
      <div 
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(var(--color-enigmia-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-enigmia-gold) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)'
        }}
      />

      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-enigmia-gold to-transparent opacity-50" />


      {/* ── CONTENEUR DU FORMULAIRE ── */}
      <div className="relative z-10 mx-auto w-full max-w-[800px] rounded-2xl border border-enigmia-gold/10 bg-[#1a1a18]/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md md:p-12">
        
        <div className="mb-10 flex flex-col items-center text-center">
          <img 
            src="/Logo.png" 
            alt="EnigmIA Logo" 
            className="mb-8 h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(225,193,153,0.3)] md:h-16" 
          />
          <p className="mb-3 font-inter text-[0.7rem] uppercase tracking-[0.3em] text-enigmia-gold">
            Rejoignez l'aventure
          </p>
          <h2 className="font-poppins text-3xl font-black text-white md:text-5xl">
            Candidature <span className="text-enigmia-gold">EnigmIA</span>
          </h2>
          <p className="mt-4 font-inter text-[0.9rem] leading-relaxed text-gray-400">
            Complétez ce formulaire pour soumettre votre profil. Attention, les places sont limitées.
          </p>
        </div>

        {/* Le Formulaire */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">Nom *</label>
              {/* 🟢 Ajout de name="nom" */}
              <input type="text" name="nom" required placeholder="Turing" className="w-full rounded-none border border-enigmia-gold/20 bg-enigmia-dark/80 px-4 py-3.5 font-inter text-white transition-colors focus:border-enigmia-gold focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">Prénom *</label>
              {/* 🟢 Ajout de name="prenom" */}
              <input type="text" name="prenom" required placeholder="Alan" className="w-full rounded-none border border-enigmia-gold/20 bg-enigmia-dark/80 px-4 py-3.5 font-inter text-white transition-colors focus:border-enigmia-gold focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">Email *</label>
              <input type="email" name="email" required placeholder="alan@enigma.com" className="w-full rounded-none border border-enigmia-gold/20 bg-enigmia-dark/80 px-4 py-3.5 font-inter text-white transition-colors focus:border-enigmia-gold focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">Ville *</label>
              {/* 🟢 Ajout de name="ville" */}
              <input type="text" name="ville" required placeholder="Alger, Oran..." className="w-full rounded-none border border-enigmia-gold/20 bg-enigmia-dark/80 px-4 py-3.5 font-inter text-white transition-colors focus:border-enigmia-gold focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">Téléphone *</label>
              {/* 🟢 Ajout de name="telephone" */}
              <input type="tel" name="telephone" required placeholder="+213 0 00 00 00 00" className="w-full rounded-none border border-enigmia-gold/20 bg-enigmia-dark/80 px-4 py-3.5 font-inter text-white transition-colors focus:border-enigmia-gold focus:outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-l-2 border-enigmia-gold/30 bg-enigmia-gold/5 p-5 backdrop-blur-sm">
            <label className="font-inter text-[0.75rem] font-bold uppercase tracking-wider text-enigmia-gold">
              Je peux me déplacer sur Alger du 3 au 8 mai *
            </label>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 font-inter text-gray-300 transition-colors hover:text-white">
                <input type="radio" name="deplacement" value="oui" required className="h-4 w-4 accent-enigmia-gold" />
                Oui
              </label>
              <label className="flex cursor-pointer items-center gap-2 font-inter text-gray-300 transition-colors hover:text-white">
                <input type="radio" name="deplacement" value="non" className="h-4 w-4 accent-enigmia-gold" />
                Non
              </label>
            </div>
          </div>

         {/* Profil - Choix multiple stylisé */}
{/* Profil - Choix MULTIPLES stylisé */}
<div className="flex flex-col gap-4">
  <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">
    Tes profils (Choisis-en un ou plusieurs) *
  </label>
  
  {/* On joint le tableau avec des virgules pour le FormData */}
  <input type="hidden" name="profil" value={selectedProfils.join(', ')} required={selectedProfils.length === 0} />

  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    {['Développeur', 'Data scientist', 'Designer', 'Spécialiste IA', 'Architecte', 'Product manager', 'Autres'].map((p) => {
      const isSelected = selectedProfils.includes(p);
      return (
        <button
          key={p}
          type="button"
          onClick={() => toggleProfil(p)}
          className={`border px-4 py-3 font-inter text-[0.7rem] uppercase tracking-tighter transition-all duration-300 ${
            isSelected
              ? 'border-enigmia-gold bg-enigmia-gold text-enigmia-dark shadow-[0_0_15px_rgba(225,193,153,0.4)] font-bold'
              : 'border-enigmia-gold/20 bg-enigmia-dark/50 text-gray-500 hover:border-enigmia-gold/50 hover:text-white'
          }`}
        >
          {/* Petit indicateur visuel si sélectionné */}
          {isSelected && <span className="mr-2">✓</span>}
          {p}
        </button>
      );
    })}
  </div>
  {selectedProfils.length > 0 && (
    <p className="text-[0.6rem] text-enigmia-gold/60 italic">
      {selectedProfils.length} profil(s) sélectionné(s)
    </p>
  )}
</div>

          <div className="flex flex-col gap-2">
            <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">Tes compétences techniques *</label>
            {/* 🟢 Ajout de name="competences" */}
            <textarea name="competences" required placeholder="Ex: Python, React, TensorFlow, Figma, Docker..." className="min-h-[100px] w-full resize-y rounded-none border border-enigmia-gold/20 bg-enigmia-dark/80 px-4 py-3.5 font-inter text-white transition-colors focus:border-enigmia-gold focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">Lien GitHub</label>
              {/* 🟢 Ajout de name="github" */}
              <input type="url" name="github" placeholder="https://github.com/ton-profil" className="w-full rounded-none border border-enigmia-gold/20 bg-enigmia-dark/80 px-4 py-3.5 font-inter text-white transition-colors focus:border-enigmia-gold focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">Profil LinkedIn *</label>
              {/* 🟢 Ajout de name="linkedin" */}
              <input type="url" name="linkedin" required placeholder="https://linkedin.com/in/ton-profil" className="w-full rounded-none border border-enigmia-gold/20 bg-enigmia-dark/80 px-4 py-3.5 font-inter text-white transition-colors focus:border-enigmia-gold focus:outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">
              Pourquoi participer au Hackathon ? (Plusieurs choix possibles)
            </label>
            <div className="flex flex-col gap-3 rounded-none border border-enigmia-gold/10 bg-enigmia-dark/50 p-4">
              {[
                "J’aime le challenge",
                "Je veux apprendre",
                "Je veux rencontrer de nouvelles personnes",
                "Je cherche une opportunité professionnelle ou de Freelance"
              ].map((raison, idx) => (
                <label key={idx} className="flex cursor-pointer items-start gap-3 font-inter text-[0.85rem] text-gray-300 transition-colors hover:text-white">
                  {/* 🟢 Ajout de name="raisons[]" */}
                  <input type="checkbox" name="raisons[]" className="mt-1 h-4 w-4 shrink-0 accent-enigmia-gold" value={raison} />
                  <span>{raison}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-inter text-[0.7rem] uppercase tracking-wider text-gray-400">CV (Optionnel)</label>
            <div className="relative flex items-center">
              {/* 🟢 Ajout de name="cv" */}
              <input 
                type="file" 
                name="cv"
                id="cv-upload" 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="cv-upload" 
                className="cursor-pointer border border-dashed border-enigmia-gold/40 bg-enigmia-gold/5 px-6 py-4 font-inter text-[0.8rem] text-enigmia-gold transition-colors hover:bg-enigmia-gold/10 w-full text-center"
              >
                {fileName ? (
                  <span className="text-white font-medium">📄 {fileName}</span>
                ) : (
                  <span>📁 Cliquez pour joindre votre CV (.pdf, .doc)</span>
                )}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`mt-6 w-full py-4 font-poppins text-lg font-bold uppercase tracking-widest transition-all duration-300 ${isLoading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-enigmia-gold text-enigmia-dark hover:scale-[1.02] hover:bg-white hover:shadow-[0_0_20px_rgba(225,193,153,0.4)]'}`}
          >
            {isLoading ? 'Transmission...' : 'Décoder mon avenir'}
          </button>
        </form>

        {/* Message de succès (Caché par défaut) */}
        <div ref={successRef} className="hidden py-20 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-enigmia-gold bg-enigmia-gold/10 text-5xl text-enigmia-gold">
            ✓
          </div>
          <h3 className="mb-4 font-poppins text-3xl font-bold text-white">Candidature Transmise !</h3>
          <p className="font-inter text-gray-400">
            Votre profil a bien été enregistré dans la base de données EnigmIA.<br/>
            Surveillez vos emails, nous vous contacterons très vite.
          </p>
        </div>

      </div>
    </div>
  );
}