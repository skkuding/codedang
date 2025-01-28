import { Separator } from '@/components/shadcn/separator'
import { AssignmentOverview } from './_components/AssignmentOverview'
import { RecentNotice } from './_components/RecentNotice'
import { RecentUpdates } from './_components/RecentUpdates'

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="p-10">
          <RecentNotice />
        </div>
        <Separator orientation="vertical" className="h-full bg-gray-300" />
        <div className="p-10">
          <RecentUpdates />
        </div>
      </div>
      <Separator />
      <AssignmentOverview />
    </div>
  )
}
