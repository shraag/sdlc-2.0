'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { VoiceAgentModal } from './VoiceAgentModal';
import { InfoCaptureModal } from './InfoCaptureModal';

export interface CustomerInfo {
  name: string;
  email: string;
  company: string;
  brief: string;
}

export function VoiceAgentFAB() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  function handleInfoSubmit(info: CustomerInfo) {
    setCustomerInfo(info);
    setInfoOpen(false);
    setVoiceOpen(true);
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200, damping: 15 }}
        onClick={() => setInfoOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-ink text-warm-50 pl-5 pr-6 py-3.5 shadow-xl shadow-ink/20 cursor-pointer hover:bg-warm-700 transition-colors group"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-30" />
          <Mic className="relative h-4 w-4" />
        </span>
        <span className="text-sm font-medium">Talk to AI</span>
      </motion.button>

      <InfoCaptureModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        onSubmit={handleInfoSubmit}
      />

      <VoiceAgentModal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        customerInfo={customerInfo}
      />
    </>
  );
}
