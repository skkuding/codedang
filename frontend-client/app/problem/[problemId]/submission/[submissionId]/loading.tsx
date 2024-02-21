import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex h-fit flex-col gap-4 p-2 text-lg">
      <Skeleton className="h-20 w-full bg-slate-900" />
      <Skeleton className="h-8 w-3/12 bg-slate-900" />
      <Skeleton className="h-32 w-full bg-slate-900" />
    </div>
  )
}
