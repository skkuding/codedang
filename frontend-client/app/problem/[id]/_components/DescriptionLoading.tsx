import Skeleton from '@/components/ui/skeleton'

export default function DescriptionLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 text-lg">
      <Skeleton className="h-7 w-32 bg-slate-900" />
      <div className="flex flex-col gap-1 ">
        <Skeleton className="h-4 w-full bg-slate-900" />
        <Skeleton className="h-4 w-full bg-slate-900" />
        <Skeleton className="h-4 w-full bg-slate-900" />
      </div>

      {/*input*/}
      <Skeleton className="h-7 w-16 bg-slate-900" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-full bg-slate-900" />
        <Skeleton className="h-4 w-full bg-slate-900" />
        <Skeleton className="h-4 w-full bg-slate-900" />
      </div>
      {/*output*/}
      <Skeleton className="h-7 w-20 bg-slate-900" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-full bg-slate-900" />
        <Skeleton className="h-4 w-full bg-slate-900" />
        <Skeleton className="h-4 w-full bg-slate-900" />
      </div>
      {/*sample input*/}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40 bg-slate-900" />
        <Skeleton className="h-[23px] w-5 bg-slate-900" />
      </div>
      <Skeleton className="h-24 w-full bg-slate-900" />
      {/*sample output*/}
      <Skeleton className="h-7 w-40 bg-slate-900" />
      <Skeleton className="h-24 w-full bg-slate-900" />
      {/*other things*/}
      <Skeleton className="h-7 w-40 bg-slate-900" />
      <Skeleton className="h-7 w-40 bg-slate-900" />
      <Skeleton className="h-7 w-40 bg-slate-900" />
      <div className="mt-5 flex gap-2 ">
        <Skeleton className="h-7 w-12 bg-slate-900" />
        <Skeleton className="h-7 w-12 rounded-full bg-slate-900" />
      </div>
      <br />
      <div className="mt-5 flex gap-3">
        <Skeleton className="h-8 w-8 bg-slate-900" />
        <Skeleton className="h-8 w-20 bg-slate-900" />
      </div>
    </div>
  )
}
