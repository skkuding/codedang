export function ProblemCreateContainerSkeleton() {
  return (
    <div className="flex w-[1208px] animate-pulse flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="h-[52px] w-80 rounded-lg bg-gray-200" />
        <div className="flex items-center gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-gray-200" />
              <div className="h-6 w-24 rounded bg-gray-200" />
              {i < 4 && <div className="ml-1 h-0.5 w-4 rounded bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-5">
        <div className="w-[900px]">
          <ProblemCreateContentSkeleton />
        </div>

        <div className="flex w-72 flex-col gap-6 rounded-2xl bg-white p-6">
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="flex flex-col gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="size-5 rounded bg-gray-200" />
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-24 rounded bg-gray-200" />
                    <div className="h-4 w-32 rounded bg-gray-100" />
                  </div>
                </div>
                <div className="size-5 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="h-12 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function ProblemCreateContentSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-3">
      <section className="flex flex-col gap-5 rounded-2xl bg-white px-6 py-7">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 rounded bg-gray-200" />
          <div className="h-6 w-80 rounded bg-gray-100" />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="h-6 w-12 rounded bg-gray-200" />
            <div className="h-11 rounded-xl border border-gray-200 bg-gray-50" />
          </div>

          <div className="flex gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex flex-1 flex-col gap-1.5">
                <div className="h-6 w-36 rounded bg-gray-200" />
                <div className="h-11 rounded-xl border border-gray-200 bg-gray-50" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl bg-white px-6 py-7">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 rounded bg-gray-200" />
          <div className="h-6 w-[500px] rounded bg-gray-100" />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="flex h-12 items-center gap-2 border-b border-gray-200 bg-gray-50 px-3">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="size-6 rounded bg-gray-200" />
            ))}
          </div>
          <div className="flex h-48 flex-col justify-between bg-white px-7 py-6">
            <div className="h-6 w-48 rounded bg-gray-100" />
            <div className="h-5 w-10 self-end rounded bg-gray-100" />
          </div>
        </div>

        <div className="flex gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex flex-1 flex-col gap-2">
              <div className="h-6 w-10 rounded bg-gray-200" />
              <div className="h-44 rounded-lg bg-neutral-900">
                <div className="flex h-full flex-col gap-3 px-6 py-5">
                  <div className="h-5 w-40 rounded bg-gray-600" />
                  <div className="h-0.5 w-72 rounded bg-gray-600" />
                  <div className="h-4 w-20 rounded bg-gray-700" />
                  <div className="h-4 w-24 rounded bg-gray-700" />
                  <div className="h-4 w-16 rounded bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl bg-white px-6 py-7">
        <div className="flex items-start justify-between gap-5">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-56 rounded bg-gray-200" />
            <div className="h-6 w-[500px] rounded bg-gray-100" />
          </div>
          <div className="h-11 w-28 rounded-lg border border-gray-200 bg-gray-50" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-6 w-24 rounded bg-gray-200" />
              <div className="h-44 rounded-lg bg-neutral-900">
                <div className="flex h-full flex-col gap-3 px-6 py-5">
                  <div className="h-5 w-40 rounded bg-gray-600" />
                  <div className="h-0.5 w-72 rounded bg-gray-600" />
                  <div className="h-4 w-20 rounded bg-gray-700" />
                  <div className="h-4 w-24 rounded bg-gray-700" />
                  <div className="h-4 w-16 rounded bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
