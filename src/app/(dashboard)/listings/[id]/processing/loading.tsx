export default function ProcessingLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="h-8 w-56 rounded bg-sage/20" />
      <div className="mt-2 h-4 w-64 rounded bg-sage/10" />

      <div className="mt-8 rounded-2xl border border-sage/10 bg-white p-6">
        <div className="h-5 w-32 rounded bg-sage/15" />
        <div className="mt-4 h-3 w-full rounded-full bg-sage/10" />
        <div className="mt-6 grid grid-cols-7 gap-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center rounded-lg border border-sage/10 bg-cream p-2">
              <div className="h-3 w-8 rounded bg-sage/15" />
              <div className="mt-1 h-2 w-10 rounded bg-sage/10" />
              <div className="mt-1 h-2 w-2 rounded-full bg-sage/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
