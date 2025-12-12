import type { Leaderboard } from '@/types/type'
import type { ContestTop } from '@/types/type'
import { sub } from 'date-fns'
import React, { useState, useMemo } from 'react'
import { calculateRankingHistory } from './_leaderboardcomponents/_libs/CalculateLeaderBoard'
import contestMetadataMock from './_leaderboardcomponents/contestMetadataMock.json'
import contestProblemsMock from './_leaderboardcomponents/contestProblemMock.json'
import leaderboardMock from './_leaderboardcomponents/leaderboardMock.json'
import submissionsMock from './_leaderboardcomponents/submissionMock.json'

export function RealtimeLearBoardPage() {
  const contestStartTime = new Date(contestMetadataMock.startTime).getTime()
  const contestEndTime = new Date(contestMetadataMock.endTime).getTime()

  const sortedSubmissions = useMemo(() => {
    return [...submissionsMock].sort(
      (a, b) => parseInt(a.submissionTime) - parseInt(b.submissionTime)
    )
  }, [])

  const leaderboardHistory = useMemo(() => {
    return calculateRankingHistory({
      sortedSubmissions,
      leaderboard: leaderboardMock,
      contestMetadata: contestMetadataMock,
      contestProblems: contestProblemsMock
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
    return submission ? parseInt(submission.submissionTime) : null
  }, [currentSubmissionIndex, sortedSubmissions])

  const handleSliderChange = (index: number) => {
    setCurrentSubmissionIndex(index)
  }

  const handleReset = () => {
    setCurrentSubmissionIndex(0)
  }

  const handleRankChange = () => {}

  return <p>Realtime Leaderboard Tab</p>
}
