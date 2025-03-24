'use client'

import { Input } from '@/components/shadcn/input'
import { GET_CONTEST_LEADERBOARD } from '@/graphql/leaderboard/queries'
import SearchIcon from '@/public/icons/search.svg'
import { useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LeaderboardTable } from './_components/LeaderboardTable'
import { handleSearch } from './_libs/utils'

const BaseLeaderboardUser = {
  rank: 1,
  userId: 1,
  username: '',
  finalScore: 0,
  finalTotalPenalty: 0,
  problemRecords: [
    {
      order: 0,
      problemId: 1,
      score: 0,
      penalty: 0,
      submissionCount: 0,
      isFirstSolver: false
    }
  ]
}

export default function ContestLeaderBoard() {
  const [searchText, setSearchText] = useState('')
  const pathname = usePathname()
  const contestId = Number(pathname.split('/')[3])
  console.log('contest id: ', contestId)

  const { data } = useSuspenseQuery(GET_CONTEST_LEADERBOARD, {
    variables: { contestId }
  })
  console.log('data: ', data)

  const [problemSize, setProblemSize] = useState(0)
  const [leaderboardUsers, setLeaderboardUsers] = useState([
    BaseLeaderboardUser
  ])

  useEffect(() => {
    setProblemSize(
      data ? data.getContestLeaderboard.leaderboard[0].problemRecords.length : 0
    )
    setLeaderboardUsers(
      data ? data.getContestLeaderboard.leaderboard : [BaseLeaderboardUser]
    )
  }, [data])

  return (
    <div className="relative ml-[116px] w-screen pb-[120px]">
      <div className="relative mb-[62px] mt-[30px]">
        <Image
          src={SearchIcon}
          alt="search"
          className="absolute left-5 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => {
            handleSearch(searchText)
          }}
        />
        <Input
          placeholder="Search"
          className="w-[600px] pl-[52px] text-[18px] font-normal"
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchText)
            }
          }}
        />
      </div>
      <div>
        <LeaderboardTable
          problemSize={problemSize}
          leaderboardUsers={leaderboardUsers}
        />
      </div>
    </div>
  )
}
