'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  FolderPlus,
  CheckCircle2,
  Play,
  Download,
} from 'lucide-react';
import type { VoiceSession, AIOutput, AIInsights } from '@/types/dashboard';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('voice_sessions').select('*').eq('id', id).single();
      if (data) setSession(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function generateInsights() {
    if (!session?.transcript) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/voice-session/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: session.transcript,
          customerName: session.customer_name,
          customerEmail: session.customer_email,
          customerCompany: session.customer_company,
          projectBrief: session.project_brief,
        }),
      });
      const result = await res.json();
      if (!result.error) {
        const supabase = createClient();
        await supabase
          .from('voice_sessions')
          .update({
            session_name: result.session_name,
            ai_insights: result.ai_insights,
            ai_output: result.ai_output,
            status: 'reviewed',
          })
          .eq('id', id);
        setSession((prev) =>
          prev
            ? {
                ...prev,
                session_name: result.session_name,
                ai_insights: result.ai_insights,
                ai_output: result.ai_output,
                status: 'reviewed',
              }
            : prev
        );
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
    } finally {
      setGenerating(false);
    }
  }

  async function convertToProject() {
    if (!session?.ai_output) return;
    setConverting(true);
    try {
      const supabase = createClient();
      const { data: project } = await supabase
        .from('projects')
        .insert({
          name: session.session_name || session.customer_company
            ? `${session.customer_company} Project`
            : `${session.customer_name}'s Project`,
          description: session.ai_insights?.summary || session.project_brief || 'Created from voice session',
        })
        .select()
        .single();

      if (!project) throw new Error('Failed to create project');

      for (const epic of session.ai_output.epics) {
        const { data: epicTask } = await supabase
          .from('tasks')
          .insert({
            project_id: project.id,
            title: epic.title,
            description: epic.description || null,
            type: 'epic',
            status: 'todo',
            priority: 'medium',
          })
          .select()
          .single();

        if (epicTask) {
          for (const story of epic.stories) {
            await supabase.from('tasks').insert({
              project_id: project.id,
              parent_id: epicTask.id,
              title: story.title,
              story_format: story.story_format || null,
              acceptance_criteria: story.criteria.map((c) => ({ text: c, checked: false })),
              estimate_hours: story.estimate_hours || null,
              type: 'story',
              status: 'todo',
              priority: 'medium',
            });
          }
        }
      }

      await supabase
        .from('voice_sessions')
        .update({ status: 'converted', project_id: project.id })
        .eq('id', id);
      router.push(`/dashboard/project/${project.id}`);
    } catch (err) {
      console.error('Failed to convert:', err);
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" />
      </div>
    );
  }

  if (!session) {
    return <div className="text-center py-20"><p className="text-dash-text-muted">Session not found</p></div>;
  }

  const insights = session.ai_insights;
  const hasInsights = !!insights;

  return (
    <div>
      {/* Header */}
      <button onClick={() => router.push('/dashboard/sessions')} className="flex items-center gap-2 text-sm text-dash-text-muted hover:text-dash-text mb-4 transition cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Back to sessions
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-dash-text">
            {session.session_name || `${session.customer_name}'s Session`}
          </h1>
          <p className="text-sm text-dash-text-muted mt-1">
            Recorded {new Date(session.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={session.status} />
          {!hasInsights && session.transcript && (
            <button onClick={generateInsights} disabled={generating} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? 'Processing...' : 'Generate Insights'}
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 mb-8">
        {/* Left: AI Insights */}
        <div className="space-y-6">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-dash-accent uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> AI Insights
            </p>

            {hasInsights ? (
              <>
                <div className="mb-6">
                  <p className="text-xs text-dash-text-muted uppercase tracking-wider mb-2">Summary</p>
                  <h3 className="text-sm font-semibold text-dash-text mb-3">Key Takeaways</h3>
                  <ul className="space-y-2">
                    {insights.key_takeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dash-text-secondary leading-relaxed">
                        <span className="text-dash-accent mt-1.5 shrink-0">•</span>
                        <span dangerouslySetInnerHTML={{ __html: t.replace(/\*\*(.*?)\*\*/g, '<strong class="text-dash-text">$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </div>

                {insights.topics.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-dash-text mb-3">Topics Discussed</h3>
                    <div className="space-y-4">
                      {insights.topics.map((topic, i) => (
                        <div key={i}>
                          <h4 className="text-sm font-semibold text-dash-text mb-2">{topic.title}</h4>
                          <ul className="space-y-1.5">
                            {topic.points.map((p, j) => (
                              <li key={j} className="text-sm text-dash-text-secondary leading-relaxed">
                                <span className="text-dash-accent mr-1.5">•</span>
                                <strong className="text-dash-text">{p.label}:</strong> {p.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-dash-border p-6 text-center">
                <Sparkles className="h-6 w-6 text-dash-text-muted mx-auto mb-2" />
                <p className="text-xs text-dash-text-muted">
                  {session.transcript ? 'Click "Generate Insights" to analyze' : 'Waiting for transcript'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Recording placeholder */}
        <div>
          <div className="rounded-xl border border-dash-border bg-dash-surface overflow-hidden">
            <div className="aspect-video bg-dash-bg flex items-center justify-center">
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dash-surface-2 mx-auto mb-3">
                  <Play className="h-6 w-6 text-dash-text-muted ml-1" />
                </div>
                <p className="text-sm text-dash-text-muted">Recording not available</p>
                <p className="text-xs text-dash-text-muted mt-1">Voice recordings are processed in real-time</p>
              </div>
            </div>
            {/* Session info bar */}
            <div className="border-t border-dash-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-dash-text-muted">
                <span>{session.customer_name}</span>
                <span>•</span>
                <span>{session.customer_email}</span>
                {session.customer_company && (
                  <>
                    <span>•</span>
                    <span>{session.customer_company}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {session.project_brief && (
            <div className="mt-4 rounded-xl border border-dash-border bg-dash-surface p-4">
              <p className="text-xs text-dash-text-muted uppercase tracking-wider mb-1">Project Brief</p>
              <p className="text-sm text-dash-text-secondary">{session.project_brief}</p>
            </div>
          )}
        </div>

        {/* Right: Transcript */}
        <div>
          <p className="text-xs font-semibold text-dash-text-secondary uppercase tracking-wider mb-3">Transcript</p>
          <div className="rounded-xl border border-dash-border bg-dash-surface max-h-[500px] overflow-y-auto dash-scrollbar">
            {session.transcript ? (
              <div className="p-4 space-y-4">
                {session.transcript.split('\n\n').map((block, i) => {
                  const isAI = block.startsWith('AI:');
                  const text = block.replace(/^(AI|Customer):\s*/, '');
                  return (
                    <div key={i}>
                      <p className="text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider mb-1">
                        {isAI ? 'AI Agent' : 'Customer'}
                      </p>
                      <p className="text-sm text-dash-text-secondary leading-relaxed">{text}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-dash-text-muted italic">No transcript available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI-Generated Specs */}
      {session.ai_output && session.ai_output.epics.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dash-text">Generated Requirements</h2>
            {session.status !== 'converted' && (
              <button onClick={convertToProject} disabled={converting} className="flex items-center gap-2 rounded-lg bg-dash-success text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer">
                {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
                {converting ? 'Creating...' : 'Create Project'}
              </button>
            )}
            {session.status === 'converted' && session.project_id && (
              <button onClick={() => router.push(`/dashboard/project/${session.project_id}`)} className="flex items-center gap-2 rounded-lg border border-dash-border bg-dash-surface px-4 py-2 text-sm font-medium text-dash-text hover:bg-dash-surface-2 transition cursor-pointer">
                <FolderPlus className="h-4 w-4" /> View Project
              </button>
            )}
          </div>

          <div className="space-y-4">
            {session.ai_output.epics.map((epic, i) => (
              <div key={i} className="rounded-xl border border-dash-border bg-dash-surface p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-dash-text">{epic.title}</h3>
                  <span className="text-xs text-dash-text-muted">
                    {epic.stories.length} {epic.stories.length === 1 ? 'story' : 'stories'}
                    {epic.stories.some((s) => s.estimate_hours) && (
                      <> • {epic.stories.reduce((sum, s) => sum + (s.estimate_hours || 0), 0)} hrs</>
                    )}
                  </span>
                </div>
                {epic.description && (
                  <p className="text-sm text-dash-text-muted mb-3 italic">{epic.description}</p>
                )}
                <div className="space-y-3">
                  {epic.stories.map((story, j) => (
                    <div key={j} className="rounded-lg bg-dash-surface-2 border border-dash-border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-dash-text">{story.title}</p>
                        {story.estimate_hours && (
                          <span className="text-xs text-dash-text-muted shrink-0 ml-3">{story.estimate_hours} hrs</span>
                        )}
                      </div>
                      {story.story_format && (
                        <p className="text-sm text-dash-text-secondary italic mb-2">{story.story_format}</p>
                      )}
                      <ul className="space-y-1">
                        {story.criteria.map((c, k) => (
                          <li key={k} className="flex items-start gap-2 text-sm text-dash-text-secondary">
                            <CheckCircle2 className="h-3.5 w-3.5 text-dash-success shrink-0 mt-0.5" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
