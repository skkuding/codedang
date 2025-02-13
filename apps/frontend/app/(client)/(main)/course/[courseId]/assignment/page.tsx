import { Separator } from '@/components/shadcn/separator'
import { AssignmentTable } from '../_components/AssignmentTable'
import { AssignmentTableSwitchButton } from '../_components/AssignmentTableSwitchButton'
import { FinishedAssignmentTable } from '../_components/FinishedAssignmentsTable'
import { OngoingAssignmentTable } from '../_components/OngoingAssignmentTable'
import { UpcomingAssignmentTable } from '../_components/UpcomingAssignmentTable'

//ongoingAssignmentTable, upcomingAssignmentTable ...컴포넌트 만들어서 불러와서 넣기
interface AssignmentProps {
  searchParams: {
    showAll: string
    ongoing: string
    upcoming: string
    finished: string
  }
}
export default function Assignment({ searchParams }: AssignmentProps) {
  const showAll = searchParams.showAll === 'true'
  const ongoing = searchParams.ongoing === 'false'
  const upcoming = searchParams.upcoming === 'false'
  const finished = searchParams.finished === 'false'
  return (
    <div>
      <div className="pt-[78px]">
        <AssignmentTableSwitchButton
          showAll={showAll}
          ongoing={ongoing}
          upcoming={upcoming}
          finished={finished}
        />
        <Separator className="mb-3" />
        {showAll && <AssignmentTable />}
        {ongoing && <OngoingAssignmentTable />}
        {upcoming && <UpcomingAssignmentTable />}
        {finished && <FinishedAssignmentTable />}
      </div>
    </div>
  )
}
