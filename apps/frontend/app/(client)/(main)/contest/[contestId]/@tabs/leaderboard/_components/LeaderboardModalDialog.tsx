import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from '@/components/shadcn/dialog'
import infoIcon from '@/public/icons/file-info-gray.svg'
import { useTranslate } from '@tolgee/react'
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
  const { t } = useTranslate()

  return (
    <div className="flex">
      <Dialog>
        <DialogTrigger asChild>
          <Image
            src={infoIcon}
            alt={t('info_icon_alt')}
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
            {t('ranking_system_contest_dialog_title')}
          </DialogTitle>
          <div className="flex flex-col overflow-x-auto">
            <p className="mb-8 h-[34px] w-[500px] text-[24px] font-bold text-black">
              {t('ranking_system_contest_header')}
            </p>
            <div className="mb-7 flex text-[#5C5C5C]">
              <ModalNumberComponent index={1} />
              <div className="ml-3 flex flex-col">
                <p className="text-base">{t('ranking_determination_rule_1')}</p>
                <p className="text-base">{t('ranking_determination_rule_2')}</p>
              </div>
            </div>
            <div className="flex text-[#5C5C5C]">
              <ModalNumberComponent index={2} />
              <div className="ml-4 flex flex-col space-y-4">
                <div>
                  <p className="text-base">{t('same_problems_solved_rule')}</p>
                  <p className="text-base">{t('penalty_order_rule')}</p>
                </div>
                <div className="flex h-[104px] w-[562px] flex-col gap-3 rounded-[10px] bg-[#80808014] py-[18px] pl-6 pr-[69px] text-[#737373]">
                  <p className="h-4 text-[14px] text-black">
                    <b>{t('penalty_calculation_header')}</b>
                  </p>
                  <div className="h-12">
                    <p className="mb-1 text-[14px]">
                      {t('penalty_time_calculation')}
                    </p>
                    <p className="text-[14px]">
                      {t('penalty_submission_formula')}
                    </p>
                  </div>
                </div>
                <div className="mt-7 flex h-[72px] w-[560px] flex-col justify-center rounded-[10px] border border-[#3581FA] px-5 text-[#3581FA]">
                  <p className="tracking-[-0.48px]">{t('same_penalty_rule')}</p>
                  <p className="tracking-[-0.48px]">
                    {t('earliest_submission_rule')}
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-[76px]">
              <p className="text-2xl font-bold">
                {t('introduction_leaderboard_header')}
              </p>
            </div>
            <div className="space-y-4 pl-[11px] pt-[29px]">
              <LeaderboardScoreExplanationRow
                isTalkBalloon={false}
                title={t('nnn_title')}
                explanationTitle={t('accepted_explanation_title')}
                explanationDetail={t('accepted_explanation_detail')}
              />
              <LeaderboardScoreExplanationRow
                isTalkBalloon={false}
                title={t('frozen_title')}
                textColor="#C4C4C4"
                explanationTitle={t('unrevealed_explanation_title')}
                explanationDetail={t('unrevealed_explanation_detail')}
              />
              <LeaderboardScoreExplanationRow
                isTalkBalloon={false}
                title={t('dash_title')}
                explanationTitle={t('unsolved_explanation_title')}
              />
              <LeaderboardScoreExplanationRow
                isTalkBalloon={false}
                title={t('nnn_title')}
                textColor="#3581FA"
                explanationTitle={t('first_solver_explanation_title')}
                explanationDetail={t('first_solver_explanation_detail')}
              />
              <LeaderboardScoreExplanationRow
                isTalkBalloon={true}
                title={t('3_sub_title')}
                explanationTitle={t('submission_explanation_title')}
                explanationDetail={t('submission_explanation_detail')}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
