'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import {
  Plus, Loader2, ChevronDown, ChevronRight, Sparkles, Lock,
  Pencil, Trash2, X, CheckCircle2,
} from 'lucide-react';
import type { Task, TaskStatus, Priority, TaskType, Sprint, AcceptanceCriterion } from '@/types/dashboard';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';
import { PriorityBadge } from '@/components/dashboard/ui/PriorityBadge';
import { Modal } from '@/components/dashboard/ui/Modal';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { ProgressBar } from '@/components/dashboard/ui/ProgressBar';

export default function SprintBoardPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [sprintCreateOpen, setSprintCreateOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TaskType>('story');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDescription, setNewDescription] = useState('');
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [newEstimate, setNewEstimate] = useState('');

  // Sprint create form
  const [sprintName, setSprintName] = useState('');
  const [sprintStart, setSprintStart] = useState('');
  const [sprintEnd, setSprintEnd] = useState('');

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [{ data: taskData }, { data: sprintData }] = await Promise.all([
      supabase.from('tasks').select('*').eq('project_id', projectId).order('position'),
      supabase.from('sprints').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    ]);
    setTasks(taskData || []);
    setSprints(sprintData || []);
    if (sprintData && sprintData.length > 0 && !activeSprint) {
      setActiveSprint(sprintData[0]);
    }
    setLoading(false);
  }, [projectId, activeSprint]);

  useEffect(() => { loadData(); }, [loadData]);

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

  function expandAll() {
    setExpandedEpics(new Set(epics.map((e) => e.id)));
  }

  function collapseAll() {
    setExpandedEpics(new Set());
  }

  function epicProgress(epicId: string): number {
    const children = getChildren(epicId);
    if (children.length === 0) return 0;
    const done = children.filter((t) => t.status === 'done').length;
    return Math.round((done / children.length) * 100);
  }

  function epicHours(epicId: string): number {
    return getChildren(epicId).reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
  }

  const totalHours = tasks.reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
  const doneHours = tasks.filter((t) => t.status === 'done').reduce((sum, t) => sum + (t.estimate_hours || 0), 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from('tasks').insert({
      project_id: projectId,
      sprint_id: activeSprint?.id || null,
      title: newTitle,
      description: newDescription || null,
      type: newType,
      priority: newPriority,
      parent_id: newParentId,
      estimate_hours: newEstimate ? parseFloat(newEstimate) : null,
      status: 'todo',
    });
    setNewTitle(''); setNewDescription(''); setNewType('story'); setNewPriority('medium'); setNewParentId(null); setNewEstimate('');
    setCreateOpen(false); setSaving(false);
    loadData();
  }

  async function handleCreateSprint(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from('sprints').insert({
      project_id: projectId,
      name: sprintName,
      start_date: sprintStart || null,
      end_date: sprintEnd || null,
    }).select().single();
    if (data) setActiveSprint(data);
    setSprintName(''); setSprintStart(''); setSprintEnd('');
    setSprintCreateOpen(false); setSaving(false);
    loadData();
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    const supabase = createClient();
    await supabase.from('tasks').update(updates).eq('id', taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
    if (detailTask?.id === taskId) setDetailTask((prev) => prev ? { ...prev, ...updates } : prev);
  }

  async function generateCriteria() {
    if (!detailTask) return;
    setSaving(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'acceptance_criteria',
          content: `Title: ${detailTask.title}\nDescription: ${detailTask.description || ''}\nUser Story: ${detailTask.story_format || ''}`,
        }),
      });
      const { data } = await res.json();
      if (Array.isArray(data)) {
        const criteria: AcceptanceCriterion[] = data.map((text: string) => ({ text, checked: false }));
        await updateTask(detailTask.id, { acceptance_criteria: criteria });
      }
    } catch (err) {
      console.error('Failed to generate criteria:', err);
    } finally {
      setSaving(false);
    }
  }

  async function generateTestCases() {
    if (!detailTask) return;
    setSaving(true);
    try {
      const criteriaText = (detailTask.acceptance_criteria || []).map((c) => c.text).join('\n');
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test_cases',
          content: `Title: ${detailTask.title}\nStory: ${detailTask.story_format || ''}\nAcceptance Criteria:\n${criteriaText}`,
        }),
      });
      const { data } = await res.json();
      if (Array.isArray(data)) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        for (const tc of data) {
          await supabase.from('test_cases').insert({
            project_id: projectId,
            task_id: detailTask.id,
            title: tc.title,
            description: tc.description,
            preconditions: tc.preconditions,
            steps: tc.steps,
            expected_result: tc.expected_result,
            severity: tc.severity || 'major',
            test_type: tc.test_type || 'e2e',
            created_by: user?.id,
          });
        }
      }
    } catch (err) {
      console.error('Failed to generate test cases:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" /></div>;
  }

  return (
    <div>
      {/* Sprint Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-dash-text">
            {activeSprint ? activeSprint.name : 'Sprint Board'}
          </h2>
          {activeSprint && (
            <>
              <StatusBadge status={activeSprint.status} />
              <span className="text-sm text-dash-text-muted">
                {doneHours} / {totalHours} hrs
              </span>
            </>
          )}
          {activeSprint?.start_date && activeSprint?.end_date && (
            <span className="text-xs text-dash-text-muted">
              {new Date(activeSprint.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(activeSprint.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSprintCreateOpen(true)} className="flex items-center gap-2 rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Create Sprint
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-3 py-2 text-sm font-medium hover:bg-dash-accent-hover transition cursor-pointer">
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filter chips */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={expandAll} className="rounded-md border border-dash-border px-2.5 py-1 text-xs text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">
            Expand All
          </button>
          <button onClick={collapseAll} className="rounded-md border border-dash-border px-2.5 py-1 text-xs text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">
            Collapse
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState icon={Plus} title="No tasks yet" description="Create tasks or convert a voice session to populate the sprint board." action={
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition cursor-pointer">
            <Plus className="h-4 w-4" /> Add Task
          </button>
        } />
      ) : (
        <div className="rounded-xl border border-dash-border bg-dash-surface overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_90px_80px_80px_80px_100px_50px] gap-2 px-4 py-2.5 border-b border-dash-border text-xs font-medium text-dash-text-muted uppercase tracking-wider">
            <span>Title</span><span>Status</span><span>Priority</span><span>Estimate</span><span>Creator</span><span>Assignee</span><span>Progress</span><span>Actions</span>
          </div>

          {/* Epics */}
          {epics.map((epic) => {
            const isExpanded = expandedEpics.has(epic.id);
            const children = getChildren(epic.id);
            const progress = epicProgress(epic.id);
            const hours = epicHours(epic.id);

            return (
              <div key={epic.id}>
                {/* Epic row */}
                <div className="grid grid-cols-[1fr_100px_90px_80px_80px_80px_100px_50px] gap-2 px-4 py-3 border-b border-dash-border hover:bg-dash-surface-2/50 transition items-center">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleEpic(epic.id)} className="cursor-pointer text-dash-text-muted hover:text-dash-text">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <CheckCircle2 className="h-4 w-4 text-dash-accent shrink-0" />
                    <button onClick={() => setDetailTask({ ...epic })} className="text-sm font-semibold text-dash-text hover:text-dash-accent transition cursor-pointer text-left">
                      {epic.title}
                    </button>
                    <StatusBadge status={epic.status} />
                    <span className="text-xs text-dash-text-muted">{hours > 0 ? `${hours} hrs` : ''}</span>
                  </div>
                  <StatusBadge status={epic.status} />
                  <PriorityBadge priority={epic.priority} />
                  <span className="text-xs text-dash-text-muted">{hours > 0 ? `${hours} hrs` : '—'}</span>
                  <span className="text-xs text-dash-text-muted">—</span>
                  <span className="text-xs text-dash-text-muted">—</span>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={progress} />
                    <span className="text-[10px] text-dash-text-muted">{progress}%</span>
                  </div>
                  <div />
                </div>

                {/* Children */}
                {isExpanded && children.map((child) => (
                  <div key={child.id} className="grid grid-cols-[1fr_100px_90px_80px_80px_80px_100px_50px] gap-2 px-4 py-2.5 border-b border-dash-border hover:bg-dash-surface-2/50 transition items-center">
                    <div className="flex items-center gap-2 pl-10">
                      <span className="text-[10px] text-dash-accent font-semibold uppercase">{child.type}</span>
                      <button onClick={() => setDetailTask({ ...child })} className="text-sm text-dash-text hover:text-dash-accent transition cursor-pointer text-left truncate">
                        {child.title}
                      </button>
                    </div>
                    <select value={child.status} onChange={(e) => updateTask(child.id, { status: e.target.value as TaskStatus })} className="rounded-md bg-transparent text-xs text-dash-text-secondary focus:outline-none cursor-pointer">
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                    <PriorityBadge priority={child.priority} />
                    <span className="text-xs text-dash-text-muted">{child.estimate_hours ? `${child.estimate_hours} hrs` : '—'}</span>
                    <span className="text-xs text-dash-text-muted">—</span>
                    <span className="text-xs text-dash-text-muted">—</span>
                    <div />
                    <button onClick={async () => { const supabase = createClient(); await supabase.from('tasks').delete().eq('id', child.id); loadData(); }} className="text-dash-text-muted hover:text-dash-error cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add subtask */}
                {isExpanded && (
                  <div className="px-4 py-2 border-b border-dash-border">
                    <button onClick={() => { setNewParentId(epic.id); setNewType('story'); setCreateOpen(true); }} className="text-xs text-dash-text-muted hover:text-dash-accent transition cursor-pointer pl-10">
                      + Add SubTask...
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Non-epic tasks */}
          {nonEpicTasks.map((task) => (
            <div key={task.id} className="grid grid-cols-[1fr_100px_90px_80px_80px_80px_100px_50px] gap-2 px-4 py-2.5 border-b border-dash-border hover:bg-dash-surface-2/50 transition items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-dash-text-muted font-semibold uppercase">{task.type}</span>
                <button onClick={() => setDetailTask({ ...task })} className="text-sm text-dash-text hover:text-dash-accent transition cursor-pointer text-left truncate">
                  {task.title}
                </button>
              </div>
              <select value={task.status} onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })} className="rounded-md bg-transparent text-xs text-dash-text-secondary focus:outline-none cursor-pointer">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
              <PriorityBadge priority={task.priority} />
              <span className="text-xs text-dash-text-muted">{task.estimate_hours ? `${task.estimate_hours} hrs` : '—'}</span>
              <span className="text-xs text-dash-text-muted">—</span>
              <span className="text-xs text-dash-text-muted">—</span>
              <div />
              <button onClick={async () => { const supabase = createClient(); await supabase.from('tasks').delete().eq('id', task.id); loadData(); }} className="text-dash-text-muted hover:text-dash-error cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Add task */}
          <div className="px-4 py-3">
            <button onClick={() => { setNewParentId(null); setCreateOpen(true); }} className="text-xs text-dash-text-muted hover:text-dash-accent transition cursor-pointer">
              + Add Task...
            </button>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Title</label>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder="Task title" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value as TaskType)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="epic">Epic</option><option value="story">Story</option><option value="task">Task</option><option value="bug">Bug</option><option value="subtask">Subtask</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Priority</label>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Priority)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Estimate (hrs)</label>
              <input type="number" value={newEstimate} onChange={(e) => setNewEstimate(e.target.value)} placeholder="0" min="0" step="0.5" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
            </div>
          </div>
          {epics.length > 0 && newType !== 'epic' && (
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Parent Epic</label>
              <select value={newParentId || ''} onChange={(e) => setNewParentId(e.target.value || null)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="">None</option>
                {epics.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Description</label>
            <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Describe..." rows={3} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !newTitle.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Sprint Create Modal */}
      <Modal open={sprintCreateOpen} onClose={() => setSprintCreateOpen(false)} title="Create Sprint">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Sprint Name</label>
            <input type="text" value={sprintName} onChange={(e) => setSprintName(e.target.value)} required placeholder="Sprint 1 — MVP" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Start Date</label>
              <input type="date" value={sprintStart} onChange={(e) => setSprintStart(e.target.value)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">End Date</label>
              <input type="date" value={sprintEnd} onChange={(e) => setSprintEnd(e.target.value)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setSprintCreateOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !sprintName.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      <Modal open={!!detailTask} onClose={() => setDetailTask(null)} title="" className="max-w-3xl">
        {detailTask && (
          <>
          <div className="flex gap-6">
            {/* Left: Content */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              {detailTask.parent_id && (
                <p className="text-xs text-dash-text-muted mb-2">
                  {epics.find((e) => e.id === detailTask.parent_id)?.title || 'Epic'} / <span className="text-dash-accent">{detailTask.type.toUpperCase()}</span> {detailTask.title}
                </p>
              )}

              {/* Title */}
              <input
                type="text"
                value={detailTask.title}
                onChange={(e) => setDetailTask({ ...detailTask, title: e.target.value })}
                className="w-full text-lg font-semibold text-dash-text bg-transparent border-none focus:outline-none mb-3"
              />

              {/* Story format */}
              <div className="mb-4">
                <textarea
                  value={detailTask.story_format || ''}
                  onChange={(e) => setDetailTask({ ...detailTask, story_format: e.target.value })}
                  placeholder="As a [user type], I want to [action] so that [benefit]"
                  rows={2}
                  className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text italic placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none"
                />
              </div>

              {/* Acceptance Criteria */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-dash-text">
                    <CheckCircle2 className="h-4 w-4 text-dash-success" /> Acceptance Criteria
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={generateCriteria} disabled={saving} className="flex items-center gap-1 text-xs text-dash-accent hover:text-dash-accent-hover transition cursor-pointer">
                      <Sparkles className="h-3 w-3" /> Generate
                    </button>
                    <button onClick={() => {
                      const criteria = [...(detailTask.acceptance_criteria || []), { text: '', checked: false }];
                      setDetailTask({ ...detailTask, acceptance_criteria: criteria });
                    }} className="text-xs text-dash-text-muted hover:text-dash-text transition cursor-pointer">
                      + Add
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(detailTask.acceptance_criteria || []).map((ac, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={ac.checked}
                        onChange={() => {
                          const criteria = [...(detailTask.acceptance_criteria || [])];
                          criteria[i] = { ...criteria[i], checked: !criteria[i].checked };
                          setDetailTask({ ...detailTask, acceptance_criteria: criteria });
                        }}
                        className="mt-1 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={ac.text}
                        onChange={(e) => {
                          const criteria = [...(detailTask.acceptance_criteria || [])];
                          criteria[i] = { ...criteria[i], text: e.target.value };
                          setDetailTask({ ...detailTask, acceptance_criteria: criteria });
                        }}
                        className="flex-1 text-sm text-dash-text-secondary bg-transparent border-none focus:outline-none"
                        placeholder="Given... When... Then..."
                      />
                      <button onClick={() => {
                        const criteria = (detailTask.acceptance_criteria || []).filter((_, j) => j !== i);
                        setDetailTask({ ...detailTask, acceptance_criteria: criteria });
                      }} className="text-dash-text-muted hover:text-dash-error cursor-pointer mt-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(!detailTask.acceptance_criteria || detailTask.acceptance_criteria.length === 0) && (
                    <p className="text-xs text-dash-text-muted italic">No criteria yet. Click Generate or Add.</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-dash-text mb-1.5">Description</label>
                <textarea
                  value={detailTask.description || ''}
                  onChange={(e) => setDetailTask({ ...detailTask, description: e.target.value || null })}
                  rows={4}
                  placeholder="Add description..."
                  className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none"
                />
              </div>
            </div>

            {/* Right: Details sidebar */}
            <div className="w-48 shrink-0 space-y-4 border-l border-dash-border pl-5">
              <div>
                <p className="text-xs text-dash-text-muted mb-1">Status</p>
                <select value={detailTask.status} onChange={(e) => setDetailTask({ ...detailTask, status: e.target.value as TaskStatus })} className="w-full rounded-md border border-dash-border bg-dash-surface-2 px-2 py-1.5 text-xs text-dash-text focus:outline-none cursor-pointer">
                  <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="in_review">In Review</option><option value="done">Done</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-dash-text-muted mb-1">Priority</p>
                <select value={detailTask.priority} onChange={(e) => setDetailTask({ ...detailTask, priority: e.target.value as Priority })} className="w-full rounded-md border border-dash-border bg-dash-surface-2 px-2 py-1.5 text-xs text-dash-text focus:outline-none cursor-pointer">
                  <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-dash-text-muted mb-1">Estimation</p>
                <div className="flex items-center gap-1">
                  <input type="number" value={detailTask.estimate_hours || ''} onChange={(e) => setDetailTask({ ...detailTask, estimate_hours: e.target.value ? parseFloat(e.target.value) : null })} min="0" step="0.5" placeholder="0" className="w-full rounded-md border border-dash-border bg-dash-surface-2 px-2 py-1.5 text-xs text-dash-text focus:outline-none" />
                  <span className="text-xs text-dash-text-muted">hrs</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-dash-text-muted mb-1">Type</p>
                <select value={detailTask.type} onChange={(e) => setDetailTask({ ...detailTask, type: e.target.value as TaskType })} className="w-full rounded-md border border-dash-border bg-dash-surface-2 px-2 py-1.5 text-xs text-dash-text focus:outline-none cursor-pointer">
                  <option value="epic">Epic</option><option value="story">Story</option><option value="task">Task</option><option value="bug">Bug</option><option value="subtask">Subtask</option>
                </select>
              </div>

              <div className="border-t border-dash-border pt-3">
                <p className="text-xs text-dash-text-muted mb-2">Test Cases</p>
                <button onClick={generateTestCases} disabled={saving} className="flex items-center gap-1 text-xs text-dash-accent hover:text-dash-accent-hover transition cursor-pointer">
                  <Sparkles className="h-3 w-3" /> Generate
                </button>
              </div>

              <div className="border-t border-dash-border pt-3 text-xs text-dash-text-muted">
                <p>Created: {new Date(detailTask.created_at).toLocaleDateString()}</p>
                <p>Updated: {new Date(detailTask.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dash-border">
            <button onClick={() => setDetailTask(null)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button onClick={async () => {
              setSaving(true);
              await updateTask(detailTask.id, {
                title: detailTask.title,
                description: detailTask.description,
                status: detailTask.status,
                priority: detailTask.priority,
                type: detailTask.type,
                estimate_hours: detailTask.estimate_hours,
                story_format: detailTask.story_format,
                acceptance_criteria: detailTask.acceptance_criteria,
              });
              setSaving(false);
              setDetailTask(null);
              loadData();
            }} disabled={saving} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </div>
          </>
        )}
      </Modal>
    </div>
  );
}
