import { Skeleton } from '@/components/ui/skeleton'

export default function SubmissionLoading() {
  return (
    <div className="flex h-fit flex-col gap-4 p-6 text-lg">
      <Skeleton className="h-10 w-full bg-slate-900" />
      <div className="flex flex-col gap-2">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-8 w-1/12 bg-slate-900" />
            <Skeleton className="h-8 w-1/12 bg-slate-900" />
            <Skeleton className="h-8 w-3/12 bg-slate-900" />
            <Skeleton className="h-8 w-2/12 bg-slate-900" />
            <Skeleton className="h-8 w-3/12 bg-slate-900" />
            <Skeleton className="h-8 w-2/12 bg-slate-900" />
          </div>
        ))}
      </div>
    </div>
  )
}
