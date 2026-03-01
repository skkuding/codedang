export function ProblemCreateContainerSkeleton() {
  return (
    <div className="px-29 gap-17 mt-14 flex w-[1440px] animate-pulse flex-col">
      <div className="flex flex-col gap-6">
        <div className="h-10 w-80 rounded-lg bg-gray-200" />
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-gray-200" />
              <div className="h-5 w-20 rounded bg-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-gray-200" />
              <div className="h-5 w-12 rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-[49px] w-32 rounded-md bg-gray-200" />
        </div>
      </div>

      <div className="flex gap-10">
        <div className="border-1 border-color-neutral-90 flex h-fit w-64 flex-col gap-3 rounded-2xl bg-white p-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[48px] w-full rounded-xl bg-gray-100" />
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
  return <div className="h-[600px] animate-pulse rounded-2xl bg-gray-100" />
}
