'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Plus, Loader2, ListTodo, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import type { Task, TaskType, Priority, TaskStatus } from '@/types/dashboard';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';
import { PriorityBadge } from '@/components/dashboard/ui/PriorityBadge';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Modal } from '@/components/dashboard/ui/Modal';
import { ProgressBar } from '@/components/dashboard/ui/ProgressBar';

export default function BacklogPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('story');
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .is('sprint_id', null)
      .order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const epics = tasks.filter((t) => t.type === 'epic');
  const nonEpicTasks = tasks.filter((t) => !t.parent_id && t.type !== 'epic');

  function getChildren(parentId: string) {
    return tasks.filter((t) => t.parent_id === parentId);
  }

  function toggleEpic(id: string) {
    setExpandedEpics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function epicProgress(epicId: string): number {
    const children = getChildren(epicId);
    if (children.length === 0) return 0;
    return Math.round((children.filter((t) => t.status === 'done').length / children.length) * 100);
  }

  function epicHours(epicId: string): number {
    return getChildren(epicId).reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from('tasks').insert({
      project_id: projectId,
      title,
      description: description || null,
      type,
      priority,
      parent_id: parentId,
      estimate_hours: estimateHours ? parseFloat(estimateHours) : null,
      status: 'todo',
    });
    setTitle(''); setDescription(''); setEstimateHours(''); setParentId(null);
    setCreateOpen(false); setSaving(false);
    load();
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    const supabase = createClient();
    await supabase.from('tasks').update({ status }).eq('id', taskId);
    load();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-dash-text">Backlog</h2>
          <p className="text-sm text-dash-text-muted">Manage your project&apos;s backlog tasks</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-3 py-2 text-sm font-medium hover:bg-dash-accent-hover transition cursor-pointer">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Filter chips */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setExpandedEpics(new Set(epics.map((e) => e.id)))} className="rounded-md border border-dash-border px-2.5 py-1 text-xs text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">
            Expand All
          </button>
          <button onClick={() => setExpandedEpics(new Set())} className="rounded-md border border-dash-border px-2.5 py-1 text-xs text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">
            Collapse
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState icon={ListTodo} title="Backlog is empty" description="Items not assigned to a sprint will appear here." />
      ) : (
        <div className="rounded-xl border border-dash-border bg-dash-surface overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_90px_80px_80px_100px_50px] gap-2 px-4 py-2.5 border-b border-dash-border text-xs font-medium text-dash-text-muted uppercase tracking-wider">
            <span>Title</span><span>Status</span><span>Priority</span><span>Estimate</span><span>Assignee</span><span>Progress</span><span>Actions</span>
          </div>

          {/* Epics */}
          {epics.map((epic) => {
            const isExpanded = expandedEpics.has(epic.id);
            const children = getChildren(epic.id);
            const progress = epicProgress(epic.id);
            const hours = epicHours(epic.id);

            return (
              <div key={epic.id}>
                <div className="grid grid-cols-[1fr_100px_90px_80px_80px_100px_50px] gap-2 px-4 py-3 border-b border-dash-border hover:bg-dash-surface-2/50 transition items-center">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleEpic(epic.id)} className="cursor-pointer text-dash-text-muted hover:text-dash-text">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <span className="text-sm font-semibold text-dash-text">{epic.title}</span>
                    <StatusBadge status={epic.status} />
                    <span className="text-xs text-dash-text-muted">{hours > 0 ? `${hours} hrs` : ''}</span>
                  </div>
                  <StatusBadge status={epic.status} />
                  <PriorityBadge priority={epic.priority} />
                  <span className="text-xs text-dash-text-muted">{hours > 0 ? `${hours} hrs` : '—'}</span>
                  <span className="text-xs text-dash-text-muted">—</span>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={progress} />
                    <span className="text-[10px] text-dash-text-muted">{progress}%</span>
                  </div>
                  <div />
                </div>

                {isExpanded && children.map((child) => (
                  <div key={child.id} className="grid grid-cols-[1fr_100px_90px_80px_80px_100px_50px] gap-2 px-4 py-2.5 border-b border-dash-border hover:bg-dash-surface-2/50 transition items-center">
                    <div className="flex items-center gap-2 pl-10">
                      <span className="text-[10px] text-dash-accent font-semibold uppercase">{child.type}</span>
                      <span className="text-sm text-dash-text">{child.title}</span>
                    </div>
                    <select value={child.status} onChange={(e) => updateTaskStatus(child.id, e.target.value as TaskStatus)} className="rounded-md bg-transparent text-xs text-dash-text-secondary focus:outline-none cursor-pointer">
                      <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="in_review">In Review</option><option value="done">Done</option>
                    </select>
                    <PriorityBadge priority={child.priority} />
                    <span className="text-xs text-dash-text-muted">{child.estimate_hours ? `${child.estimate_hours} hrs` : '—'}</span>
                    <span className="text-xs text-dash-text-muted">—</span>
                    <div />
                    <button onClick={async () => { const supabase = createClient(); await supabase.from('tasks').delete().eq('id', child.id); load(); }} className="text-dash-text-muted hover:text-dash-error cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {isExpanded && (
                  <div className="px-4 py-2 border-b border-dash-border">
                    <button onClick={() => { setParentId(epic.id); setType('story'); setCreateOpen(true); }} className="text-xs text-dash-text-muted hover:text-dash-accent transition cursor-pointer pl-10">
                      + Add SubTask...
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Non-epic tasks */}
          {nonEpicTasks.map((task) => (
            <div key={task.id} className="grid grid-cols-[1fr_100px_90px_80px_80px_100px_50px] gap-2 px-4 py-2.5 border-b border-dash-border hover:bg-dash-surface-2/50 transition items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-dash-text-muted font-semibold uppercase">{task.type}</span>
                <span className="text-sm text-dash-text">{task.title}</span>
              </div>
              <select value={task.status} onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)} className="rounded-md bg-transparent text-xs text-dash-text-secondary focus:outline-none cursor-pointer">
                <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="in_review">In Review</option><option value="done">Done</option>
              </select>
              <PriorityBadge priority={task.priority} />
              <span className="text-xs text-dash-text-muted">{task.estimate_hours ? `${task.estimate_hours} hrs` : '—'}</span>
              <span className="text-xs text-dash-text-muted">—</span>
              <div />
              <button onClick={async () => { const supabase = createClient(); await supabase.from('tasks').delete().eq('id', task.id); load(); }} className="text-dash-text-muted hover:text-dash-error cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <div className="px-4 py-3">
            <button onClick={() => { setParentId(null); setCreateOpen(true); }} className="text-xs text-dash-text-muted hover:text-dash-accent transition cursor-pointer">
              + Add Task...
            </button>
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add to Backlog">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Item title" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as TaskType)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="epic">Epic</option><option value="story">Story</option><option value="task">Task</option><option value="bug">Bug</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Estimate (hrs)</label>
              <input type="number" value={estimateHours} onChange={(e) => setEstimateHours(e.target.value)} placeholder="0" min="0" step="0.5" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
            </div>
          </div>
          {epics.length > 0 && type !== 'epic' && (
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Parent Epic</label>
              <select value={parentId || ''} onChange={(e) => setParentId(e.target.value || null)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="">None</option>
                {epics.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe..." rows={3} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
