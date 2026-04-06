export default function ContentLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-8 w-48 rounded bg-sage/20" />
          <div className="mt-2 h-4 w-64 rounded bg-sage/10" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-20 rounded-full bg-sage/15" />
          <div className="h-10 w-32 rounded-lg bg-sage/20" />
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-sage/10 bg-white p-4">
            <div className="h-3 w-12 rounded bg-sage/10" />
            <div className="mt-2 h-7 w-16 rounded bg-sage/20" />
            <div className="mt-1 h-3 w-24 rounded bg-sage/10" />
          </div>
        ))}
      </div>

      {/* Calendar skeleton */}
      <div className="rounded-2xl border border-sage/10 bg-white p-6">
        <div className="mb-5 h-5 w-48 rounded bg-sage/15" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-sage/10">
              <div className="aspect-square bg-sage/10" />
              <div className="p-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-10 rounded bg-sage/15" />
                  <div className="h-4 w-10 rounded-full bg-sage/10" />
                </div>
                <div className="mt-1 h-2 w-14 rounded bg-sage/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
