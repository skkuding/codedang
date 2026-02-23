import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from '@/components/shadcn/dialog'
import InfoIcon from '@/public/icons/info-icon.svg'
import { T, useTranslate } from '@tolgee/react'
import Image from 'next/image'

export function LeaderboardModalDialog() {
  const { t } = useTranslate()

  return (
    <div className="flex">
      <Dialog>
        <DialogTrigger asChild>
          <Image
            className="cursor-pointer"
            src={InfoIcon}
            alt={t('info_icon_alt')}
            width={24}
          />
        </DialogTrigger>
        <DialogContent
          showDarkOverlay={true}
          className="h-[450px] w-[700px] max-w-none gap-0 space-y-0 rounded-[16px] border-none bg-slate-900 pb-12 pl-10 pt-10 text-gray-300 [&>button:last-child]:hidden"
        >
          <DialogTitle className="sr-only">
            {t('ranking_system_of_contest_title')}
          </DialogTitle>
          <div className="flex flex-col gap-6 overflow-x-auto">
            <p className="h-[26px] w-[226px] text-[18px] font-semibold text-white">
              {t('ranking_system_of_contest_title')}
            </p>
            <div className="flex text-gray-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                1
              </div>
              <div className="ml-3 flex flex-col">
                <T
                  keyName="ranking_determined_rule"
                  defaultValue="<p>The ranking of each participant is determined</p><p>based on <bold>the number of problems solved.</bold></p>"
                  params={{
                    p: <p className="text-[14px]" />,
                    bold: <b />
                  }}
                />
              </div>
            </div>
            <div className="flex text-gray-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-white">
                2
              </div>
              <div className="ml-4 flex flex-col space-y-4">
                <div>
                  <p className="text-[14px]">
                    {t('same_number_of_problems_solved')}
                  </p>
                  <p className="text-[14px]">
                    <T
                      keyName="ranking_determined_order_penalty"
                      defaultValue="The ranking is determined in ascending order of <b>penalty.</b>"
                      params={{
                        bold: <b />
                      }}
                    />
                  </p>
                </div>
                <div className="flex h-[104px] w-[548px] flex-col gap-2 rounded-md bg-gray-800 py-[14px] pl-[22px] pr-[69px]">
                  <p className="h-4 text-[14px] text-white">
                    <b>{t('penalty_calculation_title')}</b>
                  </p>
                  <div className="h-12">
                    <p className="mb-1 text-[14px]">
                      {t('penalty_time_calculation')}
                    </p>
                    <p className="text-[14px]">
                      {t('penalty_submission_calculation')}
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
                <p className="text-[14px]">{t('same_problems_penalty')}</p>
                <p className="text-[14px]">
                  {t('ranking_earliest_submission_time')}
                </p>
                <T
                  keyName="ranking_determined_submission_time"
                  defaultValue="<p>If the number of problems solved and the penalty are the same,</p>
                  <p>ranking is determined by the earliest time of submission of the last accepted.</p>"
                  params={{
                    p: <p className="text-[14px]" />
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
