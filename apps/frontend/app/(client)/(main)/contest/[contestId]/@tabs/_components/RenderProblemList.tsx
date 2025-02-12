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
  console.log('state:', state)
  console.log('registered?:', isRegistered)
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
    console.log('transData:', transformedProblemData)
    return (
      <div>
        {problemData.total === 0 ? (
          <div>No result.</div>
        ) : (
          <DataTable
            data={problemData.data}
            columns={RenderProblemColumn}
            headerStyle={{
              order: 'text-left w-[48px] md:w-4/6',
              title: 'w-2/4 md:w-1/6'
            }}
            linked
          />
        )}
      </div>
    )
  }
}
