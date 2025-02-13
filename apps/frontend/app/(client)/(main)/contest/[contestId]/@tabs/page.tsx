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
    id: number
    groupName: string
  }
  contestRecord: { userId: number }[]
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
  _count: {
    contestRecord: number
  }
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

export interface ProblemDataTop {
  data: {
    order: number
    id: number | string
    title: string
    difficulty: string
    submissionCount: number
    acceptedRate: number
    maxScore: number
    score: null | number
    submissionTime: null | string
  }[]
  total: number
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
  // const data: ContestTop = {
  //   id: 1,
  //   title: 'SKKU Coding Platform 모의대회',
  //   startTime: '2024-01-01T00:00:00.000Z',
  //   endTime: '2028-01-01T23:59:59.000Z',
  //   group: {
  //     id: 1,
  //     groupName: 'Example Group'
  //   },
  //   contestRecord: [
  //     {
  //       userId: 1
  //     },
  //     {
  //       userId: 2
  //     },
  //     {
  //       userId: 3
  //     },
  //     {
  //       userId: 4
  //     },
  //     {
  //       userId: 5
  //     },
  //     {
  //       userId: 6
  //     },
  //     {
  //       userId: 7
  //     },
  //     {
  //       userId: 8
  //     },
  //     {
  //       userId: 9
  //     },
  //     {
  //       userId: 10
  //     },
  //     {
  //       userId: 11
  //     },
  //     {
  //       userId: 12
  //     },
  //     {
  //       userId: 13
  //     }
  //   ],
  //   enableCopyPaste: true,
  //   isJudgeResultVisible: true,
  //   posterUrl:
  //     'https://stage.codedang.com/bucket/image-bucket/4393c8b5-0938-4108-b53f-cb548beb47af',
  //   participationTarget: '성균관대 재학생이라면 누구나',
  //   competitionMethod: '온라인으로 진행',
  //   rankingMethod: '맞춘 문제 수와 penalty로 산정',
  //   problemFormat: '이러한 방식으로 출제될 거에요',
  //   benefits: '참가자 전원 스타벅스 기프티콘 증정',
  //   contestProblem: [
  //     {
  //       order: 0,
  //       problem: {
  //         title: '정수 더하기'
  //       }
  //     },
  //     {
  //       order: 1,
  //       problem: {
  //         title: '가파른 경사'
  //       }
  //     },
  //     {
  //       order: 2,
  //       problem: {
  //         title: '회전 표지판'
  //       }
  //     }
  //   ],
  //   _count: {
  //     contestRecord: 13
  //   },
  //   description:
  //     '<p>\n  대통령은 내란 또는 외환의 죄를 범한 경우를 제외하고는 재직중 형사상의 소추를\n  받지 아니한다. 모든 국민은 자기의 행위가 아닌 친족의 행위로 인하여 불이익한\n  처우를 받지 아니한다.\n</p>\n\n<p>\n  위원은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니한다.\n  대통령은 국무회의의 의장이 되고, 국무총리는 부의장이 된다. 모든 국민은 헌법과\n  법률이 정한 법관에 의하여 법률에 의한 재판을 받을 권리를 가진다.\n</p>\n\n<p>\n  국회의원은 현행범인인 경우를 제외하고는 회기중 국회의 동의없이 체포 또는\n  구금되지 아니한다. 헌법재판소의 장은 국회의 동의를 얻어 재판관중에서 대통령이\n  임명한다.\n</p>\n\n<p>\n  국가는 지역간의 균형있는 발전을 위하여 지역경제를 육성할 의무를 진다. 제3항의\n  승인을 얻지 못한 때에는 그 처분 또는 명령은 그때부터 효력을 상실한다. 이 경우\n  그 명령에 의하여 개정 또는 폐지되었던 법률은 그 명령이 승인을 얻지 못한 때부터\n  당연히 효력을 회복한다.\n</p>\n\n<p>\n  모든 국민은 신체의 자유를 가진다. 누구든지 법률에 의하지 아니하고는\n  체포·구속·압수·수색 또는 심문을 받지 아니하며, 법률과 적법한 절차에 의하지\n  아니하고는 처벌·보안처분 또는 강제노역을 받지 아니한다.\n</p>',
  //   invitationCodeExists: true,
  //   isRegistered: true,
  //   prev: null,
  //   next: {
  //     id: 2,
  //     title: '24년도 소프트웨어학과 신입생 입학 테스트1'
  //   },
  //   status: 'ongoing',
  //   participants: 2
  // }

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
          <AccordionContent className="pt-[22px] text-base text-[#00000080]">
            {RenderProblemList(state, data.isRegistered, problemData)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
