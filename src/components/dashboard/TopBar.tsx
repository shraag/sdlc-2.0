'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Search } from 'lucide-react';
import type { Profile } from '@/types/dashboard';

interface TopBarProps {
  onToggleChat: () => void;
  chatOpen: boolean;
}

export function TopBar({ onToggleChat, chatOpen }: TopBarProps) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    });
  }, []);

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-dash-border bg-dash-surface/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-dash-border bg-dash-surface-2 pl-9 pr-3 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 focus:border-dash-accent/50 transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleChat}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${
            chatOpen
              ? 'bg-dash-accent/10 text-dash-accent'
              : 'text-dash-text-secondary hover:bg-dash-surface-2 hover:text-dash-text'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-accent/10 text-dash-accent text-xs font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
}
