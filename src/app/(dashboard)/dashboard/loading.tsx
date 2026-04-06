export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded bg-sage/20" />
          <div className="mt-2 h-4 w-56 rounded bg-sage/10" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-sage/20" />
      </div>

      <div className="mt-8">
        <div className="h-5 w-32 rounded bg-sage/15" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-sage/10 bg-white px-6 py-4"
            >
              <div>
                <div className="h-4 w-48 rounded bg-sage/15" />
                <div className="mt-2 h-3 w-32 rounded bg-sage/10" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 w-20 rounded bg-sage/10" />
                <div className="h-5 w-16 rounded-full bg-sage/15" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
