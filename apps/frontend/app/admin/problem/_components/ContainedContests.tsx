import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import FileInfoIcon from '@/public/24_compile.svg'
import { useQuery } from '@apollo/client'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import Image from 'next/image'
import { useState } from 'react'

function ContestSection({
  title,
  contests
}: {
  title: string
  contests?: { id: string; title: string }[]
}) {
  if (!contests || contests.length === 0) return null

  return (
    <div>
      <p className="mb-2 font-bold text-neutral-800">{title}</p>
      {contests.map((contest) => (
        <p key={contest.id} className="text-xs text-neutral-400">
          {contest.title}
        </p>
      ))}
    </div>
  )
}

export default function ContainedContests({
  problemId
}: {
  problemId: number
}) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const contestData = useQuery(GET_BELONGED_CONTESTS, {
    variables: {
      problemId: Number(problemId)
    }
  }).data?.getContestsByProblemId

  return (
    <Dialog onOpenChange={() => setIsTooltipOpen(false)}>
      <TooltipProvider>
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <button
                className="justify-centert flex items-center"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsTooltipOpen(true)
                }}
                onMouseEnter={() => setIsTooltipOpen(true)}
                onMouseLeave={() => setIsTooltipOpen(false)}
              >
                <Image src={FileInfoIcon} alt="fileinfo" />
              </button>
            </TooltipTrigger>
          </DialogTrigger>
          {isTooltipOpen && (
            <TooltipContent className="mr-4 bg-white">
              <p className="text-xs text-neutral-900">
                Click to check which contests include this problem.
              </p>
              <TooltipPrimitive.Arrow className="fill-white" />
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <div onClick={(e) => e.stopPropagation()}>
        <DialogContent
          className="sm:max-w-[425px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <p className="text-lg font-semibold">
              Contests which include this problem
            </p>
          </DialogHeader>
          {contestData && contestData?.upcoming.length > 0 && (
            <div>
              <p className="mb-2 font-bold text-neutral-800">
                Upcoming Contest(s)
              </p>
              {contestData?.upcoming.map((contest) => (
                <p key={contest.id} className="text-xs text-neutral-400">
                  {contest.title}
                </p>
              ))}
            </div>
          )}
          <ContestSection
            title="Upcoming Contest(s)"
            contests={contestData?.upcoming}
          />
          <ContestSection
            title="Ongoing Contest(s)"
            contests={contestData?.ongoing}
          />
          <ContestSection
            title="Finished Contest(s)"
            contests={contestData?.finished}
          />
          {(!contestData ||
            (contestData.upcoming.length === 0 &&
              contestData.ongoing.length === 0 &&
              contestData.finished.length === 0)) && (
            <p className="text-xs text-neutral-400">
              There are no contests that have imported this problem.
            </p>
          )}
        </DialogContent>
      </div>
    </Dialog>
  )
}
