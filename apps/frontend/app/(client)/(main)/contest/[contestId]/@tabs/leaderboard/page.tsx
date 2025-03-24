'use client'

import { Input } from '@/components/shadcn/input'
import SearchIcon from '@/public/icons/search.svg'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LeaderboardModalDialog } from './_components/LeaderboardModalDialog'
import { LeaderboardTable } from './_components/LeaderboardTable'
import { getContestLeaderboard } from './_libs/apis/getContesLeaderboard'
import { handleSearch } from './_libs/utils'

const BaseLeaderboardUser = {
  username: '',
  totalScore: 0,
  totalPenalty: 0,
  problemRecords: [
    {
      order: 0,
      problemId: 1,
      penalty: 0,
      submissionCount: 0,
      score: 0,
      isFrozen: false,
      isFirstSolver: false
    }
  ],
  rank: 1
}
const BaseContestLeaderboardData = {
  maxScore: 0,
  leaderboard: [BaseLeaderboardUser]
}

export default function ContestLeaderBoard() {
  const [searchText, setSearchText] = useState('')
  const pathname = usePathname()
  const contestId = Number(pathname.split('/')[2])

  let { data } = useQuery({
    queryKey: ['contest leaderboard'],
    queryFn: () => getContestLeaderboard({ contestId })
  })
  data = data ? data : BaseContestLeaderboardData
  const [problemSize, setProblemSize] = useState(0)
  const [leaderboardUsers, setLeaderboardUsers] = useState([
    BaseLeaderboardUser
  ])

  useEffect(() => {
    setProblemSize(data ? data.leaderboard[0].problemRecords.length : 0)
    setLeaderboardUsers(data ? data.leaderboard : [BaseLeaderboardUser])
  }, [data])

  return (
    <div className="relative ml-[116px] w-screen pb-[120px]">
      <div className="mt-[96px] flex flex-row">
        <div className="h-[34px] text-[24px] font-bold">
          CHECK YOUR RANKING!
        </div>
        <LeaderboardModalDialog />
      </div>
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
