'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { TextReveal } from '@/components/animations/TextReveal';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="bg-surface-alt py-32 sm:py-40">
      <Container>
        <div className="flex items-end justify-between mb-16">
          <div>
            <TextReveal text="What our clients say" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={scrollPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted hover:text-ink hover:bg-warm-100 transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted hover:text-ink hover:bg-warm-100 transition-colors cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ScrollReveal>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_calc(50%-10px)]"
                >
                  <div className="rounded-2xl border border-border bg-white p-8 sm:p-10 h-full flex flex-col">
                    <span className="font-display text-5xl text-warm-200 leading-none mb-6">&ldquo;</span>
                    <p className="font-display text-lg leading-relaxed text-ink italic flex-1">
                      {t.quote}
                    </p>
                    <div className="mt-8 pt-6 border-t border-border">
                      <div className="text-sm font-medium text-ink">{t.author}</div>
                      <div className="text-sm text-ink-muted">
                        {t.title}, {t.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="flex sm:hidden items-center justify-center gap-2 mt-8">
          <button onClick={scrollPrev} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted cursor-pointer" aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={scrollNext} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted cursor-pointer" aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Container>
    </section>
  );
}
