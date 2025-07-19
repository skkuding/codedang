import { Button } from '@/components/shadcn/button'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { ContestPreview } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
import { PreviewOverviewPanel } from './PreviewOverviewPanel'

interface OverviewLayoutProps {
  contest: ContestPreview
  exitPreview: () => void
}
export function PreviewOverviewLayout({
  contest,
  exitPreview
}: OverviewLayoutProps) {
  return (
    <div className="flex w-full flex-col">
      <header className="flex h-20 items-center justify-between border-b-2 px-6">
        <div className="flex items-center justify-center gap-4 text-lg">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1 font-medium">
            {contest.title} Preview
          </div>
        </div>
        <Button
          onClick={exitPreview}
          variant="destructive"
          className="h-8 rounded-md"
        >
          Exit Preview
        </Button>
      </header>

      <PreviewOverviewPanel contest={contest} />
    </div>
  )
}
