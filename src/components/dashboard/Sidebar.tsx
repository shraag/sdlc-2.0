'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Mic,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Voice Sessions', href: '/dashboard/sessions', icon: Mic },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-dash-border bg-dash-surface transition-all duration-200',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-dash-border px-4">
        <Link href="/dashboard/projects" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-dash-accent text-white text-xs font-bold">
            F
          </div>
          {!collapsed && (
            <span className="font-display text-lg text-dash-text whitespace-nowrap">
              Foundry AI
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-dash-accent/10 text-dash-accent'
                  : 'text-dash-text-secondary hover:bg-dash-surface-2 hover:text-dash-text'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-dash-border p-2 space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-dash-text-secondary hover:bg-dash-surface-2 hover:text-dash-text transition-colors cursor-pointer'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-dash-text-muted hover:bg-dash-surface-2 hover:text-dash-text transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
