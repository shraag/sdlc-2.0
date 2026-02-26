'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ListTodo,
  BookOpen,
  Bug,
  Users,
  Link2,
  FlaskConical,
  Settings,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/dashboard';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setProject(data);
      });
  }, [id]);

  const base = `/dashboard/project/${id}`;
  const tabs = [
    { label: 'Sprint Board', href: base, icon: LayoutDashboard },
    { label: 'Backlog', href: `${base}/backlog`, icon: ListTodo },
    { label: 'Wiki', href: `${base}/wiki`, icon: BookOpen },
    { label: 'Bugs', href: `${base}/bugs`, icon: Bug },
    { label: 'Meetings', href: `${base}/meetings`, icon: Calendar },
    { label: 'Resources', href: `${base}/resources`, icon: Link2 },
    { label: 'Tests', href: `${base}/tests`, icon: FlaskConical },
    { label: 'Integrations', href: `${base}/integrations`, icon: Users },
    { label: 'Settings', href: `${base}/settings`, icon: Settings },
  ];

  return (
    <div>
      {/* Project header */}
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="text-xs text-dash-text-muted hover:text-dash-text transition"
        >
          Projects
        </Link>
        <span className="text-xs text-dash-text-muted mx-2">/</span>
        <span className="text-xs text-dash-text-secondary">
          {project?.name || 'Loading...'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-dash-border mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const active =
            tab.href === base
              ? pathname === base
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'text-dash-accent'
                  : 'text-dash-text-muted hover:text-dash-text-secondary'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dash-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
