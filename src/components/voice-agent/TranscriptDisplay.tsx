'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import type { TranscriptEntry, VoiceAgentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
  status: VoiceAgentStatus;
}

export function TranscriptDisplay({ transcript, status }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const isActive = status !== 'idle' || transcript.length > 0;

  if (!isActive) {
    return (
      <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-white/40">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">Start a conversation to see the transcript...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-2 w-2 rounded-full',
            status !== 'idle' ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'
          )} />
          <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
            Live Transcript
          </span>
        </div>
        {status !== 'idle' && (
          <span className="text-[11px] text-white/30">
            {status === 'listening' && 'Listening...'}
            {status === 'thinking' && 'Processing...'}
            {status === 'speaking' && 'Speaking...'}
          </span>
        )}
      </div>
      <div ref={scrollRef} className="max-h-48 overflow-y-auto p-3 space-y-2.5">
        <AnimatePresence initial={false}>
          {transcript.map((entry, i) => (
            <motion.div
              key={`${entry.timestamp}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn('flex', entry.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-3.5 py-2 text-sm leading-relaxed',
                  entry.role === 'user'
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/20 rounded-br-sm'
                    : 'bg-white/10 text-white/80 border border-white/10 rounded-bl-sm',
                  !entry.isFinal && 'opacity-60'
                )}
              >
                {entry.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {status === 'thinking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-center gap-1 rounded-xl bg-white/10 border border-white/10 px-3.5 py-2.5 rounded-bl-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
