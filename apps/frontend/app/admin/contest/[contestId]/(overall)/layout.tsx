'use client'

import { AdminContestStatusTimeDiff } from '@/app/admin/_components/AdminContestStatusTimeDiff'
import { Button } from '@/components/shadcn/button'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import emergencyIcon from '@/public/icons/emergency.svg'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
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
        <div className="flex font-normal text-[#333333E5]">
          <IoKey className="black self-center" color="#3581FA" />
          &nbsp; Invitation code : {contestData?.invitationCode}
        </div>
        <div className="flex items-center gap-2">
          <Image src={calendarIcon} alt="calendar" width={16} />
          <p className="font-normal text-[#333333E5]">
            {dateFormatter(contestData?.startTime, 'YY-MM-DD HH:mm')} ~{' '}
            {dateFormatter(contestData?.endTime, 'YY-MM-DD HH:mm')}
          </p>
        </div>
        <AdminContestStatusTimeDiff
          contest={contestData}
          textStyle="font-normal text-[#333333E5] opacity-100"
          inContestEditor={false}
        />
        <div className="flex items-center gap-2">
          <Image src={emergencyIcon} alt="emergency" width={16} />
          <p className="font-normal text-[#333333E5]">
            {dateFormatter(contestData?.registerDueTime, 'YY-MM-DD HH:mm')}
          </p>
        </div>
      </div>

      <ContestOverallTabs contestId={contestId} />
      {tabs}
    </main>
  )
}
