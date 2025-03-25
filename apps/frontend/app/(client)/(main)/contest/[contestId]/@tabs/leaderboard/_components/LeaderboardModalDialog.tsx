import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
  DialogTitle
} from '@/components/shadcn/dialog'
import infoIcon from '@/public/icons/file-info-gray.svg'
import { X } from 'lucide-react'
import Image from 'next/image'

export function LeaderboardModalDialog() {
  return (
    <div className="flex">
      <Dialog>
        <DialogTrigger asChild>
          <Image
            src={infoIcon}
            alt="info-icon"
            width={32}
            height={32}
            className="ml-1 cursor-pointer"
          />
        </DialogTrigger>
        <DialogContent
          showDarkOverlay={true}
          className="h-[545px] w-[700px] max-w-none gap-0 space-y-0 rounded-[16px] border-none bg-[#FFFFFF] pb-12 pl-10 pt-10 [&>button:last-child]:hidden"
        >
          <DialogTitle className="sr-only">
            Ranking System of Contest
          </DialogTitle>
          <DialogClose className="absolute left-[644px] top-6">
            <X className="h-6 w-6" />
          </DialogClose>
          <div className="flex flex-col overflow-x-auto">
            <div className="mb-8 h-[34px] w-[500px] text-[24px] font-bold text-black">
              Ranking System of Contest
            </div>
            <div className="mb-7 flex text-[#5C5C5C]">
              <div className="flex h-[22px] w-[22px] flex-col items-center justify-center rounded-full bg-[#3581FA] text-[11px] text-white">
                1
              </div>
              <div className="ml-3 flex flex-col">
                <div className="text-base">
                  The ranking of each participants is determined
                </div>
                <div className="text-base">
                  based on the number of problems solved.
                </div>
              </div>
            </div>
            <div className="flex text-[#5C5C5C]">
              <div className="flex h-[22px] w-[22px] flex-col items-center justify-center rounded-full bg-[#3581FA] text-[11px] text-white">
                2
              </div>
              <div className="ml-4 flex flex-col space-y-4">
                <div>
                  <div className="text-base">
                    If the number of problems solved is the same,
                  </div>
                  <div className="text-base">
                    the ranking is determined in ascending order of penalty.
                  </div>
                </div>
                <div className="flex h-[104px] w-[562px] flex-col gap-3 rounded-[10px] bg-[#80808014] py-[18px] pl-6 pr-[69px] text-[#737373]">
                  <div className="h-4 text-[14px] text-black">
                    <b>Penalty Calculation</b>
                  </div>
                  <div className="h-12">
                    <div className="mb-1 text-[14px]">
                      Time from the start of the contest to Accepted (min.)
                    </div>
                    <div className="text-[14px]">
                      + (Number of submissions - 1) * 20
                    </div>
                  </div>
                </div>
                <div className="border-1 mt-7 flex h-[72px] w-[560px] flex-col justify-center rounded-[10px] border border-[#3581FA] pl-6 text-[#3581FA]">
                  <div>
                    If the number of problems solved and the penalty are the
                    same,
                  </div>
                  <div>they are considered to have the same rank.</div>
                </div>
              </div>
            </div>
            <div className="pt-[76px]">
              <div className="text-2xl font-bold">
                Introduction to Leaderboard
              </div>
            </div>
            <div className="space-y-4 pl-[11px] pt-[29px]">
              <div className="flex flex-row space-x-6">
                <div className="mt-[9px] flex h-[50px] w-[70px] flex-row items-center justify-center rounded-[10px] bg-[#FAFAFA] text-xl font-semibold">
                  NNN
                </div>
                <div className="flex h-[68px] w-[491px] flex-col justify-center rounded-[10px] bg-[#FAFAFA] pl-6">
                  <div className="h-[22px] w-[69px] font-semibold text-[#474747]">
                    Accepted
                  </div>
                  <div className="text-sm text-[#737373]">
                    Penalty for accepted problems.
                  </div>
                </div>
              </div>
              <div className="flex flex-row space-x-6">
                <div className="mt-[9px] flex h-[50px] w-[70px] flex-row items-center justify-center rounded-[10px] bg-[#FAFAFA] text-xl font-semibold text-[#C4C4C4]">
                  Frozen
                </div>
                <div className="flex h-[68px] w-[491px] flex-col justify-center rounded-[10px] bg-[#FAFAFA] pl-6">
                  <div className="h-[22px] w-[69px] font-semibold text-[#474747]">
                    Unrevealed
                  </div>
                  <div className="text-sm text-[#737373]">
                    Penalty and submission counts are revealed after freezing
                    time.
                  </div>
                </div>
              </div>
              <div className="flex flex-row space-x-6">
                <div className="mt-[9px] flex h-[50px] w-[70px] flex-row items-center justify-center rounded-[10px] bg-[#FAFAFA] text-xl font-semibold">
                  -
                </div>
                <div className="flex h-[68px] w-[491px] flex-col justify-center rounded-[10px] bg-[#FAFAFA] pl-6">
                  <div className="h-[22px] w-[69px] font-semibold text-[#474747]">
                    Unsolved
                  </div>
                </div>
              </div>
              <div className="flex flex-row space-x-6">
                <div className="mt-[9px] flex h-[50px] w-[70px] flex-row items-center justify-center rounded-[10px] bg-[#FAFAFA] text-xl font-semibold text-[#3581FA]">
                  NNN
                </div>
                <div className="flex h-[68px] w-[491px] flex-col justify-center rounded-[10px] bg-[#FAFAFA] pl-6">
                  <div className="h-[22px] w-[90px] font-semibold text-[#474747]">
                    First Solver
                  </div>
                  <div className="text-sm text-[#737373]">
                    The first person to solve the problem
                  </div>
                </div>
              </div>
              <div className="flex flex-row space-x-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mt-[9px] flex h-[33px] w-[70px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-base font-semibold text-white">
                    3 sub
                    <div className="absolute -bottom-[8px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[7px] border-r-[6px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#3581FA]" />
                  </div>
                </div>
                <div className="flex h-[68px] w-[491px] flex-col justify-center rounded-[10px] bg-[#FAFAFA] pl-6">
                  <div className="h-[22px] w-[90px] font-semibold text-[#474747]">
                    Submission
                  </div>
                  <div className="text-sm text-[#737373]">
                    The number of submissions displayed when hovering over
                    ‘Accepted’
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
