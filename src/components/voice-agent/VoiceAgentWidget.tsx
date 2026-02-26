'use client';

import { useVapi } from './useVapi';
import { VoiceOrb } from './VoiceOrb';
import { CallControls } from './CallControls';
import { TranscriptDisplay } from './TranscriptDisplay';
import { Badge } from '@/components/ui/Badge';
import type { CustomerInfo } from './VoiceAgentFAB';

interface VoiceAgentWidgetProps {
  customerInfo?: CustomerInfo | null;
}

export function VoiceAgentWidget({ customerInfo }: VoiceAgentWidgetProps) {
  const { status, volumeLevel, transcript, isMuted, isDemo, startCall, stopCall, toggleMute } =
    useVapi(customerInfo || undefined);

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
