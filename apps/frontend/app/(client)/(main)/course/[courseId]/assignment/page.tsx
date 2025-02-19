import { Separator } from '@/components/shadcn/separator'
import { auth } from '@/libs/auth'
import { AssignmentTable } from '../_components/AssignmentTable'
import { AssignmentTableSwitchButton } from '../_components/AssignmentTableSwitchButton'
import { FinishedAssignmentTable } from '../_components/FinishedAssignmentTable'
import { OngoingAssignmentTable } from '../_components/OngoingAssignmentTable'
import { UpcomingAssignmentTable } from '../_components/UpcomingAssignmentTable'

interface AssignmentProps {
  searchParams: {
    type: string
  }
}
export default async function Assignment({ searchParams }: AssignmentProps) {
  const type = searchParams.type
  const session = await auth()
  return (
    <div className="mt-[78px] flex flex-col">
      <div>
        <AssignmentTableSwitchButton type={type} />
        <Separator className="mb-3" />
        <div className="mb-12 w-full">
          {type === 'showAll' && <AssignmentTable session={session} />}
          {type === 'ongoing' && <OngoingAssignmentTable />}
          {type === 'upcoming' && <UpcomingAssignmentTable />}
          {type === 'finished' && <FinishedAssignmentTable session={session} />}
        </div>
      </div>
    </div>
  )
}
