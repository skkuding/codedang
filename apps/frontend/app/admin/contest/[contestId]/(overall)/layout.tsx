'use client'

import { DeadlineStatus } from '@/components/DeadlineStatus'
import { RegistrationTimeStatus } from '@/components/RegistrationTimeStatus'
import { Button } from '@/components/shadcn/button'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { use } from 'react'
import { FaAngleLeft, FaPencil, FaUser } from 'react-icons/fa6'
import { IoKey } from 'react-icons/io5'
import { ContestOverallTabs } from '../_components/ContestOverallTabs'

export default function Layout(props: {
  params: Promise<{ contestId: string }>
  tabs: React.ReactNode
}) {
  const params = use(props.params)

  const { tabs } = props

  const { contestId } = params

  const contestData = useQuery(GET_CONTEST, {
    variables: {
      contestId: Number(contestId)
    }
  }).data?.getContest
  return (
    <main className="flex flex-col px-20 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/contest">
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">{contestData?.title}</span>
        </div>
        <Link href={`/admin/contest/${contestId}/edit`}>
          <Button variant="default" className="h-[50px] w-[120px]">
            <FaPencil className="mr-2 h-4 w-4" />
            <p className="text-lg font-semibold">Edit</p>
          </Button>
        </Link>
      </div>
      <div className="mb-[120px] flex flex-col gap-[10px]">
        <div className="flex font-normal text-[#333333E5]">
          <FaUser className="black self-center" color="#3581FA" />
          &nbsp; Contest Admin : {contestData?.createdBy?.username}
        </div>
        <div className="text-primary flex font-medium">
          <IoKey className="black self-center" color="#3581FA" />
          &nbsp; Invitation code : {contestData?.invitationCode}
        </div>
        <RegistrationTimeStatus
          startTime={contestData?.startTime}
          registerDueTime={contestData?.registerDueTime}
        />
        <DeadlineStatus
          startTime={contestData?.startTime}
          endTime={contestData?.endTime}
        />
      </div>

      <ContestOverallTabs contestId={contestId} />
      {tabs}
    </main>
  )
}
