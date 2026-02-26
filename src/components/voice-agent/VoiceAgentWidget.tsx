'use client';

import { useVapi } from './useVapi';
import { VoiceOrb } from './VoiceOrb';
import { CallControls } from './CallControls';
import { TranscriptDisplay } from './TranscriptDisplay';
import { Badge } from '@/components/ui/Badge';

export function VoiceAgentWidget() {
  const { status, volumeLevel, transcript, isMuted, isDemo, startCall, stopCall, toggleMute } =
    useVapi();

  return (
    <div className="flex flex-col items-center gap-6">
      {isDemo && status === 'idle' && (
        <Badge variant="gradient" className="mb-1">
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
