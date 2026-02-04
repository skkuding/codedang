export function ProblemStatisticsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-4 h-8 w-48 rounded-xl bg-gray-200" />
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
      <div className="mb-[112px] flex h-[338px] gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="w-1/2 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

export function ProblemStatisticsSkeletonWithSidebar() {
  return (
    <div className="flex animate-pulse gap-7">
      <div className="h-25 w-[276px] shrink-0 rounded-2xl bg-gray-100" />
      <ProblemStatisticsSkeleton />
    </div>
  )
}

export function UserAnalysisSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 animate-pulse flex-col gap-3">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 rounded bg-gray-100" />
          <div className="h-10 w-80 rounded-full bg-gray-100" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-xl border-none bg-white p-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]">
        <div className="mb-2 flex items-start justify-between">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-4 w-32 rounded bg-gray-100" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-3/4 rounded bg-gray-100" />
              <div className="h-4 w-12 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-xl border-none bg-white p-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]">
        <div className="mb-2 h-4 w-40 rounded bg-gray-100" />
        <div className="h-[200px] w-full rounded-lg bg-gray-100" />
      </div>

      <div className="flex w-full flex-col gap-3 rounded-xl border-none bg-white p-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]">
        <div className="mb-4 h-4 w-32 rounded bg-gray-100" />
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 border-b border-gray-50 pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3 rounded bg-gray-100" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 rounded bg-gray-100" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function UserAnalysisSkeletonWithSidebar() {
  return (
    <div className="flex animate-pulse gap-7">
      <div className="h-25 w-72 shrink-0 rounded-2xl bg-gray-100" />
      <UserAnalysisSkeleton />
    </div>
  )
}
