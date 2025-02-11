import { fetcher } from '@/libs/utils'
import type { ContestLeaderboard, Leaderboard } from '@/types/type'
import React from 'react'
import { columns } from './LeaderboardColumns'
import { LeaderboardDataTable } from './LeaderboardDataTable'

interface LeaderboardTableProps {
  contestId: string
  search: string
}

// Use Temp data until api is ready
const tmp = {
  maxScore: 60,
  leaderboard: [
    {
      user: {
        username: 'super'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [
        {
          score: 0,
          order: 0,
          problemId: 1,
          penalty: 0,
          submissionCount: 0
        },
        {
          score: 0,
          order: 1,
          problemId: 2,
          penalty: 0,
          submissionCount: 0
        },
        {
          score: 0,
          order: 2,
          problemId: 3,
          penalty: 0,
          submissionCount: 0
        },
        {
          score: 0,
          order: 3,
          problemId: 4,
          penalty: 0,
          submissionCount: 0
        },
        {
          score: 0,
          order: 4,
          problemId: 5,
          penalty: 0,
          submissionCount: 0
        }
      ],
      rank: 1
    },
    {
      user: {
        username: 'admin'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 2
    },
    {
      user: {
        username: 'manager'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 3
    },
    {
      user: {
        username: 'user01'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 4
    },
    {
      user: {
        username: 'user02'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 5
    },
    {
      user: {
        username: 'user03'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 6
    },
    {
      user: {
        username: 'user04'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 7
    },
    {
      user: {
        username: 'user05'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 8
    },
    {
      user: {
        username: 'user06'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 9
    },
    {
      user: {
        username: 'user07'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 10
    },
    {
      user: {
        username: 'user08'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 11
    },
    {
      user: {
        username: 'user09'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 12
    },
    {
      user: {
        username: 'user10'
      },
      score: 0,
      finalScore: 0,
      totalPenalty: 0,
      finalTotalPenalty: 0,
      problemRecords: [],
      rank: 13
    }
  ]
}

const fetchContestLeaderboardWithId = async (
  search: string,
  contestId: string
) => {
  const data: ContestLeaderboard[] = await fetcher
    .get(`contest/${contestId}/leaderboard`, {
      searchParams: {
        search
      }
    })
    .json()
  console.log(data)
  data.map((item, index) => ({
    ...item,
    id: index
  }))
  return data
}

export function LeaderboardTable({ contestId, search }: LeaderboardTableProps) {
  // TODO: 백엔드에서 로그인 해야만 fetch 되게 해놓음 -> 비로그인 상태에서도 fetch 되게 수정 필요 (api 수정되면 추후 정상 작동 예정)
  // const leaderboardData = await fetchContestLeaderboardWithId(search, contestId)
  const updatedTmp = tmp.leaderboard.map((item, index) => ({
    ...item,
    id: index
  }))

  return (
    <LeaderboardDataTable
      data={updatedTmp}
      columns={columns}
      headerStyle={{
        rank: 'text-[#3333334D] text-sm w-1/5 md:w-[5%]',
        username: 'text-[#3333334D] text-sm w-2/5 md:w-[13%]',
        a: 'text-[#3333334D] text-xs w-[5%]',
        b: 'text-[#3333334D] text-xs w-[5%]',
        c: 'text-[#3333334D] text-xs w-[5%]',
        d: 'text-[#3333334D] text-xs w-[5%]',
        e: 'text-[#3333334D] text-xs w-[5%]',
        f: 'text-[#3333334D] text-xs w-[5%]',
        g: 'text-[#3333334D] text-xs w-[5%]',
        h: 'text-[#3333334D] text-xs w-[5%]',
        i: 'text-[#3333334D] text-xs w-[5%]',
        j: 'text-[#3333334D] text-xs w-[5%]',
        k: 'text-[#3333334D] text-xs w-[5%]',
        l: 'text-[#3333334D] text-xs w-[5%]',
        totalPenalty: 'text-[#3333334D] text-sm w-1/5 md:w-[10%]',
        solved: 'text-[#3333334D] text-sm w-1/5 md:w-[10%]'
      }}
    />
  )
}
