'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceAgentStatus, TranscriptEntry } from '@/types';
import type { CustomerInfo } from './VoiceAgentFAB';
import { VAPI_SYSTEM_PROMPT, VAPI_FIRST_MESSAGE, VAPI_VOICE_CONFIG } from '@/lib/vapi-config';

export type PostCallState = 'none' | 'saving' | 'processing' | 'done' | 'error';

async function saveAndProcessSession(
  customerInfo: CustomerInfo,
  transcript: TranscriptEntry[],
  onStateChange: (state: PostCallState) => void
) {
  try {
    onStateChange('saving');
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const fullTranscript = transcript
      .filter((t) => t.isFinal)
      .map((t) => `${t.role === 'assistant' ? 'AI' : 'Customer'}: ${t.text}`)
      .join('\n\n');

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

    if (!session) { onStateChange('error'); return; }

    onStateChange('processing');

    try {
      const res = await fetch('/api/voice-session/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: fullTranscript,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerCompany: customerInfo.company,
          projectBrief: customerInfo.brief,
        }),
      });
      const result = await res.json();
      if (!result.error) {
        await supabase
          .from('voice_sessions')
          .update({
            session_name: result.session_name,
            ai_insights: result.ai_insights,
            ai_output: result.ai_output,
            status: 'reviewed',
          })
          .eq('id', session.id);
      }
    } catch (err) {
      console.error('Failed to process session:', err);
    }

    onStateChange('done');
  } catch (err) {
    console.error('Failed to save voice session:', err);
    onStateChange('error');
  }
}

export function useVapi(customerInfo?: CustomerInfo) {
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [postCallState, setPostCallState] = useState<PostCallState>('none');
  const vapiRef = useRef<any>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const volumeSimRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const customerInfoRef = useRef(customerInfo);
  const savingRef = useRef(false); // prevent double-save

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    customerInfoRef.current = customerInfo;
  }, [customerInfo]);

  const hasKey = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  // Vapi setup — only depends on hasKey, not customerInfo
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
        const info = customerInfoRef.current;
        if (info && transcriptRef.current.length > 0 && !savingRef.current) {
          savingRef.current = true;
          saveAndProcessSession(info, transcriptRef.current, setPostCallState);
        }
      });
      vapi.on('speech-start', () => setStatus('listening'));
      vapi.on('speech-end', () => setStatus('thinking'));
      vapi.on('volume-level', (level: number) => setVolumeLevel(level));
      vapi.on('message', (msg: any) => {
        if (msg.type === 'transcript') {
          setTranscript((prev) => {
            if (!msg.transcriptType || msg.transcriptType === 'final') {
              return [...prev, { role: msg.role, text: msg.transcript, timestamp: Date.now(), isFinal: true }];
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
  }, [hasKey]);

  function cleanupDemo() {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    if (volumeSimRef.current) {
      clearInterval(volumeSimRef.current);
      volumeSimRef.current = null;
    }
  }

  function endCallAndSave() {
    if (savingRef.current) return; // already saving
    const info = customerInfoRef.current;
    if (info && transcriptRef.current.length > 0) {
      savingRef.current = true;
      saveAndProcessSession(info, transcriptRef.current, setPostCallState);
    }
  }

  const startDemoMode = useCallback(() => {
    setPostCallState('none');
    savingRef.current = false;
    setStatus('connecting');
    setTimeout(() => {
      setStatus('listening');
      setTranscript([
        { role: 'assistant', text: VAPI_FIRST_MESSAGE, timestamp: Date.now(), isFinal: true },
      ]);

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
          cleanupDemo();
          setStatus('idle');
          setVolumeLevel(0);
          endCallAndSave();
        }
      }, 2500);

      volumeSimRef.current = setInterval(() => setVolumeLevel(Math.random() * 0.6 + 0.1), 100);
    }, 1200);
  }, []);

  const startCall = useCallback(async () => {
    setPostCallState('none');
    savingRef.current = false;

    if (isDemo) { startDemoMode(); return; }

    const vapi = vapiRef.current;
    if (!vapi) return;

    setStatus('connecting');
    setTranscript([]);
    try {
      const info = customerInfoRef.current;
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      const systemContent = `${VAPI_SYSTEM_PROMPT}${info ? `\n\nCustomer context: Name: ${info.name}, Company: ${info.company || 'N/A'}, Brief: ${info.brief || 'N/A'}` : ''}`;

      if (assistantId) {
        await vapi.start(assistantId, {
          firstMessage: VAPI_FIRST_MESSAGE,
          variableValues: { systemPrompt: systemContent },
        });
      } else {
        await vapi.start({
          model: {
            provider: 'openai',
            model: 'gpt-4o',
            messages: [{ role: 'system', content: systemContent }],
          },
          voice: VAPI_VOICE_CONFIG,
          firstMessage: VAPI_FIRST_MESSAGE,
        });
      }
    } catch (err) {
      console.error('Failed to start call:', err);
      setStatus('idle');
    }
  }, [isDemo, startDemoMode]);

  const stopCall = useCallback(() => {
    if (isDemo) {
      cleanupDemo();
      setStatus('idle');
      setVolumeLevel(0);
      endCallAndSave();
      return;
    }
    const vapi = vapiRef.current;
    if (vapi) vapi.stop();
    // Don't call endCallAndSave here — the call-end event handler will do it
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

  function resetPostCall() {
    setPostCallState('none');
    savingRef.current = false;
    setTranscript([]);
  }

  return { status, volumeLevel, transcript, isMuted, isDemo, postCallState, startCall, stopCall, toggleMute, resetPostCall };
}
