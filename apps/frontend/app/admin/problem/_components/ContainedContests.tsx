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
import FileInfoIcon from '@/public/24_compile.svg'
import type { GetContestsByProblemIdQuery } from '@generated/graphql'
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
  data
}: {
  data: GetContestsByProblemIdQuery
}) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const contestData = data.getContestsByProblemId

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
        </DialogContent>
      </div>
    </Dialog>
  )
}
