'use client'

import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { Button } from '@/components/shadcn/button'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Contest } from '@/types/type'
import type { ContestStatus } from '@/types/type'
import { useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaAngleLeft, FaPencil } from 'react-icons/fa6'
import { IoKey } from 'react-icons/io5'
import { ContestOverallTabs } from '../_components/ContestOverallTabs'

export default function Layout({
  params,
  tabs
}: {
  params: { contestId: string }
  tabs: React.ReactNode
}) {
  const { contestId } = params

  const contestData = useQuery(GET_CONTEST, {
    variables: {
      contestId: Number(contestId)
    }
  }).data?.getContest

  const [contestStatus, setContestStatus] = useState<ContestStatus>('finished')
  useEffect(() => {
    const now = dayjs()
    if (now.isAfter(contestData?.endTime)) {
      setContestStatus('finished')
    } else if (now.isAfter(contestData?.startTime)) {
      setContestStatus('ongoing')
    } else {
      setContestStatus('upcoming')
    }
  }, [contestData])

  const contestForTimeDiff: Contest = {
    id: Number(contestData?.id),
    title: String(contestData?.title),
    startTime: new Date(contestData?.startTime),
    endTime: new Date(contestData?.endTime),
    summary: {},
    isJudgeResultVisible: Boolean(contestData?.isJudgeResultVisible),
    enableCopyPaste: Boolean(contestData?.enableCopyPaste),
    //실제 status와 관련이 없습니다
    status: 'finished',
    participants: 0,
    isRegistered: false,
    contestProblem: []
  }

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
          <Button variant="default">
            <FaPencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>
      <div className="mb-[120px] flex flex-col gap-[10px]">
        <div className="flex font-normal text-[#333333E5]">
          <IoKey className="black self-center" color="#3581FA" />
          &nbsp; Invitation code: {contestData?.invitationCode}
        </div>
        <div className="flex items-center gap-2">
          <Image src={calendarIcon} alt="calendar" width={16} />
          <p className="font-normal text-[#333333E5]">
            {dateFormatter(contestData?.startTime, 'YY-MM-DD HH:mm')} ~{' '}
            {dateFormatter(contestData?.endTime, 'YY-MM-DD HH:mm')}
          </p>
        </div>
        <ContestStatusTimeDiff
          contest={contestForTimeDiff}
          textStyle="font-normal text-[#333333E5] opacity-100"
          inContestEditor={false}
        />
      </div>
      <ContestOverallTabs contestId={contestId} />
      {tabs}
    </main>
  )
}
