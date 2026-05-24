'use client'

import { Button } from '@/components/shadcn/button'
import { cn, dateFormatter } from '@/libs/utils'
import CheckCircle from '@/public/icons/check-circle.svg'

export type StateType = 'SUCCESS' | 'FAIL' | 'NONE'

export interface GeneratedResult {
  state: StateType
  date?: Date
  totalCnt: number
  successCnt: number
}

interface ExecutionCardProps {
  disabled?: boolean
  loading: boolean
  onGenerate: () => void
  canDownload?: boolean
  onDownload?: () => void
  genResult: GeneratedResult
}

export function ExecutionCard({
  disabled = false,
  loading,
  onGenerate,
  canDownload = false,
  onDownload,
  genResult
}: ExecutionCardProps) {
  return (
    <div className="border-color-cool-neutral-90 bg-color-common-100 grid gap-7 rounded-2xl border px-6 py-7">
      <div className="flex justify-between">
        <div className="grid gap-1">
          <h3 className="text-head5_sb_24 text-color-common-0">
            자동 생성 실행하기
          </h3>
          <span className="text-color-cool-neutral-40 text-body2_m_14">
            업로드한 파일을 이용해서 생성을 시도합니다
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onGenerate}
            disabled={disabled}
            className="ring-primary-light text-sub4_sb_14 text-primary hover:bg-color-blue-95 rounded-lg bg-white px-3 py-[10px] ring-[1.4px] disabled:ring-0"
          >
            자동 생성하기
          </Button>
          {canDownload && (
            <Button
              type="button"
              onClick={onDownload}
              disabled={disabled}
              className="text-sub4_sb_14 rounded-lg px-3 py-[10px] ring-[1.4px] disabled:ring-0"
            >
              세부 내용 다운로드
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        <StateSkeleton />
      ) : (
        <div
          className={cn(
            'border flex items-start gap-2 rounded-xl p-4',
            {
              SUCCESS: 'border-primary-light bg-color-blue-95',
              FAIL: 'border-error bg-color-red-95',
              NONE: 'border-line bg-color-neutral-99'
            }[genResult.state]
          )}
        >
          <CheckCircle
            className={cn(
              'mt-[1px] h-5',
              {
                SUCCESS: 'text-primary',
                FAIL: 'text-error',
                NONE: 'text-color-neutral-50'
              }[genResult.state]
            )}
          />
          <div
            className={cn(
              {
                SUCCESS: 'text-primary-strong',
                FAIL: 'text-error',
                NONE: 'text-color-neutral-30'
              }[genResult.state]
            )}
          >
            <span className="text-sub3_sb_16">
              {
                {
                  SUCCESS: '아웃풋 생성 성공',
                  FAIL: '아웃풋 생성 실패',
                  NONE: '파일 업로드 이후 실행 필요'
                }[genResult.state]
              }
            </span>
            <div
              className={cn('text-caption1_m_13 flex', {
                'text-primary': genResult.state === 'SUCCESS',
                'text-error': genResult.state === 'FAIL'
              })}
            >
              {genResult.state !== 'NONE' ? (
                <>
                  {genResult.date && (
                    <span>{dateFormatter(genResult.date, 'YYYY-MM-DD')}</span>
                  )}
                  <div className="grid h-5 w-5 place-items-center">
                    <div
                      className={cn(
                        'h-1 w-1 rounded-full',
                        genResult.state === 'SUCCESS'
                          ? 'bg-primary'
                          : 'bg-error'
                      )}
                    />
                  </div>
                  <span>
                    {genResult.successCnt}/{genResult.totalCnt} 솔루션 테스트
                    통과
                    {genResult.state === 'SUCCESS' ? ' 완료' : ' 실패'}
                  </span>
                </>
              ) : (
                <>
                  <span>-</span>
                  <div className="grid h-5 w-5 place-items-center">
                    <div className="bg-color-neutral-30 h-1 w-1 rounded-full" />
                  </div>
                  <span>-</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StateSkeleton() {
  return (
    <div className="border-line bg-color-neutral-99 border-1 flex animate-pulse items-start gap-2 rounded-xl p-4">
      <div className="bg-color-neutral-90 mt-[2px] h-5 w-5 rounded-full" />
      <div className="flex flex-col gap-2">
        <div className="bg-color-neutral-90 h-5 w-32 rounded-md" />
        <div className="bg-color-neutral-90 h-4 w-48 rounded-md" />
      </div>
    </div>
  )
}
