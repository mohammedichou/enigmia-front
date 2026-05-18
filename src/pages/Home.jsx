import React from 'react';

// Import de la Navigation et du Hero
import Navigation from '../components/nav/Navigation';
import SplitHero from '../components/hero/Hero';

// Import de toutes les sections
import HorizontalScrollSection from '../components/sections/HorizontalScrollSection';
import StorySection from '../components/sections/StorySection';
import CtaSection from '../components/sections/CtaSection';
import Footer from '../components/sections/Footer';
import PrizesSection from '../components/sections/PrizesSection';
import ProfilesSection from '../components/sections/ProfilesSection';
import ConceptSection from '../components/sections/ConceptSection';
import ContactPage from '../components/sections/ContactPage';
import HackathonLaunchButton from '../components/HackathonLaunchButton';

export default function Home() {
  return (
    <div className="bg-enigmia-dark min-h-screen text-white selection:bg-enigmia-gold selection:text-enigmia-dark">
      <Navigation />

      <main>
        <SplitHero />
        <StorySection />
        <ConceptSection />
        <HorizontalScrollSection />
        <ProfilesSection />
        <PrizesSection />
        <CtaSection />
        <ContactPage />

        <Footer />

      </main>

      <HackathonLaunchButton />
    </div>
  );
}