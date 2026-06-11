import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { EmptyStatePlaceholder } from '@/app/(client)/(main)/_components/EmptyStatePlaceholder'
import type { ProblemDataTop } from '@/types/type'
import { RenderProblemColumn } from './RenderProblemColumn'

interface RenderProblemListProps {
  state: string
  isRegistered: boolean
  problemData: ProblemDataTop
  isPrivilegedRole: boolean
  linked?: boolean
}

export function RenderProblemList({
  state,
  isRegistered,
  problemData,
  isPrivilegedRole,
  linked = true
}: RenderProblemListProps) {
  if (state === 'Upcoming' && !isPrivilegedRole) {
    return (
      <EmptyStatePlaceholder
        title={`Contest Hasn't Started`}
        description="The problem list will be released after the start of the contest"
        className="h-[608px] w-[1208px] rounded-[20px]"
        imageWidth={454}
        imageHeight={262}
      />
    )
  } else if (state === 'Ongoing' && !isRegistered && !isPrivilegedRole) {
    return (
      <EmptyStatePlaceholder
        title="Please Register for The Contest First!"
        description="The problem list only be revealed to contest participants"
        className="h-[608px] w-[1208px] rounded-[20px]"
        imageWidth={454}
        imageHeight={262}
      />
    )
  } else {
    if (problemData.total === 0) {
      return <div>No result.</div>
    } else {
      const transformedProblemData = problemData.data.map((problem) => {
        return {
          ...problem,
          id: `/problem/${problem.id}`
        }
      })
      return (
        <DataTable
          data={transformedProblemData}
          columns={RenderProblemColumn}
          headerStyle={{
            order: 'text-[#8A8A8A] w-[10px] p-0 md:w-16 px-4',
            title: 'text-[#8A8A8A] text-left w-[100px] p-0 md:w-[832px] px-6',
            score: 'text-[#8A8A8A] w-4/10 p-0 md:w-[296px] px-4'
          }}
          linked={linked}
        />
      )
    }
  }
}
