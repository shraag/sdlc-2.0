'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Plus, Loader2, Link2, ExternalLink, FileText, Palette, Code } from 'lucide-react';
import type { Resource } from '@/types/dashboard';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Modal } from '@/components/dashboard/ui/Modal';

const TYPE_ICONS: Record<string, typeof Link2> = {
  link: Link2,
  document: FileText,
  design: Palette,
  api: Code,
};

export default function ResourcesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<Resource['type']>('link');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('resources')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    setResources(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('resources').insert({
      project_id: projectId,
      name,
      url: url || null,
      type,
      description: description || null,
      created_by: user?.id,
    });
    setName('');
    setUrl('');
    setDescription('');
    setCreateOpen(false);
    setSaving(false);
    load();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dash-text">Resources</h2>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-3 py-2 text-sm font-medium hover:bg-dash-accent-hover transition cursor-pointer">
          <Plus className="h-4 w-4" /> Add Resource
        </button>
      </div>

      {resources.length === 0 ? (
        <EmptyState icon={Link2} title="No resources" description="Add links to design files, APIs, documentation, and more." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {resources.map((r) => {
            const Icon = TYPE_ICONS[r.type] || Link2;
            return (
              <div key={r.id} className="rounded-xl border border-dash-border bg-dash-surface p-4 hover:bg-dash-surface-2 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-dash-accent" />
                    <span className="text-xs text-dash-text-muted uppercase">{r.type}</span>
                  </div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-dash-text-muted hover:text-dash-accent transition">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <h3 className="text-sm font-medium text-dash-text mb-1">{r.name}</h3>
                {r.description && <p className="text-xs text-dash-text-muted">{r.description}</p>}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Resource">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Resource name" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as Resource['type'])} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
              <option value="link">Link</option>
              <option value="document">Document</option>
              <option value="design">Design</option>
              <option value="api">API</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this resource?" rows={2} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !name.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
