import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { KatexContent } from '@/components/KatexContent'
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
import calendarIcon from '@/public/icons/calendar_blue.svg'
import type { ContestTop, ProblemDataTop, ContestOrder } from '@/types/type'
import Image from 'next/image'
import { getOngoingUpcomingContests } from '../_libs/apis'
import { BiggerImageButton } from './_components/BiggerImageButton'
import { ContestOverviewLayout } from './_components/ContestOverviewLayout'
import { GotoContestListButton } from './_components/GotoContestListButton'
import { PrevNextProblemButton } from './_components/PrevNextProblemButton'
import { RegisterButton } from './_components/RegisterButton'
import { RenderProblemList } from './_components/RenderProblemList'

interface ContestTopProps {
  params: {
    contestId: string
  }
  searchParams: {
    search: string
  }
}

export default async function ContestTop({
  params,
  searchParams
}: ContestTopProps) {
  const session = await auth()
  const search = searchParams.search ?? ''
  const { contestId } = params
  const data: ContestTop = await fetcherWithAuth
    .get(`contest/${contestId}`)
    .json()
  const problemData: ProblemDataTop = await fetcherWithAuth
    .get(`contest/${contestId}/problem`)
    .json()
  const orderedContests: ContestOrder[] = await getOngoingUpcomingContests(
    search,
    session
  )

  const startTime = data.startTime
  const endTime = data.endTime
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

  const { posterUrl, summary, description, id: currentContestId } = data

  const imageUrl = posterUrl || '/logos/welcome.png'
  const prev = true

  console.log('data', data)
  console.log('state', state)
  console.log('Type of startTime:', typeof data.startTime)
  return (
    <div>
      <h1 className="mt-24 w-[1208px] text-2xl font-semibold tracking-[-0.72px]">
        {data?.title}
      </h1>
      <div className="mt-[30px] flex flex-col gap-[10px]">
        <div className="flex gap-2">
          <Image src={calendarIcon} alt="calendar" width={20} height={20} />
          <p className="text-base font-normal tracking-[-0.48px] text-[#333333e6]">
            {formattedStartTime} ~ {formattedEndTime}
          </p>
        </div>
        <ContestStatusTimeDiff
          contest={data}
          textStyle="text-[#333333e6] font-normal opacity-100"
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
          <div className="absolute bottom-3 right-3 cursor-pointer">
            <BiggerImageButton url={imageUrl} />
          </div>
        </div>
        <div className="mt-[34px] flex h-[312px] flex-col justify-between">
          <div className="flex flex-col gap-[14px]">
            <ContestSummary
              buttonName="참여 대상"
              summary={summary.참여대상 ? summary.참여대상 : '없음'}
            />
            <ContestSummary
              buttonName="진행 방식"
              summary={summary.진행방식 ? summary.진행방식 : '없음'}
            />
            <ContestSummary
              buttonName="순위 산정"
              summary={summary.순위산정 ? summary.순위산정 : '없음'}
            />
            <ContestSummary
              buttonName="문제 형태"
              summary={summary.문제형태 ? summary.문제형태 : '없음'}
            />
            <ContestSummary
              buttonName="참여 혜택"
              summary={summary.참여혜택 ? summary.참여혜택 : '없음'}
            />
          </div>

          {session && state !== 'Finished' && (
            <div className="h-[48px] w-[940px]">
              {data.isRegistered ? (
                <Button className="text pointer-events-none h-[48px] w-[940px] rounded-[1000px] bg-[#F0F0F0] font-medium text-[#9B9B9B]">
                  Registered
                </Button>
              ) : (
                <RegisterButton
                  id={contestId}
                  state={state}
                  title={data.title}
                  invitationCodeExists={data.invitationCodeExists}
                  disabled={data.isPrivilegedRole}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <Accordion type="single" collapsible className="mt-16 w-[1208px]">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="h-[74px] border-t-[1.5px] border-[#a2a2a240] pr-[25px] text-lg font-semibold tracking-[-0.6px]">
            More Description
          </AccordionTrigger>
          <AccordionContent className="pb-8 text-base text-[#00000080]">
            <KatexContent content={description} />
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
              state={state}
              isRegistered={data.isRegistered}
              problemData={problemData}
              isPrivilegedRole={data.isPrivilegedRole}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <PrevNextProblemButton
        contestData={orderedContests}
        currentContestId={currentContestId}
        previous={prev}
        search={search}
      />
      <PrevNextProblemButton
        contestData={orderedContests}
        currentContestId={currentContestId}
        previous={!prev}
        search={search}
      />
      <GotoContestListButton />
    </div>
    // <ContestOverviewLayout
    //   contest={data}
    //   isRealPage={true}
    //   problemData={problemData}
    //   orderedContests={orderedContests}
    //   session={session}
    //   search={search}
    // />
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
