'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Warm radial accent */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/[0.03] blur-[100px]" />

      <Container className="relative z-10 text-center py-32 sm:py-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-ink-muted">
            AI-native software agency
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display text-5xl leading-[1.1] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl"
        >
          We build software
          <br />
          <span className="italic text-ink-light">at the speed of AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
        >
          Production-grade software, delivered in weeks not months.
          Voice-powered requirements, AI sprint planning, and automated QA&nbsp;&mdash;
          all on our own platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Button variant="primary" size="lg" href="#cta">
            Book a Strategy Call
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="lg" href="#services">
            How we work
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20 flex items-center justify-center gap-8"
        >
          <span className="text-xs uppercase tracking-widest text-ink-muted/60">Trusted by</span>
          {['TechScale', 'CloudBridge', 'NexGen', 'DataForge'].map((name) => (
            <span key={name} className="text-sm font-medium text-ink-muted/40">
              {name}
            </span>
          ))}
        </motion.div>
      </Container>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
    </section>
  );
}
