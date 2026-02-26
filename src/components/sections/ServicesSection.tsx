'use client';

import { Mic, Palette, Code, ShieldCheck, Rocket } from 'lucide-react';
import { SERVICES } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { TextReveal } from '@/components/animations/TextReveal';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mic: Mic,
  palette: Palette,
  code: Code,
  'shield-check': ShieldCheck,
  rocket: Rocket,
};

export function ServicesSection() {
  return (
    <section id="services" className="bg-surface py-32 sm:py-40">
      <Container>
        <div className="mb-20">
          <TextReveal text="What we do" />
          <ScrollReveal>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              End-to-end software delivery, from the first conversation to production. Every stage accelerated by our AI-native tooling.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid gap-0 border-t border-border">
          {SERVICES.map((service, i) => {
            const Icon = iconMap[service.icon] || Code;
            return (
              <ScrollReveal key={service.num} offset={40 + i * 10}>
                <div className="grid grid-cols-1 gap-6 border-b border-border py-10 sm:grid-cols-[80px_1fr_1fr] sm:items-start sm:gap-12">
                  <span className="font-display text-4xl text-warm-300 sm:text-5xl">
                    {service.num}
                  </span>
                  <h3 className="font-display text-2xl text-ink sm:text-3xl flex items-center gap-3">
                    <Icon className="h-5 w-5 text-ink-muted hidden sm:block" />
                    {service.title}
                  </h3>
                  <p className="text-base leading-relaxed text-ink-muted">
                    {service.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
