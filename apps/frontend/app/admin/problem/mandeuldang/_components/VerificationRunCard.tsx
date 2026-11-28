import { Button } from '@/components/shadcn/button'
import { cn, dateFormatter } from '@/libs/utils'
import BulletIcon from '@/public/icons/bullet.svg'
import { CircleAlert, Loader2, Send } from 'lucide-react'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import type { VerificationResult } from '../_libs/mockVerificationApi'
import type { GenerationStatus } from '../_libs/types'
import { SectionCard } from './SectionCard'

interface VerificationRunCardProps {
  title: string
  description: string
  disabled: boolean
  onVerify: () => void
  status: GenerationStatus
  result: VerificationResult | null
  errorMessage: string | null
}

const DETAIL_TEXT = '자세한 내용은 파일을 다운로드하여 확인하세요'

export function VerificationRunCard({
  title,
  description,
  disabled,
  onVerify,
  status,
  result,
  errorMessage
}: VerificationRunCardProps) {
  const isPassed = status === 'Success' && result?.failedCount === 0
  const isRejected = status === 'Success' && result && result.failedCount > 0

  return (
    <SectionCard
      title={title}
      description={description}
      actions={
        <Button
          type="button"
          size="middle"
          className="text-sub3_sb_16 bg-primary-strong hover:bg-primary-heavy rounded-[10px]"
          disabled={disabled}
          onClick={onVerify}
        >
          <Send
            className={cn(
              'size-5',
              disabled ? 'text-color-cool-neutral-60' : 'text-white'
            )}
          />
          <span className="translate-y-px">검증 실행</span>
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
            {status === 'Pending' ? '검증 요청 중' : '검증 중'}
          </p>
        </div>
      )}
      {isPassed && result && (
        <div
          role="status"
          className="border-primary flex flex-col gap-1 rounded-[12px] border bg-[#EAF0FF] p-4"
        >
          <div className="flex items-center gap-2">
            <IoIosCheckmarkCircle size={20} className="text-primary" />
            <p className="text-sub1_sb_18 text-primary">테스트 통과</p>
          </div>
          <div className="text-caption1_m_13 text-color-blue-50 flex items-center pl-7">
            <p>{dateFormatter(result.verifiedAt, 'YYYY.MM.DD HH:mm')}</p>
            <BulletIcon className="size-5" />
            <p>{DETAIL_TEXT}</p>
          </div>
        </div>
      )}
      {(isRejected || status === 'Failed') && (
        <div
          role="alert"
          className="border-error flex flex-col gap-1 rounded-[12px] border bg-[#FFEBEB] p-4"
        >
          <div className="flex items-center gap-2">
            <CircleAlert size={20} className="text-error" />
            <p className="text-sub1_sb_18 text-error">
              {isRejected && result
                ? `${result.failedCount}개의 입력값이 조건을 벗어났습니다.`
                : '검증 실행 중 오류가 발생했습니다.'}
            </p>
          </div>
          {isRejected && result ? (
            <div className="text-caption1_m_13 text-flowkit-red flex items-center pl-7">
              <p>{dateFormatter(result.verifiedAt, 'YYYY.MM.DD HH:mm')}</p>
              <BulletIcon className="size-5" />
              <p>{DETAIL_TEXT}</p>
            </div>
          ) : (
            errorMessage && (
              <pre className="text-caption1_m_13 text-flowkit-red/70 pl-7">
                {errorMessage}
              </pre>
            )
          )}
        </div>
      )}
    </SectionCard>
  )
}
