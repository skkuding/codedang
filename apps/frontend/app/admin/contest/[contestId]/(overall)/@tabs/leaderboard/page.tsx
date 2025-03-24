'use client'

import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
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
    <div className="relative mt-9 w-screen pb-[120px]">
      <div className="h-[93px] w-[1002px] rounded-xl border border-[#619CFB] pl-[30px] pt-[21px]">
        <div className="flex flex-row">
          <div className="mr-3 text-xl font-semibold text-[#3581FA]">
            Unfreeze Leaderboard
          </div>
          <Switch
            className="h-[24px] w-[46px]"
            thumbClassName="w-[18px] h-[18px] data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
          />
        </div>
        <div className="font-[14px] font-normal text-[#9B9B9B]">
          The leaderboard can only be unfrozen after the contest has finished.
        </div>
      </div>
      <div className="mb-[62px] mt-[60px] flex flex-row">
        <div className="mr-[167px] text-2xl font-semibold text-black">
          83/89 Participants
        </div>
        <div className="relative">
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
