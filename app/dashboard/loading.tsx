export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-48 bg-ink-soft animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-ink-soft animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-ink-soft animate-pulse" />
    </div>
  );
}
