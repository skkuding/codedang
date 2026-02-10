'use client'

import { CodeEditor } from '@/components/CodeEditor'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { Separator } from '@/components/shadcn/separator'
import { GET_CHECK_RESULT_DETAILS } from '@/graphql/check/queries'
import { GET_SUBMISSION } from '@/graphql/submission/queries'
import { useQuery } from '@apollo/client'
import { IoArrowBack } from 'react-icons/io5'
import type { PlagiarismResult } from './PlagiarismResultTableColumns'

interface PlagiarismCodeComparisonViewProps {
  result: PlagiarismResult
  onBack?: () => void
  active?: boolean
}

export function PlagiarismCodeComparisonView({
  result,
  onBack,
  active = true
}: PlagiarismCodeComparisonViewProps) {
  const { data: detailData } = useQuery(GET_CHECK_RESULT_DETAILS, {
    variables: { resultId: result.id },
    skip: !active,
    errorPolicy: 'all'
  })

  const firstSubmission = useQuery(GET_SUBMISSION, {
    variables: { id: result.firstCheckSubmissionId },
    skip: !active,
    errorPolicy: 'all'
  })

  const secondSubmission = useQuery(GET_SUBMISSION, {
    variables: { id: result.secondCheckSubmissionId },
    skip: !active,
    errorPolicy: 'all'
  })

  const firstData = firstSubmission.data?.getSubmission
  const secondData = secondSubmission.data?.getSubmission
  const firstLoading = firstSubmission.loading
  const secondLoading = secondSubmission.loading
  const firstError = firstSubmission.error
  const secondError = secondSubmission.error

  type Match = {
    startInFirst: { line: number }
    endInFirst: { line: number }
    startInSecond: { line: number }
    endInSecond: { line: number }
  }

  const matches = (detailData?.getCheckResultDetails?.matches ?? []) as Match[]

  const firstHighlightRanges: { line: number; className: string }[] = []
  matches.forEach((m, index) => {
    const colorIndex = index % 10
    const className = `cm-highlighted-pair-${colorIndex}`
    for (let i = m.startInFirst.line; i <= m.endInFirst.line; i += 1) {
      firstHighlightRanges.push({ line: i, className })
    }
  })

  const secondHighlightRanges: { line: number; className: string }[] = []
  matches.forEach((m, index) => {
    const colorIndex = index % 10
    const className = `cm-highlighted-pair-${colorIndex}`
    for (let i = m.startInSecond.line; i <= m.endInSecond.line; i += 1) {
      secondHighlightRanges.push({ line: i, className })
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      {onBack && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit gap-1"
          onClick={onBack}
        >
          <IoArrowBack className="h-4 w-4" />
          Back to list
        </Button>
      )}

      <div className="grid grid-cols-4 gap-4 rounded-lg bg-gray-50 p-4">
        <div>
          <div className="text-sm text-gray-600">Average similarity</div>
          <div className="text-lg font-semibold">
            {(result.averageSimilarity * 100).toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Max similarity</div>
          <div className="text-lg font-semibold">
            {(result.maxSimilarity * 100).toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">First similarity</div>
          <div className="text-lg font-semibold">
            {(result.firstSimilarity * 100).toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Second similarity</div>
          <div className="text-lg font-semibold">
            {(result.secondSimilarity * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-sm font-semibold text-blue-900">
            Submission #{result.firstCheckSubmissionId}
          </div>
          {firstData && (
            <div className="mt-1 text-xs text-blue-700">
              User: {firstData.user?.username ?? 'N/A'} | Student ID:{' '}
              {firstData.user?.studentId ?? '-'} | Result: {firstData.result}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <div className="text-sm font-semibold text-green-900">
            Submission #{result.secondCheckSubmissionId}
          </div>
          {secondData && (
            <div className="mt-1 text-xs text-green-700">
              User: {secondData.user?.username ?? 'N/A'} | Student ID:{' '}
              {secondData.user?.studentId ?? '-'} | Result: {secondData.result}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="pr-4">
            <div className="mb-2 text-sm font-semibold text-blue-900">
              Submission #{result.firstCheckSubmissionId}
            </div>
            {firstLoading && (
              <div className="p-4 text-gray-500">Loading...</div>
            )}
            {!firstLoading && firstError && (
              <div className="p-4 text-red-500">
                Error: {firstError.message}
              </div>
            )}
            {!firstLoading && !firstError && firstData?.code && (
              <CodeEditor
                value={firstData.code}
                language={firstData.language as 'Java' | 'Cpp' | 'Python3'}
                readOnly
                className="min-h-[400px]"
                multiHighlightRanges={firstHighlightRanges}
              />
            )}
            {!firstLoading && !firstError && !firstData?.code && (
              <div className="p-4 text-gray-500">Failed to load code.</div>
            )}
          </div>
        </ScrollArea>

        <ScrollArea className="h-full">
          <div className="pr-4">
            <div className="mb-2 text-sm font-semibold text-green-900">
              Submission #{result.secondCheckSubmissionId}
            </div>
            {secondLoading && (
              <div className="p-4 text-gray-500">Loading...</div>
            )}
            {!secondLoading && secondError && (
              <div className="p-4 text-red-500">
                Error: {secondError.message}
              </div>
            )}
            {!secondLoading && !secondError && secondData?.code && (
              <CodeEditor
                value={secondData.code}
                language={secondData.language as 'Java' | 'Cpp' | 'Python3'}
                readOnly
                className="min-h-[400px]"
                multiHighlightRanges={secondHighlightRanges}
              />
            )}
            {!secondLoading && !secondError && !secondData?.code && (
              <div className="p-4 text-gray-500">Failed to load code.</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
