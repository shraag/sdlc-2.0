export default function ProjectLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-16 rounded bg-dash-surface-2" />
        <div className="h-3 w-3 rounded bg-dash-surface-2" />
        <div className="h-3 w-24 rounded bg-dash-surface-2" />
      </div>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-dash-border pb-2">
        {[80, 56, 40, 40, 64, 64, 48, 80, 56].map((w, i) => (
          <div key={i} className="h-4 rounded bg-dash-surface-2" style={{ width: w }} />
        ))}
      </div>
      {/* Sprint header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-40 rounded-lg bg-dash-surface-2" />
          <div className="h-5 w-20 rounded-md bg-dash-surface-2" />
          <div className="h-4 w-24 rounded bg-dash-surface-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-lg bg-dash-surface-2" />
          <div className="h-9 w-24 rounded-lg bg-dash-surface-2" />
        </div>
      </div>
      {/* Table */}
      <div className="rounded-xl border border-dash-border bg-dash-surface overflow-hidden">
        <div className="border-b border-dash-border px-4 py-3 flex gap-4">
          {[200, 80, 70, 60, 60, 60, 80, 40].map((w, i) => (
            <div key={i} className="h-3 rounded bg-dash-surface-2" style={{ width: w }} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-b border-dash-border px-4 py-3 flex gap-4 items-center">
            <div className="h-4 flex-1 rounded bg-dash-surface-2" />
            <div className="h-5 w-16 rounded-md bg-dash-surface-2" />
            <div className="h-5 w-14 rounded-md bg-dash-surface-2" />
            <div className="h-4 w-12 rounded bg-dash-surface-2" />
            <div className="h-4 w-8 rounded bg-dash-surface-2" />
            <div className="h-4 w-8 rounded bg-dash-surface-2" />
            <div className="h-2 w-20 rounded-full bg-dash-surface-2" />
            <div className="h-4 w-4 rounded bg-dash-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
