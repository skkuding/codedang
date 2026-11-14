import { Separator } from '@/components/shadcn/separator'
import type { ReactNode } from 'react'
import type { TestcaseTarget } from '../_libs/types'
import { SectionCard } from './SectionCard'

interface GenerationResultCardProps {
  target: TestcaseTarget
  preview: string
  actions: ReactNode
  children?: ReactNode
}

export function GenerationResultCard({
  target,
  preview,
  actions,
  children
}: GenerationResultCardProps) {
  return (
    <SectionCard
      title={`${target} 생성 결과 미리보기`}
      description={`생성된 ${target} 테스트케이스 확인 / 생성한 테스트케이스 파일을 삭제 및 다운로드`}
      actions={actions}
    >
      <div className="bg-editor-background-1 rounded-[8px] py-5 pl-6 pr-3 font-mono text-sm text-white">
        <p>{target} TC Preview</p>
        <Separator className="bg-editor-line-1 my-3 w-1/3" />
        <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
          {preview}
        </pre>
      </div>
      {children}
    </SectionCard>
  )
}
