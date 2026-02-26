'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceAgentStatus, TranscriptEntry } from '@/types';

export function useVapi() {
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const vapiRef = useRef<any>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const hasKey = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  useEffect(() => {
    if (!hasKey) {
      setIsDemo(true);
      return;
    }

    let vapi: any;
    import('@vapi-ai/web').then((mod) => {
      const Vapi = mod.default;
      vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
      vapiRef.current = vapi;

      vapi.on('call-start', () => setStatus('listening'));
      vapi.on('call-end', () => {
        setStatus('idle');
        setVolumeLevel(0);
      });
      vapi.on('speech-start', () => setStatus('listening'));
      vapi.on('speech-end', () => setStatus('thinking'));
      vapi.on('volume-level', (level: number) => setVolumeLevel(level));
      vapi.on('message', (msg: any) => {
        if (msg.type === 'transcript') {
          setTranscript((prev) => {
            if (!msg.transcriptType || msg.transcriptType === 'final') {
              return [
                ...prev,
                {
                  role: msg.role,
                  text: msg.transcript,
                  timestamp: Date.now(),
                  isFinal: true,
                },
              ];
            }
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && !updated[lastIdx].isFinal && updated[lastIdx].role === msg.role) {
              updated[lastIdx] = { ...updated[lastIdx], text: msg.transcript };
            } else {
              updated.push({
                role: msg.role,
                text: msg.transcript,
                timestamp: Date.now(),
                isFinal: false,
              });
            }
            return updated;
          });

          if (msg.role === 'assistant') {
            setStatus('speaking');
          }
        }
      });
      vapi.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setStatus('idle');
      });
    });

    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, [hasKey]);

  const startDemoMode = useCallback(() => {
    setStatus('connecting');
    setTimeout(() => {
      setStatus('listening');
      const demoTranscript: TranscriptEntry[] = [
        {
          role: 'assistant',
          text: "Hi! I'm Foundry's AI requirements agent. Tell me about the software you're looking to build.",
          timestamp: Date.now(),
          isFinal: true,
        },
      ];
      setTranscript(demoTranscript);

      let step = 0;
      demoIntervalRef.current = setInterval(() => {
        step++;
        const t = Date.now();

        if (step === 1) {
          setStatus('listening');
          setTranscript((prev) => [
            ...prev,
            { role: 'user', text: "We're building a project management tool with AI features...", timestamp: t, isFinal: true },
          ]);
        } else if (step === 2) {
          setStatus('thinking');
        } else if (step === 3) {
          setStatus('speaking');
          setTranscript((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: 'That sounds exciting. Can you tell me who the primary users will be and what their biggest pain points are?',
              timestamp: t,
              isFinal: true,
            },
          ]);
        } else if (step === 4) {
          setStatus('listening');
          setTranscript((prev) => [
            ...prev,
            { role: 'user', text: 'Engineering teams — they waste too much time in requirement meetings...', timestamp: t, isFinal: true },
          ]);
        } else if (step === 5) {
          setStatus('thinking');
        } else if (step === 6) {
          setStatus('speaking');
          setTranscript((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: "I've identified 3 epics so far: User Management, AI Requirements Engine, and Sprint Board. Want me to break these into user stories?",
              timestamp: t,
              isFinal: true,
            },
          ]);
        } else {
          if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
          setStatus('idle');
        }
      }, 2500);

      // Simulate volume
      const volumeSim = setInterval(() => {
        setVolumeLevel(Math.random() * 0.6 + 0.1);
      }, 100);

      setTimeout(() => clearInterval(volumeSim), 18000);
    }, 1200);
  }, []);

  const startCall = useCallback(async () => {
    if (isDemo) {
      startDemoMode();
      return;
    }

    const vapi = vapiRef.current;
    if (!vapi) return;

    setStatus('connecting');
    setTranscript([]);
    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (assistantId) {
        await vapi.start(assistantId);
      } else {
        await vapi.start({
          model: {
            provider: 'openai',
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are Foundry AI's requirements gathering agent. Your job is to have a natural conversation with a product stakeholder to understand their software project requirements. Follow this approach:
1. Understand the high-level project vision
2. Ask about target users and pain points
3. Drill into specific features
4. Clarify acceptance criteria
5. Identify technical constraints
6. Summarize captured requirements

Ask one question at a time. Be conversational and friendly.`,
              },
            ],
          },
          voice: {
            provider: '11labs',
            voiceId: 'EXAVITQu4vr4xnSDxMaL',
          },
          firstMessage:
            "Hi! I'm Foundry's AI requirements agent. Tell me about the software you're looking to build.",
        });
      }
    } catch (err) {
      console.error('Failed to start call:', err);
      setStatus('idle');
    }
  }, [isDemo, startDemoMode]);

  const stopCall = useCallback(() => {
    if (isDemo) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      setStatus('idle');
      setVolumeLevel(0);
      return;
    }

    const vapi = vapiRef.current;
    if (vapi) {
      vapi.stop();
    }
    setStatus('idle');
    setVolumeLevel(0);
  }, [isDemo]);

  const toggleMute = useCallback(() => {
    if (!isDemo && vapiRef.current) {
      const newMuted = !isMuted;
      vapiRef.current.setMuted(newMuted);
      setIsMuted(newMuted);
    } else {
      setIsMuted(!isMuted);
    }
  }, [isMuted, isDemo]);

  return {
    status,
    volumeLevel,
    transcript,
    isMuted,
    isDemo,
    startCall,
    stopCall,
    toggleMute,
  };
}
