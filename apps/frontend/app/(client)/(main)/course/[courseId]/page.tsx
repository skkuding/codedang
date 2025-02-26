import { Separator } from '@/components/shadcn/separator'
// import { OngoingAssignments } from './_components/OngoingAssignments'
import { RecentNotice } from './_components/RecentNotice'
import { RecentUpdate } from './_components/RecentUpdate'

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="p-10">
          <RecentNotice />
        </div>
        <Separator orientation="vertical" className="h-full bg-gray-300" />
        <div className="p-10">
          <RecentUpdate />
        </div>
      </div>
      <Separator />
      {/* <OngoingAssignments /> */}
    </div>
  )
}
