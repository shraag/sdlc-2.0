export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 rounded-lg bg-dash-surface-2" />
          <div className="h-4 w-64 rounded-lg bg-dash-surface-2 mt-2" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-dash-surface-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-dash-border bg-dash-surface p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-9 w-9 rounded-lg bg-dash-surface-2" />
              <div className="h-5 w-16 rounded-md bg-dash-surface-2" />
            </div>
            <div className="h-5 w-3/4 rounded-lg bg-dash-surface-2" />
            <div className="h-4 w-full rounded-lg bg-dash-surface-2" />
            <div className="h-3 w-1/3 rounded-lg bg-dash-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
