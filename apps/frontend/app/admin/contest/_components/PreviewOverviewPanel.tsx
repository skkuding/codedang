import { BiggerImageButton } from '@/app/(client)/(main)/contest/[contestId]/@tabs/_components/BiggerImageButton'
import { RenderProblemList } from '@/app/(client)/(main)/contest/[contestId]/@tabs/_components/RenderProblemList'
import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { KatexContent } from '@/components/KatexContent'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar_blue.svg'
import type { ContestPreview } from '@/types/type'
import type { ProblemDataTop } from '@/types/type'
import Image from 'next/image'

interface OverviewPortalProps {
  contest: ContestPreview
}

export function PreviewOverviewPanel({ contest }: OverviewPortalProps) {
  const formattedStartTime = dateFormatter(
    contest.startTime,
    'YYYY-MM-DD HH:mm:ss'
  )
  const formattedEndTime = dateFormatter(contest.endTime, 'YYYY-MM-DD HH:mm:ss')

  const contestProblemsPreview: ProblemDataTop = {
    data: contest.problems.map((problem) => ({
      id: problem.id,
      title: problem.title,
      order: problem.order,
      difficulty: problem.difficulty,
      submissionCount: problem.submissionCount,
      acceptedRate: problem.acceptedRate,
      maxScore: 10,
      score: problem.score ?? null,
      submissionTime: null
    })),
    total: contest.problems.length
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex w-[1208px] flex-col justify-self-center">
        <h1 className="mt-24 w-full text-2xl font-semibold tracking-[-0.72px]">
          {contest?.title}
        </h1>
        <div className="mt-[30px] flex flex-col gap-[10px]">
          <div className="flex gap-2">
            <Image src={calendarIcon} alt="calendar" width={20} height={20} />
            <p className="text-base font-normal tracking-[-0.48px] text-[#333333e6]">
              {formattedStartTime} ~ {formattedEndTime}
            </p>
          </div>
          <ContestStatusTimeDiff
            contest={contest}
            textStyle="text-[#333333e6] font-normal opacity-100"
            inContestEditor={false}
          />
        </div>
        <div className="flex flex-row items-start gap-[34px]">
          <div className="relative mt-[34px] flex flex-shrink-0 rounded-xl">
            <Image
              src={contest.posterUrl}
              alt="Contest Poster"
              width={234}
              height={312}
              className="h-[312px] w-[234px] rounded-xl border object-contain"
            />
            <div className="absolute bottom-3 right-3 cursor-pointer">
              <BiggerImageButton url={contest.posterUrl} />
            </div>
          </div>
          <div className="mt-[34px] flex h-[312px] flex-col justify-between">
            <div className="flex flex-col gap-[14px]">
              <ContestSummary
                buttonName="참여 대상"
                summary={
                  contest.summary.참여대상 ? contest.summary.참여대상 : '없음'
                }
              />
              <ContestSummary
                buttonName="진행 방식"
                summary={
                  contest.summary.진행방식 ? contest.summary.진행방식 : '없음'
                }
              />
              <ContestSummary
                buttonName="순위 산정"
                summary={
                  contest.summary.순위산정 ? contest.summary.순위산정 : '없음'
                }
              />
              <ContestSummary
                buttonName="문제 형태"
                summary={
                  contest.summary.문제형태 ? contest.summary.문제형태 : '없음'
                }
              />
              <ContestSummary
                buttonName="참여 혜택"
                summary={
                  contest.summary.참여혜택 ? contest.summary.참여혜택 : '없음'
                }
              />
            </div>

            <div className="h-[48px] w-[940px]">
              <Button className="bg-primary border-primary h-[46px] w-[940px] rounded-full px-12 py-6 text-[16px] font-bold text-white">
                Register Now!
              </Button>
            </div>
          </div>
        </div>
        <Accordion type="single" collapsible className="mt-16 w-[1208px]">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="h-[74px] border-t-[1.5px] border-[#a2a2a240] pr-[25px] text-lg font-semibold tracking-[-0.6px]">
              More Description
            </AccordionTrigger>
            <AccordionContent className="pb-8 text-base text-[#00000080]">
              <KatexContent content={contest.description} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion
          defaultValue="item-1"
          type="single"
          collapsible
          className="w-[1208px]"
        >
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="h-[74px] border-t-[1.5px] border-[#a2a2a240] pr-[25px] text-lg font-semibold tracking-[-0.6px]">
              Problem List
            </AccordionTrigger>
            <AccordionContent className="mb-10 pb-0 pt-[3px] text-base text-[#00000080]">
              <RenderProblemList
                state={'Ongoing'}
                isRegistered={true}
                problemData={contestProblemsPreview}
                isPrivilegedRole={true}
                linked={false}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  )
}

function ContestSummary({
  buttonName,
  summary
}: {
  buttonName: string
  summary: string
}) {
  return (
    <div className="flex w-full flex-row items-start">
      <Button
        variant={'outline'}
        className="text-primary border-primary-light pointer-events-none mr-[14px] h-7 w-[87px] rounded-[14px] px-[17px] py-1 text-sm font-medium md:block"
      >
        {buttonName}
      </Button>
      <div className="text-[#333333e6] md:max-w-[838px]">{summary}</div>
    </div>
  )
}
