'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Plus, Loader2, BookOpen, FileText } from 'lucide-react';
import type { WikiPage } from '@/types/dashboard';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Modal } from '@/components/dashboard/ui/Modal';

export default function WikiPageList() {
  const { id: projectId } = useParams<{ id: string }>();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('wiki_pages')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });
    setPages(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('wiki_pages').insert({
      project_id: projectId,
      title,
      content,
      author_id: user?.id,
    });
    setTitle('');
    setContent('');
    setCreateOpen(false);
    setSaving(false);
    load();
  }

  async function handleSave() {
    if (!selectedPage) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('wiki_pages').update({
      title: selectedPage.title,
      content: selectedPage.content,
    }).eq('id', selectedPage.id);
    setSaving(false);
    setSelectedPage(null);
    load();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dash-text">Wiki</h2>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-3 py-2 text-sm font-medium hover:bg-dash-accent-hover transition cursor-pointer">
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      {pages.length === 0 ? (
        <EmptyState icon={BookOpen} title="No wiki pages" description="Create documentation for your project." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pages.map((page) => (
            <button key={page.id} onClick={() => setSelectedPage({ ...page })} className="text-left rounded-xl border border-dash-border bg-dash-surface p-4 hover:bg-dash-surface-2 transition cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-4 w-4 text-dash-accent" />
                <h3 className="font-medium text-dash-text">{page.title}</h3>
              </div>
              <p className="text-sm text-dash-text-muted line-clamp-2">{page.content || 'Empty page'}</p>
              <p className="text-xs text-dash-text-muted mt-2">
                Updated {new Date(page.updated_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Wiki Page">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Page title" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your documentation..." rows={8} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none font-mono" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit */}
      <Modal open={!!selectedPage} onClose={() => setSelectedPage(null)} title="Edit Page" className="max-w-2xl">
        {selectedPage && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Title</label>
              <input type="text" value={selectedPage.title} onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Content</label>
              <textarea value={selectedPage.content} onChange={(e) => setSelectedPage({ ...selectedPage, content: e.target.value })} rows={12} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none font-mono" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedPage(null)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
