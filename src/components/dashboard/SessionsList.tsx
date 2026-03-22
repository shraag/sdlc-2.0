'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Mic, RefreshCw } from 'lucide-react';
import type { VoiceSession } from '@/types/dashboard';
import { DataTable } from '@/components/dashboard/ui/DataTable';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';

interface Props {
  initialSessions: VoiceSession[];
}

export function SessionsList({ initialSessions }: Props) {
  const [sessions, setSessions] = useState(initialSessions);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function refresh() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('voice_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  }

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (s: VoiceSession) => (
        <div>
          <p className="font-medium text-dash-text">{s.customer_name}</p>
          <p className="text-xs text-dash-text-muted">{s.customer_email}</p>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (s: VoiceSession) => (
        <span className="text-dash-text-secondary">{s.customer_company || '—'}</span>
      ),
    },
    {
      key: 'brief',
      header: 'Brief',
      className: 'max-w-xs',
      render: (s: VoiceSession) => (
        <span className="text-dash-text-secondary truncate block max-w-xs">
          {s.session_name || s.project_brief || s.transcript?.slice(0, 80) || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: VoiceSession) => <StatusBadge status={s.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      render: (s: VoiceSession) => (
        <span className="text-dash-text-muted text-xs">
          {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-dash-text">Voice Sessions</h1>
          <p className="text-sm text-dash-text-muted mt-1">Review customer voice agent conversations and convert to projects</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={Mic} title="No voice sessions yet" description="When customers use the voice agent on the landing page, their sessions will appear here." />
      ) : (
        <DataTable columns={columns} data={sessions} onRowClick={(s) => router.push(`/dashboard/sessions/${s.id}`)} />
      )}
    </div>
  );
}
