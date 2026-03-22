'use client';

import { useVapi } from './useVapi';
import { VoiceOrb } from './VoiceOrb';
import { CallControls } from './CallControls';
import { TranscriptDisplay } from './TranscriptDisplay';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Loader2, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomerInfo } from './VoiceAgentFAB';

interface VoiceAgentWidgetProps {
  customerInfo?: CustomerInfo | null;
  onClose?: () => void;
}

export function VoiceAgentWidget({ customerInfo, onClose }: VoiceAgentWidgetProps) {
  const {
    status, volumeLevel, transcript, isMuted, isDemo,
    postCallState, startCall, stopCall, toggleMute, resetPostCall,
  } = useVapi(customerInfo || undefined);

  // Show post-call screen when saving/processing/done
  if (postCallState !== 'none') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="post-call"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center gap-5 py-4"
        >
          {/* Saving */}
          {postCallState === 'saving' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Saving your session...</p>
                <p className="text-xs text-warm-400 mt-1">Storing transcript and customer details</p>
              </div>
            </>
          )}

          {/* Processing with AI */}
          {postCallState === 'processing' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">AI is analyzing your conversation...</p>
                <p className="text-xs text-warm-400 mt-1">Generating insights, requirements, and project specs</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {['Extracting requirements', 'Building user stories', 'Estimating effort'].map((step, i) => (
                  <span key={i} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] text-warm-400">
                    {step}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Done */}
          {postCallState === 'done' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Session saved successfully</p>
                <p className="text-xs text-warm-400 mt-1">
                  Your requirements have been captured and analyzed. Our team will review and follow up at <strong className="text-warm-300">{customerInfo?.email}</strong>.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => { resetPostCall(); }}
                  className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs text-warm-300 hover:bg-white/10 transition cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Start new conversation
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-xs text-white hover:bg-indigo-600 transition cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            </>
          )}

          {/* Error */}
          {postCallState === 'error' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-7 w-7 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Something went wrong</p>
                <p className="text-xs text-warm-400 mt-1">We couldn&apos;t save your session. Please try again or contact us.</p>
              </div>
              <button
                onClick={() => { resetPostCall(); }}
                className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs text-warm-300 hover:bg-white/10 transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Try again
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {isDemo && status === 'idle' && (
        <Badge className="mb-1">
          Interactive Demo
        </Badge>
      )}

      <VoiceOrb status={status} volumeLevel={volumeLevel} />

      <CallControls
        status={status}
        isMuted={isMuted}
        onStart={startCall}
        onStop={stopCall}
        onToggleMute={toggleMute}
      />

      <TranscriptDisplay transcript={transcript} status={status} />
    </div>
  );
}
