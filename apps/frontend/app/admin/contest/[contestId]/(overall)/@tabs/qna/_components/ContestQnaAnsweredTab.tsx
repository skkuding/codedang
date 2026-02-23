import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'

interface ContestQnaAnsweredTabProps {
  clickUnanswered: boolean
  setClickUnanswered: (value: boolean) => void
}

export function ContestQnaAnsweredTab({
  clickUnanswered,
  setClickUnanswered
}: ContestQnaAnsweredTabProps) {
  const { t } = useTranslate()
  const tabClass =
    'flex h-9 w-48 cursor-pointer items-center justify-center rounded-full text-base font-normal tracking-[-0.03em]'
  const activeClass = 'bg-primary text-white'
  const inactiveClass = 'text-[#808080]'

  return (
    <div className="outline-line flex h-[46px] w-[390px] rounded-full p-[5px] outline">
      <div
        className={cn(tabClass, !clickUnanswered ? activeClass : inactiveClass)}
        onClick={() => setClickUnanswered(false)}
      >
        {t('all_question')}
      </div>
      <div
        className={cn(tabClass, clickUnanswered ? activeClass : inactiveClass)}
        onClick={() => setClickUnanswered(true)}
      >
        {t('unanswered_question')}
      </div>
    </div>
  )
}
