import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Button } from '@/components/shadcn/button'
import { auth } from '@/libs/auth'
import { fetcherWithAuth } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import { cn } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Contest, ContestStatus, ProblemDataTop } from '@/types/type'
import Image from 'next/image'
import { BiggerImageButton } from './_components/BiggerImageButton'
import { GotoContestListButton } from './_components/GotoContestListButton'
import { NextProblemButton } from './_components/NextProblemButton'
import { PrevProblemButton } from './_components/PrevProblemButton'
import { RegisterButton } from './_components/RegisterButton'
import { RenderProblemList } from './_components/RenderProblemList'

export interface ContestTop {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  group: {
    id: number
    groupName: string
  }
  isJudgeResultVisible: boolean
  posterUrl?: string
  participationTarget?: string
  competitionMethod?: string
  rankingMethod?: string
  problemFormat?: string
  benefits?: string
  contestProblem: {
    order: number
    problem: {
      title: string
    }
  }[]
  enableCopyPaste: boolean
  status: ContestStatus
  participants: number
  isRegistered: boolean
  invitationCodeExists: boolean
  prev: null | {
    id: number
    title: string
  }
  next: null | {
    id: number
    title: string
  }
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
  const problemData: ProblemDataTop = await fetcherWithAuth
    .get(`contest/${contestId}/problem`)
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

  const posterUrl = data.posterUrl
  const imageUrl = posterUrl ? posterUrl : '/logos/welcome.png'
  const participationTarget = data.participationTarget
  const competitionMethod = data.competitionMethod
  const rankingMethod = data.rankingMethod
  const problemFormat = data.problemFormat
  const benefits = data.benefits
  const description = data.description

  return (
    <div>
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
        <div className="relative mt-[34px] flex flex-shrink-0 rounded-xl">
          <Image
            src={imageUrl}
            alt="Contest Poster"
            width={234}
            height={312}
            className="h-[312px] w-[234px] rounded-xl border object-contain"
          />
          <div className="absolute bottom-3 right-3">
            <BiggerImageButton url={imageUrl} />
          </div>
        </div>
        <div className="mt-[34px] flex h-[312px] flex-col justify-between">
          <div className="flex flex-col gap-[14px]">
            <ContestSummary
              buttonname="참여 대상"
              summary={participationTarget ? participationTarget : '없음'}
            />
            <ContestSummary
              buttonname="진행 방식"
              summary={competitionMethod ? competitionMethod : '없음'}
            />
            <ContestSummary
              buttonname="순위 산정"
              summary={rankingMethod ? rankingMethod : '없음'}
            />
            <ContestSummary
              buttonname="문제 형태"
              summary={problemFormat ? problemFormat : '없음'}
            />
            <ContestSummary
              buttonname="참여 혜택"
              summary={benefits ? benefits : '없음'}
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
      <Accordion type="single" collapsible className="mt-16 w-[1208px]">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="h-[74px] w-[74px] border-t-[1.5px] border-[#a2a2a240] text-lg font-semibold">
            More Description
          </AccordionTrigger>
          <AccordionContent className="pb-8 text-base text-[#00000080]">
            {description}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible className="w-[1208px]">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="h-[74px] w-[74px] border-t-[1.5px] border-[#a2a2a240] text-lg font-semibold">
            Problem List
          </AccordionTrigger>
          <AccordionContent className="mb-10 pb-0 pt-[3px] text-base text-[#00000080]">
            {RenderProblemList(state, data.isRegistered, problemData)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div>{PrevProblemButton(data)}</div>
      <div>{NextProblemButton(data)}</div>
      <GotoContestListButton />
    </div>
  )
}

function ContestSummary({
  buttonname,
  summary
}: {
  buttonname: string
  summary: string
}) {
  return (
    <div className="flex w-full flex-row items-start">
      <Button
        variant={'outline'}
        className={cn(
          'mr-[14px] h-7 w-[87px] rounded-[14px] px-[17px] py-1 text-sm font-medium md:block'
        )}
      >
        {buttonname}
      </Button>
      <div className="text-[#333333e6] md:max-w-[838px]">{summary}</div>
    </div>
  )
}
