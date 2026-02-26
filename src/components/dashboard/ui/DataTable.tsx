'use client';

import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dash-border bg-dash-surface p-12 text-center">
        <p className="text-sm text-dash-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-dash-border bg-dash-surface">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dash-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-dash-text-muted',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dash-border">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-dash-surface-2'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 text-sm', col.className)}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
