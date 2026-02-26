'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import type { CustomerInfo } from './VoiceAgentFAB';

interface InfoCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (info: CustomerInfo) => void;
}

export function InfoCaptureModal({ open, onClose, onSubmit }: InfoCaptureModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [brief, setBrief] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, email, company, brief });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-warm-900/85 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 rounded-3xl bg-warm-900 border border-white/10 p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-warm-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className="font-display text-2xl text-white">Before we start</h3>
              <p className="mt-1 text-sm text-warm-400">
                Tell us a bit about yourself so our AI agent can tailor the conversation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-warm-400 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Smith"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-400 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jane@company.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-400 mb-1.5">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-400 mb-1.5">
                  Brief project description
                </label>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="We're building a..."
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-white py-3 text-sm font-medium hover:bg-accent-hover transition cursor-pointer"
              >
                Start conversation
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
