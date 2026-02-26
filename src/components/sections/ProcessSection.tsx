'use client';

import { PROCESS_STEPS } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { TextReveal } from '@/components/animations/TextReveal';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export function ProcessSection() {
  return (
    <section id="process" className="bg-surface py-32 sm:py-40">
      <Container>
        <div className="mb-20">
          <TextReveal text="How we work with you" />
        </div>

        <div className="grid gap-16 sm:gap-20 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-24">
          {PROCESS_STEPS.map((step, i) => (
            <ScrollReveal key={step.num} offset={50 + i * 10}>
              <div>
                <span className="font-display text-7xl leading-none text-warm-200 sm:text-8xl">
                  {step.num}
                </span>
                <h3 className="mt-4 font-display text-2xl text-ink sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-ink-muted max-w-md">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
