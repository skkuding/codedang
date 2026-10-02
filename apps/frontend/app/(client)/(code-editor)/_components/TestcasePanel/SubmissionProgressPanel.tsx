'use client'

import { Progress } from '@/components/shadcn/progress'
import {
  getProgressValue,
  getSubmissionResultLabel,
  type SubmissionProgress
} from '../../_libs/submissionProgress'

const assetPath = '/images/submission-progress'

export function SubmissionProgressPanel({
  progress
}: {
  progress: SubmissionProgress
}) {
  if (progress.stage === 'waiting' || progress.stage === 'compiling') {
    const compiling = progress.stage === 'compiling'
    return (
      <div
        className="flex min-h-[292px] flex-col items-center pt-[102px]"
        role="status"
      >
        {compiling ? (
          <div
            className="relative mt-[5px] size-9 -translate-x-1 motion-safe:animate-spin"
            aria-hidden
          >
            <img
              src={`${assetPath}/compiling.png`}
              width={36}
              height={36}
              alt=""
            />
            <img
              className="absolute bottom-0 left-[15px]"
              src={`${assetPath}/compiling-dot.svg`}
              width={6}
              height={6}
              alt=""
            />
          </div>
        ) : (
          <img
            className="-translate-x-1 motion-safe:animate-pulse"
            src={`${assetPath}/waiting.svg`}
            width={64}
            height={64}
            alt=""
          />
        )}
        <p
          className={`text-body1_m_16 text-color-neutral-80 ${compiling ? 'mt-4' : '-mt-[9px]'}`}
        >
          {compiling ? '컴파일 중...' : '채점 대기 중...'}
        </p>
      </div>
    )
  }

  if (progress.stage === 'grading') {
    const value = getProgressValue(progress.completed, progress.total)
    return (
      <div
        className="flex min-h-[292px] flex-col items-center px-6 pt-24"
        role="status"
      >
        <p className="text-head5_sb_24 text-color-neutral-95 flex items-center gap-1.5 leading-[1.3] tracking-[-0.72px]">
          채점 중 <span className="text-primary">{Math.round(value)}%</span>
        </p>
        <p className="text-body3_r_16 text-color-neutral-90 mt-0.5 tracking-[-0.48px]">
          ({progress.completed} / {progress.total} Test cases)
        </p>
        <Progress
          value={value}
          aria-label="채점 진행률"
          className="[&>div]:bg-primary mt-5 h-1.5 w-full max-w-[560px] bg-[#D9D9D9] dark:bg-[#D9D9D9] [&>div]:duration-300 [&>div]:motion-reduce:transition-none"
        />
      </div>
    )
  }

  if (progress.stage === 'error') {
    return (
      <div
        className="text-body1_m_16 text-color-neutral-80 flex min-h-[292px] items-center justify-center px-6 text-center"
        role="alert"
      >
        {progress.message ??
          '채점 상태를 확인하지 못했습니다. 잠시 후 다시 제출해 주세요.'}
      </div>
    )
  }

  const accepted = progress.result === 'Accepted'
  const hidden = progress.result === 'Blind'
  const runtime =
    progress.runtime === undefined ? '-' : `${progress.runtime} ms`
  const memory =
    progress.memoryUsage === undefined
      ? '-'
      : `${(progress.memoryUsage / 1024 / 1024).toFixed(1)} MB`
  const failedCase =
    progress.failedCase === undefined
      ? '-'
      : `${progress.failedCase} / ${progress.total}`

  return (
    <div
      className="flex min-h-[292px] flex-col items-center px-6 pb-8 pt-14"
      role="status"
    >
      {!hidden && (
        <img
          src={`${assetPath}/${accepted ? 'accepted' : 'wrong-answer'}.svg`}
          width={48}
          height={48}
          alt=""
        />
      )}
      <p className="text-head5_sb_24 text-color-neutral-95 mt-4 text-center leading-[1.3] tracking-[-0.72px]">
        {getSubmissionResultLabel(progress.result)}
      </p>
      {!hidden && (
        <div className="mt-7 flex max-w-full items-center gap-6 text-center sm:gap-[52px]">
          <ResultMetric
            label={accepted ? '실행시간' : '실패 케이스'}
            value={accepted ? runtime : failedCase}
          />
          <div className="relative h-20 w-0.5 shrink-0" aria-hidden>
            <img
              className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90"
              src={`${assetPath}/divider.svg`}
              width={80}
              height={2}
              alt=""
            />
          </div>
          <ResultMetric
            label={accepted ? '메모리' : '실행시간'}
            value={accepted ? memory : runtime}
          />
        </div>
      )}
    </div>
  )
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <p className="text-body1_m_16 text-color-neutral-80 whitespace-nowrap">
        {label}
      </p>
      <p className="text-title2_m_20 text-color-neutral-95 break-words">
        {value}
      </p>
    </div>
  )
}
