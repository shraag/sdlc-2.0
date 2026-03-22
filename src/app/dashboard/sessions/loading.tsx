export default function SessionsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 rounded-lg bg-dash-surface-2" />
          <div className="h-4 w-72 rounded-lg bg-dash-surface-2 mt-2" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-dash-surface-2" />
      </div>
      <div className="rounded-xl border border-dash-border bg-dash-surface overflow-hidden">
        <div className="border-b border-dash-border px-4 py-3 flex gap-8">
          {[80, 64, 120, 48, 56].map((w, i) => (
            <div key={i} className="h-4 rounded bg-dash-surface-2" style={{ width: w }} />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-dash-border px-4 py-4 flex gap-8 items-center">
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 rounded bg-dash-surface-2" />
              <div className="h-3 w-40 rounded bg-dash-surface-2" />
            </div>
            <div className="h-4 w-20 rounded bg-dash-surface-2" />
            <div className="h-4 w-48 rounded bg-dash-surface-2" />
            <div className="h-5 w-16 rounded-md bg-dash-surface-2" />
            <div className="h-4 w-20 rounded bg-dash-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
