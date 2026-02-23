import { ContestOverviewLayout } from '@/app/(client)/(main)/contest/[contestId]/@tabs/_components/ContestOverviewLayout'
import { Button } from '@/components/shadcn/button'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { ContestPreview } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import Link from 'next/link'

interface OverviewLayoutProps {
  contest: ContestPreview
  exitPreview: () => void
}
export function PreviewOverviewLayout({
  contest,
  exitPreview
}: OverviewLayoutProps) {
  const { t } = useTranslate()
  return (
    <div className="flex w-full flex-col">
      <header className="flex h-20 items-center justify-between border-b-2 px-6">
        <div className="flex items-center justify-center gap-4 text-lg">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1 font-medium">
            {contest.title} {t('preview_text')}
          </div>
        </div>
        <Button
          onClick={exitPreview}
          variant="destructive"
          className="h-8 rounded-md"
        >
          {t('exit_preview_button')}
        </Button>
      </header>

      <ContestOverviewLayout contest={contest} isPreview={true} />
    </div>
  )
}
