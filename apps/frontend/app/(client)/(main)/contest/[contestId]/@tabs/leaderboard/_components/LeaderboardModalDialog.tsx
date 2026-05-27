import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from '@/components/shadcn/dialog'
import infoIcon from '@/public/icons/file-info-gray.svg'
import Image from 'next/image'

interface LeaderboardScoreExplanationRowProps {
  isTalkBalloon: boolean
  title: string
  textColor?: string
  explanationTitle: string
  explanationDetail?: string
}

function LeaderboardScoreExplanationRow({
  isTalkBalloon,
  title,
  textColor = '#000000',
  explanationTitle,
  explanationDetail
}: LeaderboardScoreExplanationRowProps) {
  return (
    <div className="flex flex-row space-x-6">
      {isTalkBalloon ? (
        <div className="flex flex-col items-center justify-center">
          <div className="relative mt-[9px] flex h-[33px] w-[70px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-base font-semibold text-white">
            {title}
            <div className="absolute -bottom-[8px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[7px] border-r-[6px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#3581FA]" />
          </div>
        </div>
      ) : (
        <p
          className="mt-[9px] flex h-[50px] w-[70px] flex-row items-center justify-center rounded-[10px] bg-[#FAFAFA] text-xl font-semibold"
          style={{ color: textColor }}
        >
          {title}
        </p>
      )}
      <div className="flex h-[68px] w-[491px] flex-col justify-center rounded-[10px] bg-[#FAFAFA] pl-6">
        <p className="h-[22px] w-[100px] font-semibold text-[#474747]">
          {explanationTitle}
        </p>
        {explanationDetail && (
          <p className="text-sm text-[#737373]">{explanationDetail}</p>
        )}
      </div>
    </div>
  )
}

interface ModalNumberComponentProps {
  index: number
}

function ModalNumberComponent({ index }: ModalNumberComponentProps) {
  return (
    <div className="flex h-[22px] w-[22px] flex-col items-center justify-center rounded-full bg-[#3581FA] text-[11px] text-white">
      {index}
    </div>
  )
}

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
          <div className="flex flex-col overflow-x-auto">
            <p className="mb-8 h-[34px] w-[500px] text-[24px] font-bold text-black">
              Ranking System of Contest
            </p>
            <div className="mb-7 flex text-[#5C5C5C]">
              <ModalNumberComponent index={1} />
              <div className="ml-3 flex flex-col">
                <p className="text-base">
                  The ranking of each participant is determined
                </p>
                <p className="text-base">
                  based on the number of problems solved.
                </p>
              </div>
            </div>
            <div className="flex text-[#5C5C5C]">
              <ModalNumberComponent index={2} />
              <div className="ml-4 flex flex-col space-y-4">
                <div>
                  <p className="text-base">
                    If the number of problems solved is the same,
                  </p>
                  <p className="text-base">
                    the ranking is determined in ascending order of penalty.
                  </p>
                </div>
                <div className="flex h-[104px] w-[562px] flex-col gap-3 rounded-[10px] bg-[#80808014] py-[18px] pl-6 pr-[69px] text-[#737373]">
                  <p className="h-4 text-[14px] text-black">
                    <b>Penalty Calculation</b>
                  </p>
                  <div className="h-12">
                    <p className="mb-1 text-[14px]">
                      Time from the start of the contest to Accepted (min.)
                    </p>
                    <p className="text-[14px]">
                      + (Number of submissions - 1) * 20
                    </p>
                  </div>
                </div>
                <div className="mt-7 flex h-[72px] w-[560px] flex-col justify-center rounded-[10px] border border-[#3581FA] px-5 text-[#3581FA]">
                  <p className="tracking-[-0.48px]">
                    If the number of problems solved and the penalty are the
                    same,
                  </p>
                  <p className="tracking-[-0.48px]">
                    ranking is determined by the earliest time of submission of
                    the last accepted.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-[76px]">
              <p className="text-2xl font-bold">Introduction to Leaderboard</p>
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
