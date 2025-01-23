import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { Button } from '@/components/shadcn/button'
import { auth } from '@/libs/auth'
import { cn, fetcherWithAuth } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Contest } from '@/types/type'
import Image from 'next/image'
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

  console.log('session:', session)
  console.log('state:', state)

  const imgTagMatch = data.description.match(/<img[^>]+src="([^"]+)"/)
  const imageUrl = imgTagMatch ? imgTagMatch[1] : '/logos/welcome.png'

  return (
    <>
      <h1 className="mt-24 h-[66px] w-[1208px] text-2xl font-bold">
        {data?.title}
      </h1>
      <div className="mt-[30px] flex flex-col gap-[10px]">
        <div className="flex gap-2">
          <Image src={calendarIcon} alt="calendar" width={20} height={20} />
          <p className="text-descriptext font-medium">
            {formattedStartTime} ~ {formattedEndTime}
          </p>
        </div>
        <ContestStatusTimeDiff
          contest={contest}
          textStyle="text-descriptext font-medium opacity-100"
          inContestEditor={false}
        />
      </div>
      <div className="flex flex-row items-start gap-[34px]">
        <div className="mt-[34px] h-[312px] w-[234px] rounded-[10px] bg-white">
          <Image
            src={imageUrl}
            alt="Contest Poster"
            width={234}
            height={312}
            className="h-[312px] w-[234px] rounded-[10px] border-[1px] object-contain"
          />
        </div>
        <div className="mt-[34px] flex flex-col gap-[29px]">
          <div className="flex flex-col gap-[14px]">
            <div className="flex flex-row items-center">
              <Button
                variant={'outline'}
                className={cn(
                  'mr-[14px] h-7 w-[87px] rounded-[14px] px-[17px] py-1 text-sm font-medium md:block'
                )}
              >
                참여 대상
              </Button>
              <p className="text-descriptext">공백 포함 60자 글자수 제한</p>
            </div>
            <div className="flex flex-row items-center">
              <Button
                variant={'outline'}
                className={cn(
                  'mr-[14px] h-7 w-[87px] rounded-[14px] px-[17px] py-1 text-sm font-medium md:block'
                )}
              >
                진행 방식
              </Button>
              <p className="text-descriptext">공백 포함 60자 글자수 제한</p>
            </div>
            <div className="flex flex-row items-center">
              <Button
                variant={'outline'}
                className={cn(
                  'mr-[14px] h-7 w-[87px] rounded-[14px] px-[17px] py-1 text-sm font-medium md:block'
                )}
              >
                순위 산정
              </Button>
              <p className="text-descriptext">공백 포함 60자 글자수 제한</p>
            </div>
            <div className="flex flex-row items-center">
              <Button
                variant={'outline'}
                className={cn(
                  'mr-[14px] h-7 w-[87px] rounded-[14px] px-[17px] py-1 text-sm font-medium md:block'
                )}
              >
                문제 형태
              </Button>
              <p className="text-descriptext">
                공백 포함 120자 글자수 제한 <br /> 최대 두 줄까지 노출 가능.
              </p>
            </div>
            <div className="flex flex-row items-center">
              <Button
                variant={'outline'}
                className={cn(
                  'mr-[14px] h-7 w-[87px] rounded-[14px] px-[17px] py-1 text-sm font-medium md:block'
                )}
              >
                참여 혜택
              </Button>
              <p className="text-descriptext">
                공백 포함 120자 글자수 제한 <br /> 최대 두 줄까지 노출 가능.
              </p>
            </div>
          </div>

          {session && state !== 'Finished' && (
            <div className="h-[48px] w-[940px]">
              {data.isRegistered ? (
                <Button className="bg-deactivate text-deactivatetext pointer-events-none h-[48px] w-[940px] rounded-[1000px]">
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
