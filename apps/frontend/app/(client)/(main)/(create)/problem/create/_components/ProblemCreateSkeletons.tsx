export function ProblemCreateContainerSkeleton() {
  return (
    <div className="px-29 mt-14 flex w-[1440px] animate-pulse flex-col gap-6">
      <div className="flex items-center justify-between gap-5">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-64 rounded-lg bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 rounded bg-gray-200" />
            <div className="h-5 w-32 rounded bg-gray-100" />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="h-12 w-28 rounded-lg bg-gray-200" />
          <div className="h-12 w-32 rounded-lg bg-gray-200" />
        </div>
      </div>

      <div className="flex gap-10">
        <div className="border-1 flex h-fit w-72 flex-col gap-1 rounded-xl border-gray-100 bg-white p-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex w-full items-center justify-between px-3 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="size-5 rounded bg-gray-100" />
                <div className="flex flex-col gap-[6px]">
                  <div className="h-5 w-24 rounded bg-gray-100" />
                  <div className="h-4 w-32 rounded bg-gray-50" />
                </div>
              </div>
              <div className="size-5 rounded-full bg-gray-50" />
            </div>
          ))}
        </div>

        <div className="flex-1">
          <ProblemCreateContentSkeleton />
        </div>
      </div>
    </div>
  )
}

export function ProblemCreateContentSkeleton() {
  return (
    <div className="h-[700px] w-full animate-pulse rounded-2xl bg-gray-50" />
  )
}
