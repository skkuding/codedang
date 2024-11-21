import { Skeleton } from '@/components/shadcn/skeleton'

export default function Loading() {
  return (
    <div className="flex h-fit flex-col gap-5 p-6 text-lg">
      <Skeleton className="h-12 w-full rounded-xl bg-slate-900" />
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex h-8 w-full rounded-xl bg-slate-900"
          />
        ))}
      </div>
    </div>
  )
}
