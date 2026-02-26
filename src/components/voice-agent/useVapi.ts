'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceAgentStatus, TranscriptEntry } from '@/types';
import type { CustomerInfo } from './VoiceAgentFAB';
import { VAPI_SYSTEM_PROMPT, VAPI_FIRST_MESSAGE, VAPI_VOICE_CONFIG } from '@/lib/vapi-config';

async function saveAndProcessSession(customerInfo: CustomerInfo, transcript: TranscriptEntry[]) {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const fullTranscript = transcript
      .filter((t) => t.isFinal)
      .map((t) => `${t.role === 'assistant' ? 'AI' : 'Customer'}: ${t.text}`)
      .join('\n\n');

    // Create the voice session record first
    const { data: session } = await supabase
      .from('voice_sessions')
      .insert({
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_company: customerInfo.company || null,
        project_brief: customerInfo.brief || null,
        transcript: fullTranscript,
        status: 'new',
      })
      .select()
      .single();

    if (!session) return;

    // Process with AI in background (don't block)
    fetch('/api/voice-session/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: fullTranscript,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerCompany: customerInfo.company,
        projectBrief: customerInfo.brief,
      }),
    })
      .then((res) => res.json())
      .then(async (result) => {
        if (result.error) return;
        await supabase
          .from('voice_sessions')
          .update({
            session_name: result.session_name,
            ai_insights: result.ai_insights,
            ai_output: result.ai_output,
            status: 'reviewed',
          })
          .eq('id', session.id);
      })
      .catch((err) => console.error('Failed to process session:', err));
  } catch (err) {
    console.error('Failed to save voice session:', err);
  }
}

export function useVapi(customerInfo?: CustomerInfo) {
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const vapiRef = useRef<any>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

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
        if (customerInfo && transcriptRef.current.length > 0) {
          saveAndProcessSession(customerInfo, transcriptRef.current);
        }
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
                { role: msg.role, text: msg.transcript, timestamp: Date.now(), isFinal: true },
              ];
            }
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && !updated[lastIdx].isFinal && updated[lastIdx].role === msg.role) {
              updated[lastIdx] = { ...updated[lastIdx], text: msg.transcript };
            } else {
              updated.push({ role: msg.role, text: msg.transcript, timestamp: Date.now(), isFinal: false });
            }
            return updated;
          });
          if (msg.role === 'assistant') setStatus('speaking');
        }
      });
      vapi.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setStatus('idle');
      });
    });

    return () => {
      if (vapi) vapi.stop();
    };
  }, [hasKey, customerInfo]);

  const startDemoMode = useCallback(() => {
    setStatus('connecting');
    setTimeout(() => {
      setStatus('listening');
      const demoTranscript: TranscriptEntry[] = [
        {
          role: 'assistant',
          text: VAPI_FIRST_MESSAGE,
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
          setTranscript((prev) => [...prev, { role: 'user', text: "We're building a project management tool with AI-powered requirements gathering. Think Jira but with voice agents that can capture specs from stakeholder conversations.", timestamp: t, isFinal: true }]);
        } else if (step === 2) {
          setStatus('thinking');
        } else if (step === 3) {
          setStatus('speaking');
          setTranscript((prev) => [...prev, { role: 'assistant', text: "That's a compelling vision — an AI-native project management platform. Can you tell me who the primary users will be? Are we talking about product managers, engineering leads, or a broader team?", timestamp: t, isFinal: true }]);
        } else if (step === 4) {
          setStatus('listening');
          setTranscript((prev) => [...prev, { role: 'user', text: "Primarily product managers and engineering teams. PMs waste hours writing specs manually, and engineers complain they never get clear enough requirements. We want to eliminate that friction.", timestamp: t, isFinal: true }]);
        } else if (step === 5) {
          setStatus('thinking');
        } else if (step === 6) {
          setStatus('speaking');
          setTranscript((prev) => [...prev, { role: 'assistant', text: "I'm identifying three core epics: Voice Requirements Engine, Sprint Management with AI Planning, and Automated QA Generation. Should I break these down into user stories with acceptance criteria?", timestamp: t, isFinal: true }]);
        } else {
          if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
          setStatus('idle');
          if (customerInfo) saveAndProcessSession(customerInfo, transcriptRef.current);
        }
      }, 2500);

      const volumeSim = setInterval(() => setVolumeLevel(Math.random() * 0.6 + 0.1), 100);
      setTimeout(() => clearInterval(volumeSim), 18000);
    }, 1200);
  }, [customerInfo]);

  const startCall = useCallback(async () => {
    if (isDemo) { startDemoMode(); return; }

    const vapi = vapiRef.current;
    if (!vapi) return;

    setStatus('connecting');
    setTranscript([]);
    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      const systemContent = `${VAPI_SYSTEM_PROMPT}${customerInfo ? `\n\nCustomer context: Name: ${customerInfo.name}, Company: ${customerInfo.company || 'N/A'}, Brief: ${customerInfo.brief || 'N/A'}` : ''}`;

      if (assistantId) {
        // Use dashboard assistant — override only prompt + first message from our codebase
        // Model provider and voice are inherited from the dashboard assistant config
        await vapi.start(assistantId, {
          firstMessage: VAPI_FIRST_MESSAGE,
          variableValues: {
            systemPrompt: systemContent,
          },
        });
      } else {
        await vapi.start({
          model: {
            provider: 'openai',
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemContent },
            ],
          },
          voice: VAPI_VOICE_CONFIG,
          firstMessage: VAPI_FIRST_MESSAGE,
        });
      }
    } catch (err) {
      console.error('Failed to start call:', err);
      setStatus('idle');
    }
  }, [isDemo, startDemoMode, customerInfo]);

  const stopCall = useCallback(() => {
    if (isDemo) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      setStatus('idle');
      setVolumeLevel(0);
      if (customerInfo && transcriptRef.current.length > 0) {
        saveAndProcessSession(customerInfo, transcriptRef.current);
      }
      return;
    }
    const vapi = vapiRef.current;
    if (vapi) vapi.stop();
    setStatus('idle');
    setVolumeLevel(0);
  }, [isDemo, customerInfo]);

  const toggleMute = useCallback(() => {
    if (!isDemo && vapiRef.current) {
      const newMuted = !isMuted;
      vapiRef.current.setMuted(newMuted);
      setIsMuted(newMuted);
    } else {
      setIsMuted(!isMuted);
    }
  }, [isMuted, isDemo]);

  return { status, volumeLevel, transcript, isMuted, isDemo, startCall, stopCall, toggleMute };
}
