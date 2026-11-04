import { Button } from '@/components/shadcn/button'
import { cn, dateFormatter } from '@/libs/utils'
import BulletIcon from '@/public/icons/bullet.svg'
import TrashcanIcon from '@/public/icons/trashcan2-gray.svg'
import { CircleAlert, Loader2 } from 'lucide-react'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import type {
  GeneratedTestcase,
  GenerationStatus,
  TestcaseTarget
} from '../_libs/types'
import { SectionCard } from './SectionCard'

interface GenerationRunCardProps {
  target: TestcaseTarget
  sourceName: string
  buttonText: string
  disabled: boolean
  onGenerate: () => void
  status: GenerationStatus
  generatedTestcase: GeneratedTestcase | null
  errorMessage: string | null
}

export function GenerationRunCard({
  target,
  sourceName,
  buttonText,
  disabled,
  onGenerate,
  status,
  generatedTestcase,
  errorMessage
}: GenerationRunCardProps) {
  return (
    <SectionCard
      title={`${target} 생성 실행`}
      description={`업로드 된 ${sourceName} 파일 토대로 ${target} 테스트케이스 생성을 실행합니다`}
      actions={
        <Button
          type="button"
          size="middle"
          className="text-sub3_sb_16 bg-primary-strong hover:bg-primary-heavy rounded-[10px]"
          disabled={disabled}
          onClick={onGenerate}
        >
          <TrashcanIcon
            className={cn(
              'size-5',
              disabled ? 'text-color-cool-neutral-60' : 'text-white'
            )}
          />
          <span className="translate-y-px">{buttonText}</span>
        </Button>
      }
    >
      {(status === 'Pending' || status === 'Running') && (
        <div
          role="status"
          className="border-color-cool-neutral-90 bg-color-neutral-99 flex items-center gap-2 rounded-lg border px-4 py-3"
        >
          <Loader2 size={20} className="text-primary animate-spin" />
          <p className="text-sub4_sb_14 text-color-cool-neutral-30">
            {target.toUpperCase()}{' '}
            {status === 'Pending' ? '생성 요청 중' : '생성 중'}
          </p>
        </div>
      )}
      {status === 'Success' && generatedTestcase && (
        <div
          role="status"
          className="border-primary flex flex-col gap-1 rounded-[12px] border bg-[#EAF0FF] p-4"
        >
          <div className="flex items-center gap-2">
            <IoIosCheckmarkCircle size={20} className="text-primary" />
            <p className="text-sub1_sb_18 text-primary">{target} 생성 성공</p>
          </div>
          <div className="text-caption1_m_13 text-color-blue-50 flex items-center pl-7">
            <p>
              {dateFormatter(generatedTestcase.generatedAt, 'YYYY.MM.DD HH:mm')}
            </p>
            <BulletIcon className="size-5" />
            <p>생성된 테스트 케이스 수 {generatedTestcase.testCaseCount}개</p>
          </div>
        </div>
      )}
      {status === 'Failed' && (
        <div
          role="alert"
          className="border-error flex flex-col gap-1 rounded-[12px] border bg-[#FFEBEB] p-4"
        >
          <div className="flex items-center gap-2">
            <CircleAlert size={20} className="text-error" />
            <p className="text-sub1_sb_18 text-error">{target} 생성 실패</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-caption1_m_13 text-flowkit-red">
              {sourceName} 실행 중 오류가 발생했습니다.
            </p>
            {errorMessage && (
              <pre className="text-caption1_m_13 text-flowkit-red/70 pl-7">
                {errorMessage}
              </pre>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  )
}
