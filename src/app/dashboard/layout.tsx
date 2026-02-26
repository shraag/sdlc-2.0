'use client';

import { useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { AIChatPanel } from '@/components/dashboard/AIChatPanel';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const pathname = usePathname();

  // Extract project ID from URL if on a project page
  const projectIdMatch = pathname.match(/\/dashboard\/project\/([^/]+)/);
  const projectId = projectIdMatch?.[1];

  return (
    <div className="min-h-screen bg-dash-bg text-dash-text">
      <Sidebar />

      <div className="pl-56 transition-all duration-200">
        <TopBar onToggleChat={() => setChatOpen(!chatOpen)} chatOpen={chatOpen} />

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
