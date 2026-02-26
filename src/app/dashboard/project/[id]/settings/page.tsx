'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import type { Project } from '@/types/dashboard';

export default function SettingsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('active');
  const [confirmDelete, setConfirmDelete] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProject(data);
          setName(data.name);
          setDescription(data.description || '');
          setStatus(data.status);
        }
        setLoading(false);
      });
  }, [projectId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('projects')
      .update({ name, description: description || null, status })
      .eq('id', projectId);
    setSaving(false);
  }

  async function handleDelete() {
    if (confirmDelete !== project?.name) return;
    const supabase = createClient();
    await supabase.from('projects').delete().eq('id', projectId);
    router.push('/dashboard/projects');
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" /></div>;
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold text-dash-text mb-6">Project Settings</h2>

      <form onSubmit={handleSave} className="space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Project Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Project['status'])} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
        </button>
      </form>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="text-sm font-semibold text-dash-error mb-2">Danger Zone</h3>
        <p className="text-sm text-dash-text-muted mb-4">
          This will permanently delete the project and all associated data.
          Type <strong className="text-dash-text">{project?.name}</strong> to confirm.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder="Project name"
            className="flex-1 rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-red-500/50 transition"
          />
          <button
            onClick={handleDelete}
            disabled={confirmDelete !== project?.name}
            className="flex items-center gap-2 rounded-lg bg-dash-error text-white px-4 py-2 text-sm font-medium hover:bg-red-600 transition disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
