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
import { LeaderboardScoreExplanationRow } from './LeaderboardScoreExplanationRow'
import { ModalNumberComponent } from './ModalNumberComponent'

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
          className="h-[730px] w-[700px] max-w-none gap-0 space-y-0 rounded-[16px] border-none bg-[#FFFFFF] pb-12 pl-10 pt-10 [&>button:last-child]:hidden"
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
              <ModalNumberComponent index={1} />
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
              <ModalNumberComponent index={2} />
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
              <LeaderboardScoreExplanationRow
                isTalkBalloon={false}
                title={'NNN'}
                explanationTitle={'Accepted'}
                explanationDetail={'Penalty for accepted problems.'}
              />
              <LeaderboardScoreExplanationRow
                isTalkBalloon={false}
                title={'Frozen'}
                textColor={'#C4C4C4'}
                explanationTitle={'Unrevealed'}
                explanationDetail={
                  'Penalty and submission counts are revealed after freezing time.'
                }
              />
              <LeaderboardScoreExplanationRow
                isTalkBalloon={false}
                title={'-'}
                explanationTitle={'Unsolved'}
              />
              <LeaderboardScoreExplanationRow
                isTalkBalloon={false}
                title={'NNN'}
                textColor={'#3581FA'}
                explanationTitle={'First Solver'}
                explanationDetail={'The first person to solve the problem'}
              />
              <LeaderboardScoreExplanationRow
                isTalkBalloon={true}
                title={'3 sub'}
                explanationTitle={'Submission'}
                explanationDetail={
                  'The number of submissions displayed when hovering over ‘Accepted’'
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
