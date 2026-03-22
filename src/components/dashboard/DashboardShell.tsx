'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { AIChatPanel } from '@/components/dashboard/AIChatPanel';

interface Props {
  initials: string;
  children: React.ReactNode;
}

export function DashboardShell({ initials, children }: Props) {
  const [chatOpen, setChatOpen] = useState(false);
  const pathname = usePathname();

  const projectIdMatch = pathname.match(/\/dashboard\/project\/([^/]+)/);
  const projectId = projectIdMatch?.[1];

  return (
    <div className="min-h-screen bg-dash-bg text-dash-text">
      <Sidebar />

      <div className="pl-56 transition-all duration-200">
        <TopBar
          onToggleChat={() => setChatOpen(!chatOpen)}
          chatOpen={chatOpen}
          initials={initials}
        />

        <main className={`transition-all duration-200 ${chatOpen ? 'pr-80' : ''}`}>
          <div className="p-6">{children}</div>
        </main>
      </div>

      <AIChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        projectId={projectId}
        context={pathname}
      />
    </div>
  );
}
