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
import type {
  ContestPreview,
  ProblemDataTop,
  ContestOrder,
  ContestTop
} from '@/types/type'
import type { Session } from 'next-auth'
import Image from 'next/image'
import { BiggerImageButton } from './BiggerImageButton'
import { GotoContestListButton } from './GotoContestListButton'
import { PrevNextProblemButton } from './PrevNextProblemButton'
import { RegisterButton } from './RegisterButton'
import { RegisterCancelButton } from './RegisterCancelButton'
import { RenderProblemList } from './RenderProblemList'

interface ContestOverviewLayoutProps {
  contest: ContestTop | ContestPreview
  isPreview: boolean
  problemData?: ProblemDataTop
  orderedContests?: ContestOrder[]
  session?: Session | null
  search?: string
}

export function ContestOverviewLayout({
  contest,
  problemData,
  orderedContests,
  session,
  isPreview,
  search = ''
}: ContestOverviewLayoutProps) {
  let previewProblemData: ProblemDataTop
  if (!isPreview) {
    previewProblemData = problemData ?? { data: [], total: 0 }
  } else {
    previewProblemData = {
      data: (contest as ContestPreview).problems.map((problem) => ({
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
      total: (contest as ContestPreview).problems.length
    }
  }

  const problemDataToUse: ProblemDataTop =
    !isPreview && problemData ? problemData : previewProblemData

  const state = (() => {
    if (isPreview) {
      return 'Ongoing'
    }
    const currentTime = new Date()
    if (currentTime >= contest.endTime) {
      return 'Finished'
    }
    if (currentTime < contest.startTime) {
      return 'Upcoming'
    }
    return 'Ongoing'
  })()

  const imageUrl = contest.posterUrl || '/logos/welcome.png'

  const actualIsRegistered = !isPreview
    ? (contest as ContestTop).isRegistered
    : false
  const actualIsPrivilegedRole = !isPreview
    ? (contest as ContestTop).isPrivilegedRole
    : false
  const actualInvitationCodeExists = !isPreview
    ? (contest as ContestTop).invitationCodeExists
    : false

  return (
    <ScrollArea className={isPreview ? 'h-full w-full' : ''}>
      {' '}
      <div className="flex w-[1208px] flex-col justify-self-center">
        <h1 className="mt-20 w-[1208px] text-2xl font-semibold leading-[33.6px] tracking-[-0.72px] text-black">
          {contest?.title}
        </h1>
        <div className="mt-[20px] flex">
          <ContestStatusTimeDiff
            contest={contest}
            textStyle="text-base font-normal leading-[24px] tracking-[-0.48px] text-[#474747]"
            inContestEditor={false}
          />
        </div>
        <div className="mt-10 flex flex-row items-start gap-[30px]">
          <div className="relative flex flex-shrink-0 rounded-xl">
            <Image
              src={imageUrl}
              alt="Contest Poster"
              width={234}
              height={312}
              className="h-[312px] w-[234px] rounded-xl border object-contain"
            />
            <div className="absolute bottom-3 right-3 cursor-pointer">
              <BiggerImageButton url={imageUrl} />
            </div>
          </div>
          <div className="flex h-[312px] flex-col justify-between">
            <div className="flex flex-col gap-[10px]">
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

            <div className="h-[46px] w-[944px]">
              {isPreview && (
                <Button className="bg-primary border-primary h-[46px] w-[944px] rounded-full px-12 py-6 text-[16px] font-bold text-white">
                  Register Now!
                </Button>
              )}
              {!isPreview && session && state !== 'Finished' && (
                <div>
                  {actualIsRegistered ? (
                    <div className="flex h-[46px] w-[944px] gap-[10px]">
                      <Button className="pointer-events-none h-[46px] w-[467px] rounded-[1000px] bg-[#F0F0F0] text-base font-medium leading-[22.4px] tracking-[-0.48px] text-[#9B9B9B]">
                        Registered
                      </Button>
                      <RegisterCancelButton contest={contest} state={state} />
                    </div>
                  ) : (
                    <RegisterButton
                      id={String(contest.id)}
                      state={state}
                      title={contest.title}
                      invitationCodeExists={actualInvitationCodeExists}
                      disabled={actualIsPrivilegedRole}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <Accordion type="single" collapsible className="mt-15 w-[1208px]">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger
              className="h-[78px] pb-[30px] pt-[30px] text-xl font-medium leading-[28px] tracking-[-0.6px] text-[#000000] data-[state=open]:pb-[12px]"
              iconStyle="h-5 w-5 text-[#737373]"
            >
              More Description
            </AccordionTrigger>
            <AccordionContent className="!m-0 pb-[30px] text-base font-normal leading-[24px] tracking-[-0.48px] text-[#474747]">
              <KatexContent content={contest.description} classname="!mt-0" />
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
            <AccordionTrigger
              className="h-[78px] border-t border-[#D8D8D8] pb-[30px] pt-[30px] text-xl font-medium leading-[28px] tracking-[-0.6px] text-[#000000]"
              iconStyle="h-5 w-5 text-[#737373]"
            >
              Problem List
            </AccordionTrigger>
            <AccordionContent>
              <RenderProblemList
                state={!isPreview ? state : 'Ongoing'}
                isRegistered={!isPreview ? actualIsRegistered : true}
                problemData={problemDataToUse}
                isPrivilegedRole={!isPreview ? actualIsPrivilegedRole : false}
                linked={!isPreview}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {!isPreview && orderedContests && (
          <>
            <PrevNextProblemButton
              contestData={orderedContests}
              currentContestId={contest.id}
              previous={true}
              search={search}
            />
            <PrevNextProblemButton
              contestData={orderedContests}
              currentContestId={contest.id}
              previous={false}
              search={search}
            />
            <GotoContestListButton />
          </>
        )}
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
    <div className="flex w-full flex-row items-center">
      <Button
        variant={'outline'}
        className="text-primary border-primary pointer-events-none mr-[14px] h-8 w-[91px] rounded-[1000px] px-[20px] py-[6px] text-sm font-medium leading-[19.6px] tracking-[-0.42px] md:block"
      >
        {buttonName}
      </Button>
      <div className="text-center text-base font-normal leading-[24px] tracking-[-0.48px] text-black md:max-w-[838px]">
        {summary}
      </div>
    </div>
  )
}
