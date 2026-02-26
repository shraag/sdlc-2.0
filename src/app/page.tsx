import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { PlatformSection } from '@/components/sections/PlatformSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { ResultsSection } from '@/components/sections/ResultsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';
import { VoiceAgentFAB } from '@/components/voice-agent/VoiceAgentFAB';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <PlatformSection />
        <ProcessSection />
        <ResultsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <VoiceAgentFAB />
    </>
  );
}
