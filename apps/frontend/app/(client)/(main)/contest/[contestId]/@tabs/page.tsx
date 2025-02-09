import { dataIfError } from '@/app/(client)/(code-editor)/problem/[problemId]/submission/_libs/dataIfError'
import { BaseModal } from '@/components/BaseModal'
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
import calendarIcon from '@/public/icons/calendar.svg'
import type { Contest, ContestStatus } from '@/types/type'
import Image from 'next/image'
import { BiggerImageButton } from './_components/BiggerImageButton'
import { ContestSummary } from './_components/ContestSummary'
import { RegisterButton } from './_components/RegisterButton'
import { RenderProblemList } from './_components/RenderProblemList'

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
  posterUrl?: string
  participationTarget?: string
  competitionMethod?: string
  rankingMethod?: string
  problemFormat?: string
  benefits?: string
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
  // const data: ContestTop = await fetcherWithAuth
  //   .get(`contest/${contestId}`)
  //   .json()
  const data: ContestTop = {
    id: 4,
    title: '24년도 소프트웨어학과 신입생 입학 테스트3',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2028-01-01T23:59:59.000Z',
    group: { id: '1', groupName: 'Example Group' },
    isJudgeResultVisible: true,
    posterUrl:
      'https://stage.codedang.com/bucket/image-bucket/4393c8b5-0938-4108-b53f-cb548beb47af',
    participationTarget: '성균관대학교 24학번 신입생',
    competitionMethod: '강의실에서 오프라인으로 진행',
    rankingMethod: '맞춘 문제 수와 penalty를 종합하여 순위 산출',
    problemFormat: '문제 형식은 다음과 같습니다.',
    benefits: '참여 혜택 정보',
    enableCopyPaste: true,
    status: 'Ongoing' as ContestStatus,
    participants: 1,
    isRegistered: false,
    invitationCodeExists: false,
    description: '<p>이 대회는 현재 진행 중입니다 !</p>'
  }

  const contest: Contest = {
    ...data,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime)
  }

  console.log('contest: ', contest)
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
            className="h-[312px] w-[234px] rounded-xl border-[1px] object-contain"
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
          <AccordionTrigger className="w-[74px] border-t-[1.5px] border-[#a2a2a240] text-lg font-semibold">
            More Description
          </AccordionTrigger>
          <AccordionContent className="text-base text-[#00000080]">
            {description}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible className="w-[1208px]">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="w-[74px] border-t-[1.5px] border-[#a2a2a240] text-lg font-semibold">
            Problem List
          </AccordionTrigger>
          <AccordionContent className="text-base text-[#00000080]">
            {RenderProblemList(state, data.isRegistered)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
