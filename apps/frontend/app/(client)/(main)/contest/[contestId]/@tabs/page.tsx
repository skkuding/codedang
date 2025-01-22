import { BaseModal } from '@/components/BaseModal'
import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { KatexContent } from '@/components/KatexContent'
import { auth } from '@/libs/auth'
import { fetcherWithAuth } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import checkIcon from '@/public/icons/check-blue.svg'
import type { Contest } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import { dataTagSymbol } from '@tanstack/react-query'
import Image from 'next/image'
import { StaticImageData } from 'next/image'
import { Suspense } from 'react'
import React, { useState } from 'react'
import { IoSearchCircle } from 'react-icons/io5'
import { MdImageNotSupported } from 'react-icons/md'
import { number } from 'valibot'
import {
  GoToFirstProblemButton,
  GoToFirstProblemButtonFallback
} from './_components/GoToFirstProblemButton'
import { RegisterButton } from './_components/RegisterButton'

export type ContestStatus =
  | 'ongoing'
  | 'upcoming'
  | 'finished'
  | 'registeredOngoing'
  | 'registeredUpcoming'

interface ContestTop {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  group: {
    id: string
    groupName: string
  }
  isJudgeResultVisible: boolean
  enableCopyPaste: boolean
  status: ContestStatus
  participants: number
  isRegistered: boolean
  invitationCodeExists: boolean
}

interface ContestTopProps {
  params: {
    contestId: string
  }
}

export default async function ContestTop({ params }: ContestTopProps) {
  const session = await auth()
  const { contestId } = params
  const data: ContestTop = await fetcherWithAuth
    .get(`contest/${contestId}`)
    .json()
  console.log('data:', data)

  const contest: Contest = {
    ...data,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime)
  }

  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  const currentTime = new Date()
  const state = (() => {
    if (currentTime >= endTime) {
      return 'Finished'
    }

    if (currentTime < startTime) {
      return 'Upcoming'
    }

    return 'Ongoing'
  })()
  const formattedStartTime = dateFormatter(
    data.startTime,
    'YYYY-MM-DD HH:mm:ss'
  )
  const formattedEndTime = dateFormatter(data.endTime, 'YYYY-MM-DD HH:mm:ss')

  //const [modalOpen, setModalOpen] = useState(false)

  // const handleOpen = () => setModalOpen(true)
  // const handleClose = () => setModalOpen(false)

  console.log('session:', session)
  console.log('state:', state)

  const imgTagMatch = data.description.match(/<img[^>]+src="([^"]+)"/)
  const imageUrl = imgTagMatch
    ? imgTagMatch[1]
    : 'apps/frontend/app/opengraph-image.png'
  console.log('imageUrl: ', imageUrl)
  return (
    <>
      {/* <KatexContent
        content={data.description}
        classname="prose w-full max-w-full border-b-2 border-b-gray-300 p-5 py-12"
      /> */}
      <h1 className="mt-24 h-[66px] w-[1208px] text-2xl font-bold">
        {data?.title}
      </h1>
      <div className="mt-[30px] flex flex-col gap-[10px]">
        <div className="flex gap-2">
          <Image src={calendarIcon} alt="calendar" width={24} height={24} />
          <p className="font-medium text-[#333333]">
            {formattedStartTime} ~ {formattedEndTime}
          </p>
        </div>
        <ContestStatusTimeDiff
          contest={contest}
          textStyle="text-netural-900 font-medium"
          inContestEditor={false}
        />
      </div>
      <Image src={imageUrl} alt="Contest Poster" width={234} height={312} />
      {session && state !== 'Finished' && (
        <div className="mt-10 flex justify-center">
          {data.isRegistered ? (
            <ErrorBoundary fallback={null}>
              <Suspense fallback={<GoToFirstProblemButtonFallback />}>
                <GoToFirstProblemButton contestId={Number(contestId)} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <RegisterButton
              id={contestId}
              state={state}
              title={data.title}
              invitationCodeExists={data.invitationCodeExists}
            />
          )}
        </div>
      )}
    </>
  )
}
