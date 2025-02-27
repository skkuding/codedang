import { Separator } from '@/components/shadcn/separator'
import { redirect } from 'next/navigation'
import { RecentNotice } from './_components/RecentNotice'
import { RecentUpdate } from './_components/RecentUpdate'

interface DashboardProps {
  params: { courseId: string }
}
export default function Dashboard({ params }: DashboardProps) {
  const { courseId } = params
  redirect(`/course/${courseId}/assignment`)

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
