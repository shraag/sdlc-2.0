'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Plus, Loader2, Bug as BugIcon } from 'lucide-react';
import type { Bug, Priority } from '@/types/dashboard';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';
import { PriorityBadge } from '@/components/dashboard/ui/PriorityBadge';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Modal } from '@/components/dashboard/ui/Modal';
import { Tabs } from '@/components/dashboard/ui/Tabs';

export default function BugsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Priority>('medium');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('bugs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    setBugs(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const filtered = bugs.filter((b) => b.status === activeTab);
  const tabs = [
    { key: 'open', label: 'Open', count: bugs.filter((b) => b.status === 'open').length },
    { key: 'in_progress', label: 'In Progress', count: bugs.filter((b) => b.status === 'in_progress').length },
    { key: 'resolved', label: 'Resolved', count: bugs.filter((b) => b.status === 'resolved').length },
    { key: 'closed', label: 'Closed', count: bugs.filter((b) => b.status === 'closed').length },
  ];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('bugs').insert({
      project_id: projectId,
      title,
      description: description || null,
      severity,
      reporter_id: user?.id,
    });
    setTitle('');
    setDescription('');
    setCreateOpen(false);
    setSaving(false);
    load();
  }

  async function updateBugStatus(bugId: string, status: Bug['status']) {
    const supabase = createClient();
    await supabase.from('bugs').update({ status }).eq('id', bugId);
    load();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dash-text">Bug Tracker</h2>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-3 py-2 text-sm font-medium hover:bg-dash-accent-hover transition cursor-pointer">
          <Plus className="h-4 w-4" /> Report Bug
        </button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-4" />

      {filtered.length === 0 ? (
        <EmptyState icon={BugIcon} title={`No ${activeTab} bugs`} description="Nice! No bugs in this category." />
      ) : (
        <div className="space-y-2">
          {filtered.map((bug) => (
            <div key={bug.id} className="flex items-center gap-4 rounded-lg border border-dash-border bg-dash-surface px-4 py-3 hover:bg-dash-surface-2 transition">
              <BugIcon className="h-4 w-4 text-dash-error shrink-0" />
              <span className="flex-1 text-sm text-dash-text font-medium">{bug.title}</span>
              <PriorityBadge priority={bug.severity} />
              <select
                value={bug.status}
                onChange={(e) => updateBugStatus(bug.id, e.target.value as Bug['status'])}
                className="rounded-md border border-dash-border bg-dash-surface-2 px-2 py-1 text-xs text-dash-text focus:outline-none cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Report Bug">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Bug description" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as Priority)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Steps to reproduce</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="1. Go to...\n2. Click..." rows={4} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
