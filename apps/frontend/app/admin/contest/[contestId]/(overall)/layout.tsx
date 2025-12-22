'use client'

import { AdminContestStatusTimeDiff } from '@/app/admin/_components/AdminContestStatusTimeDiff'
import { TimeStatusBadge } from '@/components/TimeStatusBadge'
import { Button } from '@/components/shadcn/button'
import { GET_CONTEST } from '@/graphql/contest/queries'
import keyBlueIcon from '@/public/icons/key-blue.svg'
import { useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { use } from 'react'
import { FaAngleLeft, FaPencil, FaUser } from 'react-icons/fa6'
import { ContestOverallTabs } from '../_components/ContestOverallTabs'
import { InvitationModal } from './@tabs/_components/InvitationModal'

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

  const currentTime = dayjs()

  const colorMap = (state: string | undefined) => {
    if (state === 'ONGOING') {
      return 'text-primary bg-color-blue-95'
    } else if (state === 'ENDED') {
      return 'text-color-pink-50 bg-color-pink-95'
    } else if (state === 'UPCOMING') {
      return 'text-color-orange-50 bg-color-yellow-95'
    } else {
      return ''
    }
  }

  const invitationFlag = contestData?.invitationCode !== null

  const registerDDayStatus = (() => {
    const registerDueTime = dayjs(contestData?.registerDueTime)
    const createTime = dayjs(contestData?.createTime)

    if (currentTime.isAfter(registerDueTime)) {
      return 'ENDED'
    }

    if (
      currentTime.isBefore(registerDueTime) &&
      currentTime.isAfter(createTime)
    ) {
      return 'ONGOING'
    }
  })()

  const contestDDayStatus = (() => {
    const startTime = dayjs(contestData?.startTime)
    const endTime = dayjs(contestData?.endTime)

    if (currentTime.isAfter(endTime)) {
      return 'ENDED'
    }

    if (currentTime.isAfter(startTime) && currentTime.isBefore(endTime)) {
      return 'ONGOING'
    }

    if (currentTime.isBefore(startTime)) {
      return 'UPCOMING'
    }
  })()

  return (
    <main className="py-22 flex flex-col px-[82px]">
      <div className="mb-[30px] flex items-start justify-between">
        <div className="item-start flex gap-2">
          <div className="flex-shrink-0">
            <Link href="/admin/contest">
              <Image src={leftArrowIcon} alt="LeftArrow" width={32} />
            </Link>
          </div>
          <div className="line-clamp-2 text-clip break-all text-[32px] font-bold leading-[38.4px] tracking-[-0.96px] text-black">
            {contestData?.title}
          </div>
        </div>
        <div className="flex items-start justify-between">
          <InvitationModal
            disabled={!invitationFlag}
            invitationCode={contestData?.invitationCode}
            createdByUsername={contestData?.createdBy?.username}
          />
          <Link href={`/admin/contest/${contestId}/edit`}>
            <Button
              variant="default"
              className="hover:bg-primary ml-2 h-[46px] w-[100px] px-[22px] pb-[11px] pt-[10px]"
              type="button"
            >
              <Image src={penIcon} alt="Pen" width={20} className="mr-[6px]" />
              <p className="text-lg font-medium leading-[25.2px] tracking-[-0.54px] text-white">
                Edit
              </p>
            </Button>
          </Link>
        </div>
      </div>
      <div className="mb-[120px] flex flex-col gap-[10px]">
        <div className="flex items-center gap-[6px] font-normal text-[#333333E5]">
          <FaUser className="black ml-0.5 self-center" color="#3581FA" />
          <span>Contest Admin : </span>
          <span>{contestData?.createdBy?.username}</span>
        </div>
        <div className="flex items-center gap-[6px] text-[#333333E5]">
          <Image src={keyBlueIcon} alt="keyBlueicon" />
          <span className="text-primary font-medium">Invitation code : </span>
          <span>{contestData?.invitationCode ?? '-'}</span>
          <TimeStatusBadge
            status="undefined"
            endTime={contestData?.registerDueTime}
          />
        </div>
        <AdminContestStatusTimeDiff
          showText={true}
          contest={contestData}
          textStyle="font-normal text-[#333333E5] opacity-100"
          inContestEditor={false}
        />
      </div>
      <ContestOverallTabs contestId={contestId} />
      {tabs}
    </main>
  )
}
