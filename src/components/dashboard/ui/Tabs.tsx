'use client';

import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-dash-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer',
            activeTab === tab.key
              ? 'text-dash-accent'
              : 'text-dash-text-muted hover:text-dash-text-secondary'
          )}
        >
          <span className="flex items-center gap-1.5">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs',
                  activeTab === tab.key
                    ? 'bg-dash-accent/10 text-dash-accent'
                    : 'bg-dash-surface-3 text-dash-text-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dash-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
