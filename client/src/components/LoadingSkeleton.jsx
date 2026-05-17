export function CardSkeleton() {
  return (
    <div className="glass-card p-5 border border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="skeleton w-16 h-5 rounded-full" />
      </div>
      <div className="skeleton h-3 w-20 mb-2 rounded" />
      <div className="skeleton h-8 w-24 rounded" />
      <div className="skeleton h-3 w-32 mt-2 rounded" />
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="glass-card p-5 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div>
          <div className="skeleton h-4 w-24 rounded mb-1" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-3">
            <div className="skeleton h-3 w-16 rounded mb-2" />
            <div className="skeleton h-6 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="flex-1">
            <div className="skeleton h-3 w-48 rounded mb-1" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
