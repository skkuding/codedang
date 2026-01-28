'use client'

import { fetcherWithAuth } from '@/libs/utils'
import { getDuration } from '@/libs/utils'
import { useSuspenseQueries } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useState, useMemo } from 'react'
import { LeaderBoardTable } from './_leaderboardcomponents/LeaderBoardTable'
import { NoSubmissionData } from './_leaderboardcomponents/NoSubmissionData'
import { TimeSlider } from './_leaderboardcomponents/TimeSlider'
import {
  calculateRankingHistory,
  calculateWeightedAccuracy,
  calculateProblemAccuracyRate
} from './_leaderboardcomponents/_libs/CalculateLeaderBoard'
import type {
  Submission,
  Leaderboard,
  ContestforStatistics,
  ContestProblemforStatistics
} from './_leaderboardcomponents/_libs/types/type'

export function RealtimeLearBoardPage() {
  const { contestId } = useParams<{ contestId: string }>()
  const results = useSuspenseQueries({
    queries: [
      {
        queryKey: ['contestMetadata', contestId],
        queryFn: () => {
          const res = fetcherWithAuth
            .get(`contest/${contestId}`)
            .json<ContestforStatistics>()
          if (!res) {
            throw new Error('Failed to fetch contest metadata')
          }
          return res
        }
      },
      {
        queryKey: ['contestSubmission', contestId],
        queryFn: () => {
          const res = fetcherWithAuth
            .get(`contest/${contestId}/statistics/submissions`)
            .json<Submission[]>()
          if (!res) {
            throw new Error('Failed to fetch contest submissions')
          }
          return res
        }
      },
      {
        queryKey: ['contestProblem', contestId],
        queryFn: () => {
          const res = fetcherWithAuth
            .get(`contest/${contestId}/problem`)
            .json<ContestProblemforStatistics>()
          if (!res) {
            throw new Error('Failed to fetch contest problems')
          }
          return res
        }
      },
      {
        queryKey: ['contestLeaderboard', contestId],
        queryFn: () => {
          const res = fetcherWithAuth
            .get(`contest/${contestId}/leaderboard`)
            .json<Leaderboard>()
          if (!res) {
            throw new Error('Failed to fetch contest leaderboard')
          }
          return res
        }
      }
    ]
  })
  const contestMetadata = results[0].data
  const submissions = results[1].data
  const contestProblems = results[2].data
  const leaderboard = results[3].data

  const contestStartTime = new Date(contestMetadata.startTime).getTime()
  const contestEndTime = new Date(contestMetadata.endTime).getTime()

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort(
      (a, b) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    )
  }, [])

  const leaderboardHistory = useMemo(() => {
    return calculateRankingHistory({
      sortedSubmissions,
      leaderboard,
      contestMetadata,
      contestProblems
    })
  }, [sortedSubmissions])
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState<
    number | null
  >(null)
  const currentData = useMemo(() => {
    if (currentSubmissionIndex === null) {
      const lastPoint = leaderboardHistory[leaderboardHistory.length - 1]
      return {
        users: lastPoint?.users || [],
        firstSolvers: lastPoint?.firstSolvers || {}
      }
    }

    const targetPoint = leaderboardHistory[currentSubmissionIndex]
    return {
      users: targetPoint?.users || [],
      firstSolvers: targetPoint?.firstSolvers || {}
    }
  }, [currentSubmissionIndex, leaderboardHistory])

  const currentSubmissionTime = useMemo(() => {
    if (currentSubmissionIndex === null) {
      return null
    }
    const submission = sortedSubmissions[currentSubmissionIndex]
    return submission ? new Date(submission.createTime).getTime() : null
  }, [currentSubmissionIndex, sortedSubmissions])

  const handleSliderChange = (index: number) => {
    setCurrentSubmissionIndex(index)
  }

  const handleReset = () => {
    setCurrentSubmissionIndex(0)
  }

  const handleRankChange = () => {}

  const totalParticipants = leaderboard.leaderboard.length
  const totalSubmissions = submissions.length
  const contestProgressTime = getDuration(contestStartTime, contestEndTime)
  const problemAccuracyRate = calculateProblemAccuracyRate({
    leaderboard,
    contestProblems,
    sortedSubmissions
  })
  const averageAccuracy = calculateWeightedAccuracy(problemAccuracyRate)
  //average accuracy rate

  if (submissions.length === 0) {
    return <NoSubmissionData />
  } else {
    return (
      <div>
        <div className="mb-4 flex h-[102px] w-full items-center justify-between">
          <div className="w-70 flex h-full flex-col justify-center rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div className="text-color-neutral-60 text-sm">
              Total Participants
            </div>
            <div className="text-color-neutral-90 text-2xl font-semibold">
              {' '}
              {totalParticipants}
            </div>
          </div>
          <div className="w-70 flex h-full flex-col justify-center rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div className="text-color-neutral-60 text-sm">
              Total Submissions
            </div>
            <div className="text-color-neutral-90 text-2xl font-semibold">
              {' '}
              {totalSubmissions}
            </div>
          </div>
          <div className="w-70 flex h-full flex-col justify-center rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div className="text-color-neutral-60 text-sm">
              Average Accuracy Rate
            </div>
            <div className="text-color-neutral-90 text-2xl font-semibold">
              {' '}
              {averageAccuracy.toFixed(2)}%
            </div>
          </div>
          <div className="flex h-full w-[344px] flex-col justify-center rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div className="text-color-neutral-60 text-sm">
              Contest Progress Time
            </div>
            <div className="text-color-neutral-90 text-2xl font-semibold">
              {' '}
              {contestProgressTime}
            </div>
          </div>
        </div>

        <TimeSlider
          currentSubmissionIndex={currentSubmissionIndex}
          submissionCount={sortedSubmissions.length}
          onSliderChange={handleSliderChange}
          onReset={handleReset}
          contestStartTime={contestStartTime}
          contestEndTime={contestEndTime}
          currentSubmissionTime={currentSubmissionTime}
        />
        <LeaderBoardTable
          users={currentData.users}
          problems={contestProblems}
        />
      </div>
    )
  }
}
