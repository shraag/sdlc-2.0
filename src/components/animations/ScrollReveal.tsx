'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
  once?: boolean;
}

export function ScrollReveal({ children, className, offset = 60 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.75'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [offset, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
