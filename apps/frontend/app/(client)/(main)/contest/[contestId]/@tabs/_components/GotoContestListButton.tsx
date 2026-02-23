import { Button } from '@/components/shadcn/button'
import { useTranslate } from '@tolgee/react'
import Link from 'next/link'

export function GotoContestListButton() {
  const { t } = useTranslate()
  return (
    <div className="mb-30 flex w-[1208px] justify-end">
      <Link href={`/contest`}>
        <Button className="border-line mb-0 mt-5 h-[46px] w-[154px] rounded-[1000px] border bg-white text-black">
          <p className="text-center text-base font-medium leading-[22.4px] tracking-[-0.48px]">
            {t('back_to_the_list')}
          </p>
        </Button>
      </Link>
    </div>
  )
}
