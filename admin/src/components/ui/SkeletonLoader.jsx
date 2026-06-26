export default function SkeletonLoader({ variant = 'table-row', count = 5 }) {
  const base = 'animate-pulse bg-ink-100 dark:bg-ink-700 rounded';

  if (variant === 'stat-card') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className={`${base} h-8 w-8 rounded-lg mb-3`} />
            <div className={`${base} h-6 w-20 mb-2`} />
            <div className={`${base} h-3 w-28`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className={`${base} h-40 w-full rounded-lg`} />
            <div className={`${base} h-4 w-3/4`} />
            <div className={`${base} h-3 w-1/2`} />
          </div>
        ))}
      </div>
    );
  }

  // default: table-row
  return (
    <div className="divide-y divide-ink-100 dark:divide-ink-800">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className={`${base} h-4 w-4 rounded`} />
          <div className={`${base} h-9 w-9 rounded-lg flex-shrink-0`} />
          <div className="flex-1 space-y-1.5">
            <div className={`${base} h-3.5 w-48`} />
            <div className={`${base} h-2.5 w-32`} />
          </div>
          <div className={`${base} h-5 w-16 rounded-full`} />
          <div className={`${base} h-3.5 w-20`} />
        </div>
      ))}
    </div>
  );
}
