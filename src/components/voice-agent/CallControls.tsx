'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, MicOff, Mic } from 'lucide-react';
import type { VoiceAgentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface CallControlsProps {
  status: VoiceAgentStatus;
  isMuted: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMute: () => void;
}

export function CallControls({ status, isMuted, onStart, onStop, onToggleMute }: CallControlsProps) {
  const isActive = status !== 'idle';
  const isConnecting = status === 'connecting';

  return (
    <div className="flex items-center gap-3">
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.button
            key="mute"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onToggleMute}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer',
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/10 text-white/60 border border-white/10 hover:text-white hover:bg-white/15'
            )}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        onClick={isActive ? onStop : onStart}
        disabled={isConnecting}
        className={cn(
          'flex h-12 items-center gap-2 rounded-full px-6 font-medium transition-all duration-200 cursor-pointer text-sm',
          isActive
            ? 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25'
            : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20',
          isConnecting && 'opacity-70 cursor-wait'
        )}
        whileTap={{ scale: 0.96 }}
      >
        {isActive ? (
          <>
            <PhoneOff className="h-4 w-4" />
            <span>End</span>
          </>
        ) : (
          <>
            <Phone className="h-4 w-4" />
            <span>{isConnecting ? 'Connecting...' : 'Start Conversation'}</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
