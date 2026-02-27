import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from '@/components/shadcn/dialog'
import InfoIcon from '@/public/icons/info-icon.svg'
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
          <div className="flex flex-col gap-6 overflow-x-auto">
            <p className="text-sub1_sb_18 h-[26px] w-[226px] text-white">
              Ranking System of Contest
            </p>
            <div className="flex text-gray-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                1
              </div>
              <div className="ml-3 flex flex-col">
                <p className="text-body4_r_14">
                  The ranking of each participant is determined
                </p>
                <p className="text-body4_r_14">
                  based on <b>the number of problems solved.</b>
                </p>
              </div>
            </div>
            <div className="flex text-gray-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                2
              </div>
              <div className="ml-4 flex flex-col space-y-4">
                <div>
                  <p className="text-body4_r_14">
                    If the number of problems solved is the same,
                  </p>
                  <p className="text-body4_r_14">
                    the ranking is determined in ascending order of{' '}
                    <b>penalty.</b>
                  </p>
                </div>
                <div className="flex h-[104px] w-[548px] flex-col gap-2 rounded-md bg-gray-800 py-[14px] pl-[22px] pr-[69px]">
                  <p className="text-body4_r_14 h-4 text-white">
                    <b>Penalty Calculation</b>
                  </p>
                  <div className="h-12">
                    <p className="text-body4_r_14 mb-1">
                      Time from the start of the contest to Accepted (min.)
                    </p>
                    <p className="text-body4_r_14">
                      + (Number of submissions - 1) * 20
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex text-gray-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                +
              </div>
              <div className="ml-3 flex flex-col">
                <p className="text-body4_r_14">
                  If the number of problems solved and the penalty are the same,
                </p>
                <p className="text-body4_r_14">
                  ranking is determined by the earliest time of submission of
                  the last accepted.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
