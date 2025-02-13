import { Separator } from '@/components/shadcn/separator'
import { AssignmentTable } from '../_components/AssignmentTable'
import { AssignmentTableSwitchButton } from '../_components/AssignmentTableSwitchButton'
import { FinishedAssignmentTable } from '../_components/FinishedAssignmentsTable'
import { OngoingAssignmentTable } from '../_components/OngoingAssignmentTable'
import { UpcomingAssignmentTable } from '../_components/UpcomingAssignmentTable'

interface AssignmentProps {
  searchParams: {
    type: string
  }
}
export default function Assignment({ searchParams }: AssignmentProps) {
  const type = searchParams.type

  return (
    <div>
      <div className="pt-[78px]">
        <AssignmentTableSwitchButton type={type} />
        <Separator className="mb-3" />
        {type === 'showAll' && <AssignmentTable />}
        {type === 'ongoing' && <OngoingAssignmentTable />}
        {type === 'upcoming' && <UpcomingAssignmentTable />}
        {type === 'finished' && <FinishedAssignmentTable />}
      </div>
    </div>
  )
}
