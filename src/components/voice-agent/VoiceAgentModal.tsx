'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { VoiceAgentWidget } from './VoiceAgentWidget';
import { useEffect } from 'react';

interface VoiceAgentModalProps {
  open: boolean;
  onClose: () => void;
}

export function VoiceAgentModal({ open, onClose }: VoiceAgentModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

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
            className="relative w-full max-w-lg mx-4 rounded-3xl bg-warm-900 border border-white/10 p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-warm-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <h3 className="font-display text-2xl text-white">Talk to our AI</h3>
              <p className="mt-1 text-sm text-warm-400">
                Describe your project and get structured requirements instantly.
              </p>
            </div>

            <VoiceAgentWidget />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
