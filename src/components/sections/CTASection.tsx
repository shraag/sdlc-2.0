'use client';

import { useState } from 'react';
import { ArrowRight, Mic } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { VoiceAgentModal } from '@/components/voice-agent/VoiceAgentModal';

export function CTASection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="cta" className="bg-surface-alt py-32 sm:py-40">
      <Container className="text-center">
        <ScrollReveal>
          <h2 className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl mx-auto max-w-2xl">
            Let&apos;s build something
            <br />
            <span className="italic text-ink-light">together</span>
          </h2>
          <p className="mt-6 text-base text-ink-muted sm:text-lg mx-auto max-w-lg">
            Book a free strategy session and get a sprint roadmap tailored to your project.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="#">
              Book a Strategy Call
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setModalOpen(true)}>
              <Mic className="h-4 w-4" />
              Talk to our AI
            </Button>
          </div>
        </ScrollReveal>
      </Container>

      <VoiceAgentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
