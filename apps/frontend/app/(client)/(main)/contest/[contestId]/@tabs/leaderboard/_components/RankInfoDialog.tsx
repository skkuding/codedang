import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import information from '@/public/icons/information.svg'
import Image from 'next/image'
import { SlArrowRight } from 'react-icons/sl'

export function RankInfoDialog() {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild className="flex h-8 w-8">
          <Image
            className="cursor-pointer"
            src={information}
            alt="information"
            width={24}
          />
        </DialogTrigger>
        <DialogContent
          showDarkOverlay={false}
          className="rounded-2xl border-none bg-white p-10 text-black sm:max-w-[700px]"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">
              Ranking System of Contest
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            {/* 1번 */}
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#80808029] text-[11px] font-semibold">
                1
              </div>
              <p className="text-sm text-[#5C5C5C]">
                The ranking of each participants is determined based
                <br />
                <span className="font-semibold">
                  on the number of problems solved.
                </span>
              </p>
            </div>
            {/* 2번 */}
            <div className="fles flex-col space-y-4">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#80808029] text-[11px] font-semibold">
                  2
                </div>
                <div className="flex w-[548px] flex-col gap-4">
                  <p className="text-sm text-[#5C5C5C]">
                    If the number of problems solved is the same,
                    <br />
                    the ranking is determined in ascending order of penalty
                    <span className="font-semibold"> solved.</span>
                  </p>
                  <div className="flex flex-col gap-2 rounded-md border border-[#80808040] bg-[#80808014] px-[22px] py-[14px]">
                    <h2 className="text-sm font-bold">Penalty Calculation</h2>
                    <p className="text-sm text-neutral-500">
                      Time from the start of the contest to Accepted (min.)
                      <br />+ (Number of submissions - 1) * 20
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* + */}
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#80808029] text-[11px] font-semibold">
                +
              </div>
              <p className="text-sm text-[#5C5C5C]">
                If the number of problems solved and the penalty are the same,
                <br />
                they are considered to have the same rank.
              </p>
            </div>
          </div>
          <hr className="my-4" />

          <div className="flex flex-col gap-4">
            <h1 className="mb-2 text-lg font-medium">
              Introduction to Leaderboard
            </h1>

            <div className="flex flex-col space-y-2">
              {/* Accepted */}
              <div className="flex items-center gap-4">
                <div className="flex h-[60px] w-14 flex-col items-center justify-center">
                  <p className="font-bold">76</p>
                  <p className="text-xs text-neutral-500">2 sub</p>
                </div>
                <SlArrowRight color="#80808040" className="ml-3 h-3 w-3" />
                <div className="flex flex-col pl-2">
                  <p className="text-xs font-semibold text-[#474747]">
                    Accepted
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    (Penalty per problem / The number of submission)
                  </p>
                </div>
              </div>

              {/* Unrevealed */}
              <div className="flex items-center gap-4">
                <div className="flex h-[60px] w-14 flex-col items-center justify-center rounded-lg bg-[#E9EEF0]">
                  <p className="font-bold">?</p>
                  <p className="text-xs">frozen</p>
                </div>
                <SlArrowRight color="#80808040" className="ml-3 h-3 w-3" />
                <div className="flex flex-col pl-2">
                  <p className="text-xs font-semibold text-[#474747]">
                    Unrevealed
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Penalty and submission counts are revealed after freezing
                    time.
                  </p>
                </div>
              </div>

              {/* Unsolved */}
              <div className="flex items-center gap-4">
                <div className="flex h-[60px] w-14 flex-col items-center justify-center text-[#FF3B2F]">
                  <p className="font-bold">-</p>
                  <p className="text-xs">5 sub</p>
                </div>
                <SlArrowRight color="#80808040" className="ml-3 h-3 w-3" />
                <div className="flex flex-col pl-2">
                  <p className="text-xs font-semibold text-[#474747]">
                    Unsolved
                  </p>
                </div>
              </div>

              {/* First Solver */}
              <div className="flex items-center gap-4">
                <div className="flex h-[60px] w-14 flex-col items-center justify-center text-[#3581FA]">
                  <p className="font-bold">45</p>
                  <p className="text-xs">4 sub</p>
                </div>
                <SlArrowRight color="#80808040" className="ml-3 h-3 w-3" />
                <div className="flex flex-col pl-2">
                  <p className="text-xs font-semibold text-[#474747]">
                    First Solver
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
