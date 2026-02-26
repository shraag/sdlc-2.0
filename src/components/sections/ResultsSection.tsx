'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { METRICS } from '@/lib/constants';
import { Container } from '@/components/ui/Container';

function AnimatedCounter({ value, suffix, duration = 2000 }: { value: string; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const target = parseInt(value, 10);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export function ResultsSection() {
  return (
    <section id="results" className="bg-warm-900 py-32 sm:py-40">
      <Container>
        <div className="text-center mb-20">
          <h2 className="font-display text-3xl text-white sm:text-4xl lg:text-5xl">
            Results that <span className="italic">speak</span>
          </h2>
          <p className="mt-5 text-base text-warm-400 sm:text-lg mx-auto max-w-xl">
            Real outcomes from real projects. No vanity metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
          {METRICS.map((metric) => (
            <div key={metric.label} className="text-center py-8">
              <div className="font-display text-6xl text-white sm:text-7xl lg:text-8xl">
                <AnimatedCounter value={metric.value} suffix={metric.suffix} />
              </div>
              <p className="mt-4 text-sm uppercase tracking-widest text-warm-400">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
