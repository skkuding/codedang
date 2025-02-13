import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { resultKeyNameFromField } from '@apollo/client/utilities'
import { resourceLimits } from 'worker_threads'
import type { ProblemDataTop } from '../page'
import { RenderProblemColumn } from './RenderProblemColumn'

export function RenderProblemList(
  state: string,
  isRegistered: boolean,
  problemData: ProblemDataTop
) {
  if (state === 'Upcoming') {
    return (
      <div className="h-[608px] w-[1208px] place-content-center rounded-2xl bg-[#d9d9d940]">
        <div className="text-center text-xl font-semibold text-[#000000]">
          {`Contest Hasn't Started`}
        </div>
        <div className="text-center text-base font-normal text-[#00000080]">
          The problem list will be released after the start of the contest
        </div>
      </div>
    )
  } else if (state === 'Ongoing' && !isRegistered) {
    return (
      <div className="h-[608px] w-[1208px] place-content-center rounded-2xl bg-[#d9d9d940]">
        <div className="text-center text-xl font-semibold text-[#000000]">
          Please Register for The Contest First!
        </div>
        <div className="text-center text-base font-normal text-[#00000080]">
          The problem list only be revealed to contest participants
        </div>
      </div>
    )
  } else {
    const transformedProblemData = problemData.data.map((problem) => {
      return {
        ...problem,
        id: `/problem/${problem.id}`
      }
    })

    return (
      <div>
        {problemData.total === 0 ? (
          <div>No result.</div>
        ) : (
          <DataTable
            data={transformedProblemData}
            columns={RenderProblemColumn}
            headerStyle={{
              order: 'text-[#8A8A8A] w-[10px] p-0 md:w-[64px] px-4',
              title: 'text-[#8A8A8A] text-left w-[100px] p-0 md:w-[832px] px-6',
              score: 'text-[#8A8A8A] w-4/10 p-0 md:w-[296px] px-4'
            }}
            linked
          />
        )}
      </div>
    )
  }
}
