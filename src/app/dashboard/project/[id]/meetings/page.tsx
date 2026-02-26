'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Plus, Loader2, Calendar, Clock } from 'lucide-react';
import type { Meeting } from '@/types/dashboard';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Modal } from '@/components/dashboard/ui/Modal';

export default function MeetingsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState<Meeting['meeting_type']>('general');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('project_id', projectId)
      .order('scheduled_at', { ascending: false });
    setMeetings(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('meetings').insert({
      project_id: projectId,
      title,
      description: description || null,
      meeting_type: meetingType,
      scheduled_at: scheduledAt || null,
      duration_minutes: duration,
      created_by: user?.id,
    });
    setTitle('');
    setDescription('');
    setScheduledAt('');
    setCreateOpen(false);
    setSaving(false);
    load();
  }

  async function saveNotes() {
    if (!selectedMeeting) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('meetings').update({ notes: selectedMeeting.notes }).eq('id', selectedMeeting.id);
    setSaving(false);
    setSelectedMeeting(null);
    load();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dash-text">Meetings</h2>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-3 py-2 text-sm font-medium hover:bg-dash-accent-hover transition cursor-pointer">
          <Plus className="h-4 w-4" /> Schedule
        </button>
      </div>

      {meetings.length === 0 ? (
        <EmptyState icon={Calendar} title="No meetings scheduled" description="Schedule team meetings and track notes." />
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <button key={m.id} onClick={() => setSelectedMeeting({ ...m })} className="w-full text-left flex items-center gap-4 rounded-xl border border-dash-border bg-dash-surface p-4 hover:bg-dash-surface-2 transition cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dash-accent/10 shrink-0">
                <Calendar className="h-4 w-4 text-dash-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-dash-text">{m.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge status={m.meeting_type} />
                  {m.scheduled_at && (
                    <span className="text-xs text-dash-text-muted">
                      {new Date(m.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-dash-text-muted">
                    <Clock className="h-3 w-3" /> {m.duration_minutes}min
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Schedule Meeting">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Meeting title" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Type</label>
              <select value={meetingType} onChange={(e) => setMeetingType(e.target.value as Meeting['meeting_type'])} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="standup">Standup</option>
                <option value="sprint_planning">Sprint Planning</option>
                <option value="retro">Retrospective</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Duration</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Date & Time</label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Agenda..." rows={3} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Notes */}
      <Modal open={!!selectedMeeting} onClose={() => setSelectedMeeting(null)} title={selectedMeeting?.title || 'Meeting'} className="max-w-2xl">
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedMeeting.meeting_type} />
              {selectedMeeting.scheduled_at && (
                <span className="text-sm text-dash-text-muted">
                  {new Date(selectedMeeting.scheduled_at).toLocaleString()}
                </span>
              )}
            </div>
            {selectedMeeting.description && (
              <p className="text-sm text-dash-text-secondary">{selectedMeeting.description}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Meeting Notes</label>
              <textarea
                value={selectedMeeting.notes || ''}
                onChange={(e) => setSelectedMeeting({ ...selectedMeeting, notes: e.target.value })}
                placeholder="Add notes..."
                rows={8}
                className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none font-mono"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedMeeting(null)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Close</button>
              <button onClick={saveNotes} disabled={saving} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Notes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
