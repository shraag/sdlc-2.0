'use client';

import { useState } from 'react';
import { Mic, KanbanSquare, Bot, Puzzle, ArrowRight } from 'lucide-react';
import { PLATFORM_FEATURES } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { TextReveal } from '@/components/animations/TextReveal';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { VoiceAgentModal } from '@/components/voice-agent/VoiceAgentModal';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mic: Mic,
  'kanban-square': KanbanSquare,
  bot: Bot,
  puzzle: Puzzle,
};

export function PlatformSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="platform" className="bg-surface-alt py-32 sm:py-40">
      <Container>
        <div className="mb-16">
          <TextReveal text="Built on our own AI platform" />
          <ScrollReveal>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              We don&apos;t just use AI tools — we built one. Every project runs on our proprietary platform, so you get the same tooling we rely on daily.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {PLATFORM_FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Mic;
            return (
              <ScrollReveal key={feature.title} offset={40 + i * 15}>
                <Card
                  hover
                  highlight={feature.highlighted}
                  className={cn('h-full', feature.highlighted && 'sm:col-span-1')}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-warm-100 text-ink-light border border-border">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl text-ink mb-2">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted mb-4">{feature.description}</p>
                  {feature.highlighted && (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer"
                    >
                      Try it live <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>

      <VoiceAgentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
