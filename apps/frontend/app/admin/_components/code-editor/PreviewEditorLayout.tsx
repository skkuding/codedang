import { Button } from '@/components/shadcn/button'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { ProblemDetail } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
import { PreviewEditorResizablePanel } from './PreviewEditorResizablePanel'

interface EditorLayoutProps {
  problem: ProblemDetail
  exitPreview: () => void
}

export function PreviewEditorLayout({
  problem,
  exitPreview
}: EditorLayoutProps) {
  return (
    // Admin Layout의 Sidebar를 무시하기 위한 fixed
    <div className="grid-rows-editor fixed left-0 grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      <header className="flex h-12 items-center justify-between bg-slate-900 px-6">
        <div className="flex items-center justify-center gap-4 text-lg text-white">
          <Link href="/">
            <Image src={codedangLogo} alt="코드당" width={33} />
          </Link>
          <div className="flex items-center gap-1 font-medium">
            {problem.title}
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
      <PreviewEditorResizablePanel problem={problem} />
    </div>
  )
}
