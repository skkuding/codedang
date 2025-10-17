'use client'

import { cn } from '@/libs/utils'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Suspense } from 'react'
import { ParticipantTableByProblem } from './_components/ParticipantTableByProblem'
import { ParticipantTableOverall } from './_components/ParticipantTableOverall'

export default function Assessment() {
  const { courseId, assignmentId } = useParams() // 경로에서 params 가져오기
  const [tab, setTab] = useState<'overall' | 'by-problem'>('overall')

  return (
    <div>
      <div className="mb-4 flex justify-start">
        <div className="flex gap-1 rounded-full bg-gray-200 p-1">
          <button
            className={cn(
              'rounded-full px-4 py-1 font-semibold transition-colors',
              tab === 'overall'
                ? 'text-primary bg-white'
                : 'bg-transparent text-gray-700'
            )}
            onClick={() => setTab('overall')}
          >
            Overall
          </button>
          <button
            className={cn(
              'rounded-full px-4 py-1 font-semibold transition-colors',
              tab === 'by-problem'
                ? 'text-primary bg-white'
                : 'bg-transparent text-gray-700'
            )}
            onClick={() => setTab('by-problem')}
          >
            By Problem
          </button>
        </div>
      </div>

      {tab === 'overall' ? (
        <Suspense fallback={<div>Loading Overall...</div>}>
          <ParticipantTableOverall
            groupId={Number(courseId)}
            assignmentId={Number(assignmentId)}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div>Loading By Problem...</div>}>
          <ParticipantTableByProblem
            courseId={Number(courseId)}
            assignmentId={Number(assignmentId)}
          />
        </Suspense>
      )}
    </div>
  )
}
