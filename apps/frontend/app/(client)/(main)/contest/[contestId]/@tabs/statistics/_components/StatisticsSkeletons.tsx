export function StatisticsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-4 h-7 w-48 rounded-xl bg-gray-200" />
      <div className="mb-3 flex h-[98px] gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-1/4 rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="mb-5 flex h-[188px] gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-1/4 rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="flex h-[338px] gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="w-1/2 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

export function ProblemStatisticsSkeleton() {
  return (
    <div className="flex animate-pulse gap-7">
      <div className="h-25 w-[276px] shrink-0 rounded-2xl bg-gray-100" />
      <StatisticsSkeleton />
    </div>
  )
}
