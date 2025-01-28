import { Separator } from '@/components/shadcn/separator'
import { AssignmentOverview } from './_components/AssignmentOverview'
import { RecentAnouncement } from './_components/RecentAnouncement'
import { RecentUpdates } from './_components/RecentUpdates'

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <div className="grid items-center gap-4">
        <RecentAnouncement />
        <Separator orientation="vertical" className="h-full bg-gray-300" />
        <RecentUpdates />
      </div>
      <Separator />
      <AssignmentOverview />
    </div>
  )
}
