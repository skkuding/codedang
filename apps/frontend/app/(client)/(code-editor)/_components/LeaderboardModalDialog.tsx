import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger
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
          className="h-[450px] w-[700px] max-w-none gap-0 space-y-0 rounded-[16px] border-none bg-slate-900 pb-[48px] pl-[40px] pt-[40px] text-gray-300 [&>button:last-child]:hidden"
        >
          <DialogClose className="absolute left-[644px] top-[24px]">
            <X className="h-[24px] w-[24px]" />
          </DialogClose>
          <div className="flex flex-col gap-[24px] overflow-x-auto">
            <div className="h-[26px] w-[226px] text-[18px] font-[600] text-white">
              Ranking System of Contest
            </div>
            <div className="flex text-gray-400">
              <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                1
              </div>
              <div className="ml-[12px] flex flex-col">
                <div className="text-[14px]">
                  The ranking of each participants is determined
                </div>
                <div className="text-[14px]">
                  based on <b>the number of problems solved.</b>
                </div>
              </div>
            </div>
            <div className="flex text-gray-400">
              <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                2
              </div>
              <div className="ml-[12px] flex flex-col space-y-[16px]">
                <div>
                  <div className="text-[14px]">
                    If the number of problems solved is the same,
                  </div>
                  <div className="text-[14px]">
                    the ranking is determined in ascending order of{' '}
                    <b>penalty.</b>
                  </div>
                </div>
                <div className="flex h-[104px] w-[548px] flex-col gap-[8px] rounded-md bg-gray-800 py-[14px] pl-[22px] pr-[69px]">
                  <div className="h-[16px] text-[14px] text-white">
                    <b>Penalty Calculation</b>
                  </div>
                  <div className="h-[48px]">
                    <div className="mb-1 text-[14px]">
                      Time from the start of the contest to Accepted (min.)
                    </div>
                    <div className="text-[14px]">
                      + (Number of submissions - 1) * 20
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex text-gray-400">
              <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                -
              </div>
              <div className="ml-[12px] flex flex-col">
                <div className="text-[14px]">
                  If the number of problems solved and the penalty are the same,
                </div>
                <div className="text-[14px]">
                  they are considered to have the same rank.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
