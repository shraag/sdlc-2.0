import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border p-12 text-center',
        className
      )}
    >
      <Icon className="h-10 w-10 text-dash-text-muted mb-4" />
      <h3 className="text-sm font-semibold text-dash-text mb-1">{title}</h3>
      <p className="text-sm text-dash-text-muted mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
