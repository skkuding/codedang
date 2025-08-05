import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
  DialogTitle
} from '@/components/shadcn/dialog'
import InfoIcon from '@/public/icons/info-icon.svg'
import { X } from 'lucide-react'
import Image from 'next/image'

export function LeaderboardModalDialog() {
  return (
    <div className="flex">
      <Dialog>
        <DialogTrigger asChild>
          <Image
            className="cursor-pointer"
            src={InfoIcon}
            alt="info"
            width={24}
          />
        </DialogTrigger>
        <DialogContent
          showDarkOverlay={true}
          className="h-[450px] w-[700px] max-w-none gap-0 space-y-0 rounded-[16px] border-none bg-slate-900 pb-12 pl-10 pt-10 text-gray-300 [&>button:last-child]:hidden"
        >
          <DialogTitle className="sr-only">
            Ranking System of Contest
          </DialogTitle>
          <DialogClose className="absolute left-[644px] top-6">
            <X className="h-6 w-6" />
          </DialogClose>
          <p className="flex flex-col gap-6 overflow-x-auto">
            <p className="h-[26px] w-[226px] text-[18px] font-semibold text-white">
              Ranking System of Contest
            </p>
            <p className="flex text-gray-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                1
              </div>
              <div className="ml-3 flex flex-col">
                <p className="text-[14px]">
                  The ranking of each participant is determined
                </p>
                <p className="text-[14px]">
                  based on <b>the number of problems solved.</b>
                </p>
              </div>
            </p>
            <p className="flex text-gray-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                2
              </div>
              <div className="ml-4 flex flex-col space-y-4">
                <p>
                  <p className="text-[14px]">
                    If the number of problems solved is the same,
                  </p>
                  <p className="text-[14px]">
                    the ranking is determined in ascending order of{' '}
                    <b>penalty.</b>
                  </p>
                </p>
                <p className="flex h-[104px] w-[548px] flex-col gap-2 rounded-md bg-gray-800 py-[14px] pl-[22px] pr-[69px]">
                  <p className="h-4 text-[14px] text-white">
                    <b>Penalty Calculation</b>
                  </p>
                  <p className="h-12">
                    <p className="mb-1 text-[14px]">
                      Time from the start of the contest to Accepted (min.)
                    </p>
                    <p className="text-[14px]">
                      + (Number of submissions - 1) * 20
                    </p>
                  </p>
                </p>
              </div>
            </p>
            <p className="flex text-gray-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                +
              </div>
              <div className="ml-3 flex flex-col">
                <p className="text-[14px]">
                  If the number of problems solved and the penalty are the same,
                </p>
                <p className="text-[14px]">
                  ranking is determined by the earliest time of submission of
                  the last accepted.
                </p>
              </div>
            </p>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
