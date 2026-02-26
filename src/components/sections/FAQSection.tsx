'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { FAQ_ITEMS } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { TextReveal } from '@/components/animations/TextReveal';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-6 text-left cursor-pointer group"
      >
        <span className={cn(
          'font-display text-lg transition-colors sm:text-xl',
          isOpen ? 'text-ink' : 'text-ink-light group-hover:text-ink'
        )}>
          {question}
        </span>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-all">
          {isOpen ? <Minus className="h-3.5 w-3.5 text-ink" /> : <Plus className="h-3.5 w-3.5 text-ink-muted" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-base leading-relaxed text-ink-muted max-w-2xl">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-surface py-32 sm:py-40">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <TextReveal text="Frequently asked questions" className="lg:text-3xl" />
          </div>
          <div>
            <ScrollReveal>
              <div className="border-t border-border">
                {FAQ_ITEMS.map((item, i) => (
                  <AccordionItem
                    key={i}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === i}
                    onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                  />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
