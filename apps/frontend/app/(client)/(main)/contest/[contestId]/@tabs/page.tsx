import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { Button } from '@/components/shadcn/button'
import { auth } from '@/libs/auth'
import { cn, fetcherWithAuth } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Contest, ContestStatus } from '@/types/type'
import Image from 'next/image'
import { ContestSummary } from './_components/ContestSummary'
import { RegisterButton } from './_components/RegisterButton'

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

  const imgTagMatch = data.description.match(/<img[^>]+src="([^"]+)"/)
  const imageUrl = imgTagMatch ? imgTagMatch[1] : '/logos/welcome.png'

  return (
    <>
      <h1 className="mt-24 w-[1202px] text-2xl font-bold">{data?.title}</h1>
      <div className="mt-[30px] flex flex-col gap-[10px]">
        <div className="flex gap-2">
          <Image src={calendarIcon} alt="calendar" width={20} height={20} />
          <p className="font-medium text-[#333333e6]">
            {formattedStartTime} ~ {formattedEndTime}
          </p>
        </div>
        <ContestStatusTimeDiff
          contest={contest}
          textStyle="text-[#333333e6] font-medium opacity-100"
          inContestEditor={false}
        />
      </div>
      <div className="flex flex-row items-start gap-[34px]">
        <div className="mt-[34px] rounded-xl">
          <Image
            src={imageUrl}
            alt="Contest Poster"
            width={234}
            height={312}
            className="h-[312px] w-[234px] rounded-xl border-[1px] object-contain"
          />
        </div>
        <div className="mt-[34px] flex h-[312px] flex-col justify-between">
          <div className="flex flex-col gap-[14px]">
            <ContestSummary
              buttonname="참여 대상"
              summary="공백 포함 60자 글자수 제한"
            />
            <ContestSummary
              buttonname="진행 방식"
              summary="공백 포함 60자 글자수 제한"
            />
            <ContestSummary
              buttonname="순위 산정"
              summary="공백 포함 60자 글자수 제한"
            />
            <ContestSummary
              buttonname="문제 형태"
              summary="공백 포함 120자 글자수 제한 최대 두 줄까지 노출 가능."
            />
            <ContestSummary
              buttonname="참여 혜택"
              summary="공백 포함 120자 글자수 제한 최대 두 줄까지 노출 가능."
            />
          </div>

          {session && state !== 'Finished' && (
            <div className="h-[48px] w-[940px]">
              {data.isRegistered ? (
                <Button className="text pointer-events-none h-[48px] w-[940px] rounded-[1000px] bg-[#80808014] text-[#3333334d]">
                  Registered
                </Button>
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
        </div>
      </div>
    </>
  )
}
